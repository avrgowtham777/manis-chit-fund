const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };

router.get('/', (req, res) => {
    const { dateFrom, dateTo, action, entityType, category, page = 1, limit = 100 } = req.query;
    let query = `
        SELECT a.*, u.username, u.role as user_role, m.name as member_name, m.member_code 
        FROM audit_logs a 
        LEFT JOIN users u ON a.user_id = u.id 
        LEFT JOIN members m ON u.member_id = m.id
        WHERE 1=1
    `;
    const params = [];

    if (category === 'logins') {
        query += ' AND a.action IN ("login", "login_success", "login_failed", "logout")';
    } else if (category === 'changes') {
        query += ' AND a.action NOT IN ("login", "login_success", "login_failed", "logout")';
    }

    if (dateFrom) { query += ' AND date(a.created_at) >= ?'; params.push(dateFrom); }
    if (dateTo) { query += ' AND date(a.created_at) <= ?'; params.push(dateTo); }
    if (action) { query += ' AND a.action = ?'; params.push(action); }
    if (entityType) { query += ' AND a.entity_type = ?'; params.push(entityType); }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const logs = db.prepare(query).all(...params);
    res.json(logs);
});

module.exports = router;
