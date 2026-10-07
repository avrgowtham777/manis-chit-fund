const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { getDb } = require('../../db/database');
const { logAudit } = require('../../services/auditLogger');
const { getSyncStatus, performCloudUpload } = require('../../services/cloudSync');

const dbPath = path.join(__dirname, '../../db/chitfund.db');

// Cloud Persistence Status
router.get('/cloud-status', (req, res) => {
    res.json(getSyncStatus());
});

// Trigger Manual Cloud Sync
router.post('/cloud-sync', async (req, res) => {
    try {
        const db = getDb();
        await performCloudUpload(db.getDbBuffer());
        res.json({ success: true, status: getSyncStatus(), message: 'Cloud database synchronized successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Manual cloud sync failed: ' + err.message });
    }
});

// Download database file
router.get('/download', (req, res) => {
    try {
        const db = getDb();
        const buffer = db.getDbBuffer();
        res.setHeader('Content-Type', 'application/x-sqlite3');
        res.setHeader('Content-Disposition', `attachment; filename="chitfund_backup_${new Date().toISOString().split('T')[0]}.db"`);
        res.send(buffer);
    } catch (e) {
        if (fs.existsSync(dbPath)) {
            res.download(dbPath);
        } else {
            res.status(500).json({ error: 'Database file not found' });
        }
    }
});

// One-Click Clean Reset: Clears payments & lifts to Month 1 starting state while PRESERVING ALL MEMBERS
router.post('/reset', async (req, res) => {
    try {
        const db = getDb();

        db.exec('BEGIN TRANSACTION');

        const existingMembers = db.prepare('SELECT id, member_code FROM members').all();

        if (existingMembers.length === 0) {
            // Fallback: If database is completely empty, initialize fresh
            db.exec('DELETE FROM audit_logs');
            db.exec('DELETE FROM notifications');
            db.exec('DELETE FROM payments');
            db.exec('DELETE FROM users');
            db.exec('DELETE FROM months');
            db.exec('DELETE FROM chit_settings');

            // 1. Recreate Admin
            const adminHash = await bcrypt.hash('Admin@123', 12);
            db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', adminHash, 'admin');

            // 2. Recreate Chit Settings
            db.prepare(`
                INSERT INTO chit_settings (name, chit_value, duration, pre_lift_payment, post_lift_payment, start_month, start_year)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run("MANI'S CHIT FUND", 500000, 23, 23000, 25000, 'October', 2026);

            // 3. Recreate 23 Months
            const receivableAmounts = [480000, 480000, 480000, 485000, 490000, 495000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 502000, 503000, 505000, 510000, 520000, 535000];
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let currentMonthIdx = 9; // October
            let currentYear = 2026;

            const monthIds = [];
            for (let i = 0; i < 23; i++) {
                const calendarMonth = `${monthNames[currentMonthIdx]} ${currentYear}`;
                const result = db.prepare(`
                    INSERT INTO months (month_number, month_label, calendar_month, receivable_amount)
                    VALUES (?, ?, ?, ?)
                `).run(i + 1, `Month ${i + 1}`, calendarMonth, receivableAmounts[i]);
                monthIds.push(result.lastInsertRowid);
                
                currentMonthIdx++;
                if (currentMonthIdx > 11) {
                    currentMonthIdx = 0;
                    currentYear++;
                }
            }

            // 4. Recreate 15 Members
            const memberNames = [
                'Siromani', 'Manjula', 'Mani Mallika (Chinnu friend)', 'Gold', 'Mallika (Chinnu friend)',
                'Aruna School', 'Saidulu', 'Lucky Akka', 'Krishna', 'Indhu',
                'Premalatha', 'Madhu', 'Surendra', 'Yerrodu', 'Mani Mallika (Chinnu friend)'
            ];

            const memberHash = await bcrypt.hash('Member@123', 12);
            const memberIds = [];
            for (let i = 0; i < 15; i++) {
                const codeNum = (i + 1).toString().padStart(3, '0');
                const memberCode = `MCF${codeNum}`;
                
                const memberResult = db.prepare('INSERT INTO members (member_code, name, status, lift_status) VALUES (?, ?, ?, ?)').run(memberCode, memberNames[i], 'active', 'not_lifted');
                const memberId = memberResult.lastInsertRowid;
                memberIds.push(memberId);

                db.prepare('INSERT INTO users (member_id, username, password_hash, role) VALUES (?, ?, ?, ?)').run(memberId, memberCode.toLowerCase(), memberHash, 'member');
            }

            // 5. Create Initial Payments
            for (const memberId of memberIds) {
                for (const monthId of monthIds) {
                    db.prepare('INSERT INTO payments (member_id, month_id, amount_due, amount_paid, remaining_amount, status) VALUES (?, ?, ?, 0, ?, ?)').run(memberId, monthId, 23000, 23000, 'pending');
                }
            }
        } else {
            // MEMBERS EXIST: PRESERVE ALL MEMBERS! Only reset transactions and lifts.
            
            // 1. Reset lift status on all members
            db.prepare(`
                UPDATE members 
                SET lift_status = 'not_lifted', 
                    lift_month_id = NULL, 
                    lift_date = NULL, 
                    receivable_amount = NULL
            `).run();

            // 2. Reset lift assignments on all months
            db.prepare(`
                UPDATE months 
                SET lifted_by_member_id = NULL, 
                    lift_date = NULL
            `).run();

            // 3. Clear payments, notifications, audit logs
            db.exec('DELETE FROM notifications');
            db.exec('DELETE FROM payments');

            // 4. Get pre-lift payment amount
            const settings = db.prepare('SELECT pre_lift_payment FROM chit_settings LIMIT 1').get();
            const preLift = settings ? settings.pre_lift_payment : 23000;

            const months = db.prepare('SELECT id FROM months').all();
            const insertPayment = db.prepare(`
                INSERT INTO payments (member_id, month_id, amount_due, amount_paid, remaining_amount, status)
                VALUES (?, ?, ?, 0, ?, 'pending')
            `);

            // 5. Recreate fresh pending payments for every existing member
            for (const member of existingMembers) {
                for (const month of months) {
                    insertPayment.run(member.id, month.id, preLift, preLift);
                }
            }
        }

        logAudit(db, {
            userId: req.user.id,
            action: 'system_reset',
            entityType: 'system',
            entityId: 0,
            newValue: { message: 'Transactions reset to Month 1 starting state. All members preserved.' },
            ipAddress: req.ip
        });

        db.exec('COMMIT');
        res.json({ success: true, message: 'All payments and lifts reset to starting month! All members preserved safely.' });
    } catch (err) {
        try { const db = getDb(); db.exec('ROLLBACK'); } catch (_) {}
        console.error('Reset error:', err);
        res.status(500).json({ error: 'Failed to reset: ' + err.message });
    }
});

module.exports = router;
