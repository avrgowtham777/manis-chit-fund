const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };
const { logAudit } = require('../../services/auditLogger');

router.get('/', (req, res) => {
    const lifts = db.prepare(`
        SELECT m.id as month_id, m.month_label, m.calendar_month, m.receivable_amount, m.lift_date,
        mem.id as member_id, mem.name as member_name, mem.member_code
        FROM months m
        LEFT JOIN members mem ON m.lifted_by_member_id = mem.id
        ORDER BY m.month_number
    `).all();
    res.json(lifts);
});

router.post('/', (req, res) => {
    const { monthId, memberId, liftDate, notes, force } = req.body;

    db.exec('BEGIN TRANSACTION');
    try {
        const month = db.prepare('SELECT * FROM months WHERE id=?').get(monthId);
        if (month.lifted_by_member_id && !force) {
            db.exec('ROLLBACK');
            return res.status(409).json({ conflict: true, existingLifter: month.lifted_by_member_id });
        }

        const member = db.prepare('SELECT * FROM members WHERE id=?').get(memberId);
        if (member.lift_status === 'lifted' && !force) {
            db.exec('ROLLBACK');
            return res.status(409).json({ conflict: true, existingMonth: member.lift_month_id });
        }

        db.prepare('UPDATE months SET lifted_by_member_id=?, lift_date=? WHERE id=?').run(memberId, liftDate, monthId);
        db.prepare('UPDATE members SET lift_status="lifted", lift_month_id=?, lift_date=?, receivable_amount=? WHERE id=?')
          .run(monthId, liftDate, month.receivable_amount, memberId);

        const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
        db.prepare('UPDATE payments SET amount_due=? WHERE member_id=? AND month_id >= ?').run(settings.post_lift_payment, memberId, monthId);
        db.prepare('UPDATE payments SET remaining_amount = amount_due - amount_paid WHERE member_id=? AND month_id >= ?').run(memberId, monthId);

        db.prepare('INSERT INTO notifications (member_id, title, message, type) VALUES (?, ?, ?, ?)').run(
            memberId, "Chit Lifted", 
            `🎉 Your chit was lifted in ${month.month_label} (${month.calendar_month}). Receivable amount: ₹${month.receivable_amount.toLocaleString('en-IN')}. Your monthly payment is now ₹${settings.post_lift_payment.toLocaleString('en-IN')}.`, 
            'lift'
        );

        logAudit(db, { userId: req.user.id, action: 'assign_lift', entityType: 'lift', entityId: monthId, newValue: { memberId, liftDate }, ipAddress: req.ip });
        
        db.exec('COMMIT');
        res.json({ success: true });
    } catch(e) {
        db.exec('ROLLBACK');
        res.status(500).json({ error: e.message });
    }
});

router.put('/:monthId', (req, res) => {
    res.status(501).json({ error: 'Not implemented, please delete and reassign.' });
});

router.delete('/:monthId', (req, res) => {
    db.exec('BEGIN TRANSACTION');
    try {
        const month = db.prepare('SELECT * FROM months WHERE id=?').get(req.params.monthId);
        if (!month.lifted_by_member_id) {
            db.exec('ROLLBACK');
            return res.status(400).json({ error: 'No lifter assigned to this month.' });
        }
        const memberId = month.lifted_by_member_id;

        db.prepare('UPDATE months SET lifted_by_member_id=NULL, lift_date=NULL WHERE id=?').run(req.params.monthId);
        db.prepare('UPDATE members SET lift_status="not_lifted", lift_month_id=NULL, lift_date=NULL, receivable_amount=NULL WHERE id=?').run(memberId);

        const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
        db.prepare('UPDATE payments SET amount_due=? WHERE member_id=? AND month_id >= ?').run(settings.pre_lift_payment, memberId, req.params.monthId);
        db.prepare('UPDATE payments SET remaining_amount = amount_due - amount_paid WHERE member_id=? AND month_id >= ?').run(memberId, req.params.monthId);

        logAudit(db, { userId: req.user.id, action: 'remove_lift', entityType: 'lift', entityId: req.params.monthId, oldValue: month, ipAddress: req.ip });

        db.exec('COMMIT');
        res.json({ success: true });
    } catch (e) {
        db.exec('ROLLBACK');
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
