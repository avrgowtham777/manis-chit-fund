const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../services/auditLogger');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user || !user.active) {
        logAudit(db, {
            userId: null,
            action: 'login_failed',
            entityType: 'auth',
            entityId: 0,
            newValue: { username, status: 'Failed (Unknown or Inactive User)' },
            reason: 'Invalid username or inactive account',
            ipAddress: req.ip
        });
        return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        logAudit(db, {
            userId: user.id,
            action: 'login_failed',
            entityType: 'auth',
            entityId: user.id,
            newValue: { username: user.username, role: user.role, status: 'Failed (Wrong Password)' },
            reason: 'Incorrect password entered',
            ipAddress: req.ip
        });
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        memberId: user.member_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    logAudit(db, {
        userId: user.id,
        action: 'login_success',
        entityType: 'auth',
        entityId: user.id,
        newValue: { username: user.username, role: user.role, status: 'Login Successful' },
        reason: 'Authenticated via password',
        ipAddress: req.ip
    });

    res.json({ token, user: payload });
});

router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

router.post('/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Old and new passwords required' });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid old password' });

    const newHash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    logAudit(db, {
        userId: req.user.id,
        action: 'change_password',
        entityType: 'auth',
        entityId: req.user.id,
        ipAddress: req.ip
    });

    res.json({ success: true });
});

module.exports = router;
