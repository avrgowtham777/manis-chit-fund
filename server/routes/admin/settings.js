const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };
const { logAudit } = require('../../services/auditLogger');

router.get('/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
    res.json(settings);
});

router.put('/settings', (req, res) => {
    const { name, chit_value, duration, pre_lift_payment, post_lift_payment, start_month, start_year } = req.body;
    const current = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();

    db.prepare(`
        UPDATE chit_settings SET name=?, chit_value=?, duration=?, pre_lift_payment=?, post_lift_payment=?, start_month=?, start_year=?
        WHERE id=?
    `).run(name, chit_value, duration, pre_lift_payment, post_lift_payment, start_month, start_year, current.id);

    logAudit(db, {
        userId: req.user.id, action: 'update_settings', entityType: 'settings', entityId: current.id,
        oldValue: current, newValue: req.body, ipAddress: req.ip
    });

    res.json({ success: true });
});

router.get('/months', (req, res) => {
    const months = db.prepare('SELECT * FROM months ORDER BY month_number').all();
    res.json(months);
});

router.put('/months/:id', (req, res) => {
    const { calendar_month, receivable_amount } = req.body;
    const current = db.prepare('SELECT * FROM months WHERE id=?').get(req.params.id);
    
    db.prepare('UPDATE months SET calendar_month=?, receivable_amount=? WHERE id=?').run(calendar_month, receivable_amount, req.params.id);

    logAudit(db, {
        userId: req.user.id, action: 'update_month', entityType: 'month', entityId: req.params.id,
        oldValue: current, newValue: { calendar_month, receivable_amount }, ipAddress: req.ip
    });

    res.json({ success: true });
});

module.exports = router;
