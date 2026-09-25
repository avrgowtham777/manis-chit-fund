require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDatabase, getDb } = require('./db/database');

async function startServer() {
    // Initialize database first
    await initDatabase();
    console.log('Database initialized successfully.');

    const app = express();

    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors());
    app.use(express.json());

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    });

    app.use('/api/auth', authLimiter);

    // Import Middlewares
    const { authenticateToken, requireAdmin, requireMember } = require('./middleware/auth');

    // Import Routes
    const authRoutes = require('./routes/auth');
    const adminMembersRoutes = require('./routes/admin/members');
    const adminPaymentsRoutes = require('./routes/admin/payments');
    const adminChitLiftRoutes = require('./routes/admin/chitLift');
    const adminSettingsRoutes = require('./routes/admin/settings');
    const adminReportsRoutes = require('./routes/admin/reports');
    const adminAuditRoutes = require('./routes/admin/audit');
    const adminNotificationsRoutes = require('./routes/admin/notifications');
    const adminBackupRoutes = require('./routes/admin/backup');
    const memberRoutes = require('./routes/member');

    // Mount Routes
    app.use('/api/auth', authRoutes);

    app.use('/api/admin/members', authenticateToken, requireAdmin, adminMembersRoutes);
    app.use('/api/admin/payments', authenticateToken, requireAdmin, adminPaymentsRoutes);
    app.use('/api/admin/chit-lift', authenticateToken, requireAdmin, adminChitLiftRoutes);
    app.use('/api/admin/settings', authenticateToken, requireAdmin, adminSettingsRoutes);
    app.use('/api/admin/reports', authenticateToken, requireAdmin, adminReportsRoutes);
    app.use('/api/admin/audit', authenticateToken, requireAdmin, adminAuditRoutes);
    app.use('/api/admin/notifications', authenticateToken, requireAdmin, adminNotificationsRoutes);
    app.use('/api/admin/backup', authenticateToken, requireAdmin, adminBackupRoutes);

    app.use('/api/member', authenticateToken, requireMember, memberRoutes);

    // Static files and SPA fallback (for production)
    const clientDist = path.join(__dirname, '../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(clientDist, 'index.html'));
        } else {
            res.status(404).json({ error: 'API route not found' });
        }
    });

    // Global error handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`MANI'S CHIT FUND server running on port ${PORT}`);
        console.log(`Local Access:   http://localhost:${PORT}`);
        console.log(`Network Access: http://10.1.3.125:${PORT}`);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
