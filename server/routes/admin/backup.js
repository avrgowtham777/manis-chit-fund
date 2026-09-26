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

// One-Click Clean Reset Database to October 2026 starting state
router.post('/reset', async (req, res) => {
    try {
        const db = getDb();

        db.exec('BEGIN TRANSACTION');

        // Clear all transactional and user data
        db.exec('DELETE FROM audit_logs');
        db.exec('DELETE FROM notifications');
        db.exec('DELETE FROM payments');
        db.exec('DELETE FROM users');
        db.exec('DELETE FROM members');
        db.exec('DELETE FROM months');
        db.exec('DELETE FROM chit_settings');

        // 1. Recreate Admin
        const adminHash = await bcrypt.hash('Admin@123', 12);
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', adminHash, 'admin');

        // 2. Recreate Chit Settings (October 2026 start)
        db.prepare(`
            INSERT INTO chit_settings (name, chit_value, duration, pre_lift_payment, post_lift_payment, start_month, start_year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("MANI'S CHIT FUND", 500000, 23, 23000, 25000, 'October', 2026);

        // 3. Recreate 23 Months (October 2026 - August 2028)
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

        // 5. Recreate Initial 345 Payments (₹23,000 pending, ₹0 paid)
        for (const memberId of memberIds) {
            for (const monthId of monthIds) {
                db.prepare('INSERT INTO payments (member_id, month_id, amount_due, amount_paid, remaining_amount, status) VALUES (?, ?, ?, 0, ?, ?)').run(memberId, monthId, 23000, 23000, 'pending');
            }
        }

        logAudit(db, {
            userId: req.user.id,
            action: 'system_reset',
            entityType: 'system',
            entityId: 0,
            newValue: { message: 'Database reset to initial clean state' },
            ipAddress: req.ip
        });

        db.exec('COMMIT');
        res.json({ success: true, message: 'All data successfully reset to the initial starting state!' });
    } catch (err) {
        try { const db = getDb(); db.exec('ROLLBACK'); } catch (_) {}
        console.error('Reset error:', err);
        res.status(500).json({ error: 'Failed to reset database: ' + err.message });
    }
});

module.exports = router;
