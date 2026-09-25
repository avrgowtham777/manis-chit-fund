const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };

router.get('/', (req, res) => {
    const { dateFrom, dateTo, memberId, action, entityType, page = 1, limit = 50 } = req.query;
    let query = 'SELECT a.*, u.username FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
    const params = [];

    if (dateFrom) { query += ' AND date(a.created_at) >= ?'; params.push(dateFrom); }
    if (dateTo) { query += ' AND date(a.created_at) <= ?'; params.push(dateTo); }
    if (action) { query += ' AND a.action = ?'; params.push(action); }
    if (entityType) { query += ' AND a.entity_type = ?'; params.push(entityType); }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const logs = db.prepare(query).all(...params);
    res.json(logs);
});

module.exports = router;
