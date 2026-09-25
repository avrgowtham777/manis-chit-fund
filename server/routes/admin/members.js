const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };
const bcrypt = require('bcryptjs');
const { logAudit } = require('../../services/auditLogger');

router.get('/', (req, res) => {
    const { search, status, liftStatus } = req.query;
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (name LIKE ? OR member_code LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (liftStatus) {
        query += ' AND lift_status = ?';
        params.push(liftStatus);
    }

    const members = db.prepare(query).all(...params);
    res.json(members);
});

router.get('/:id', (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    
    const payments = db.prepare('SELECT p.*, m.month_label, m.calendar_month FROM payments p JOIN months m ON p.month_id = m.id WHERE p.member_id = ? ORDER BY p.month_id').all(req.params.id);
    res.json({ member, payments });
});

router.post('/', async (req, res) => {
    const { name, phone, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    db.exec('BEGIN TRANSACTION');
    try {
        const lastMember = db.prepare('SELECT member_code FROM members ORDER BY id DESC LIMIT 1').get();
        let nextNum = 1;
        if (lastMember) {
            nextNum = parseInt(lastMember.member_code.replace('MCF', '')) + 1;
        }
        const newCode = `MCF${nextNum.toString().padStart(3, '0')}`;

        const insertMember = db.prepare('INSERT INTO members (member_code, name, phone, notes) VALUES (?, ?, ?, ?)');
        const result = insertMember.run(newCode, name, phone, notes);
        const memberId = result.lastInsertRowid;

        const hash = await bcrypt.hash('Member@123', 12);
        db.prepare('INSERT INTO users (member_id, username, password_hash, role) VALUES (?, ?, ?, ?)').run(
            memberId, newCode.toLowerCase(), hash, 'member'
        );

        const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
        const preLiftAmount = settings ? settings.pre_lift_payment : 23000;
        
        const months = db.prepare('SELECT id FROM months').all();
        const insertPayment = db.prepare('INSERT INTO payments (member_id, month_id, amount_due, amount_paid, remaining_amount, status) VALUES (?, ?, ?, 0, ?, "pending")');
        
        for (const m of months) {
            insertPayment.run(memberId, m.id, preLiftAmount, preLiftAmount);
        }

        logAudit(db, {
            userId: req.user.id, action: 'create', entityType: 'member', entityId: memberId, newValue: { name, phone, newCode }, ipAddress: req.ip
        });

        db.exec('COMMIT');
        res.status(201).json({ id: memberId, member_code: newCode });
    } catch (e) {
        db.exec('ROLLBACK');
        res.status(500).json({ error: e.message });
    }
});

router.put('/:id', (req, res) => {
    const { name, phone, notes, status } = req.body;
    const oldMember = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!oldMember) return res.status(404).json({ error: 'Not found' });

    db.prepare('UPDATE members SET name=?, phone=?, notes=?, status=? WHERE id=?').run(name, phone, notes, status || oldMember.status, req.params.id);
    
    logAudit(db, {
        userId: req.user.id, action: 'update', entityType: 'member', entityId: req.params.id, oldValue: oldMember, newValue: { name, phone, notes, status }, ipAddress: req.ip
    });

    res.json({ success: true });
});

router.put('/:id/archive', (req, res) => {
    db.exec('BEGIN TRANSACTION');
    try {
        db.prepare('UPDATE members SET status="archived" WHERE id=?').run(req.params.id);
        db.prepare('UPDATE users SET active=0 WHERE member_id=?').run(req.params.id);
        logAudit(db, { userId: req.user.id, action: 'archive', entityType: 'member', entityId: req.params.id, ipAddress: req.ip });
        db.exec('COMMIT');
        res.json({ success: true });
    } catch(e) {
        db.exec('ROLLBACK');
        res.status(500).json({ error: e.message });
    }
});

router.put('/:id/reactivate', (req, res) => {
    db.exec('BEGIN TRANSACTION');
    try {
        db.prepare('UPDATE members SET status="active" WHERE id=?').run(req.params.id);
        db.prepare('UPDATE users SET active=1 WHERE member_id=?').run(req.params.id);
        logAudit(db, { userId: req.user.id, action: 'reactivate', entityType: 'member', entityId: req.params.id, ipAddress: req.ip });
        db.exec('COMMIT');
        res.json({ success: true });
    } catch(e) {
        db.exec('ROLLBACK');
        res.status(500).json({ error: e.message });
    }
});

router.post('/:id/reset-password', async (req, res) => {
    const hash = await bcrypt.hash('Member@123', 12);
    db.prepare('UPDATE users SET password_hash=? WHERE member_id=?').run(hash, req.params.id);
    logAudit(db, { userId: req.user.id, action: 'reset_password', entityType: 'member', entityId: req.params.id, ipAddress: req.ip });
    res.json({ success: true });
});

module.exports = router;
