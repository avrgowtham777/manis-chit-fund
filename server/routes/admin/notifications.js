const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };

router.get('/summary', (req, res) => {
    const pendingCount = db.prepare('SELECT COUNT(*) as c FROM payments WHERE status="pending"').get().c;
    const partialCount = db.prepare('SELECT COUNT(*) as c FROM payments WHERE status="partial"').get().c;
    const completedCount = db.prepare('SELECT COUNT(*) as c FROM payments WHERE status="paid"').get().c;
    const unassignedLift = db.prepare('SELECT COUNT(*) as c FROM months WHERE lifted_by_member_id IS NULL AND month_number <= (SELECT COUNT(*) FROM months WHERE calendar_month <= strftime("%Y-%m", "now"))').get().c;

    res.json({ pendingCount, partialCount, completedCount, unassignedLift });
});

router.post('/send', (req, res) => {
    const { memberId, title, message, type } = req.body;
    db.prepare('INSERT INTO notifications (member_id, title, message, type) VALUES (?, ?, ?, ?)').run(
        memberId || null, title, message, type || 'general'
    );
    res.json({ success: true });
});

router.get('/', (req, res) => {
    const notifications = db.prepare('SELECT n.*, m.name, m.member_code FROM notifications n LEFT JOIN members m ON n.member_id = m.id ORDER BY n.created_at DESC LIMIT 100').all();
    res.json(notifications);
});

module.exports = router;
