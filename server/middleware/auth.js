const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mani-chit-fund-secret-key-change-in-production';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Requires admin privileges' });
    }
    next();
}

function requireMember(req, res, next) {
    if (!req.user || req.user.role !== 'member') {
        return res.status(403).json({ error: 'Requires member privileges' });
    }
    next();
}

module.exports = {
    authenticateToken,
    requireAdmin,
    requireMember,
    JWT_SECRET
};
