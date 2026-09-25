const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };
const { generateReceipt, createPdfBuffer } = require('../../services/pdfGenerator');

// All routes here expect memberId from req.user.memberId (from JWT)
// CRITICAL: Never use URL params for member identification

router.get('/profile', (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id=?').get(req.user.memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
    let liftMonth = null;
    if (member.lift_month_id) {
        liftMonth = db.prepare('SELECT * FROM months WHERE id=?').get(member.lift_month_id);
    }
    res.json({ member, settings, liftMonth });
});

router.get('/payments', (req, res) => {
    const payments = db.prepare(`
        SELECT p.*, m.month_label, m.calendar_month, m.month_number 
        FROM payments p 
        JOIN months m ON p.month_id = m.id 
        WHERE p.member_id=? 
        ORDER BY m.month_number
    `).all(req.user.memberId);
    res.json(payments);
});

router.get('/chit', (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id=?').get(req.user.memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
    let liftMonth = null;
    if (member.lift_month_id) {
        liftMonth = db.prepare('SELECT * FROM months WHERE id=?').get(member.lift_month_id);
    }
    // Determine current monthly payment
    const currentPayment = member.lift_status === 'lifted' ? settings.post_lift_payment : settings.pre_lift_payment;
    res.json({ 
        member, 
        settings, 
        liftMonth,
        currentPayment
    });
});

router.get('/notifications', (req, res) => {
    const notifs = db.prepare('SELECT * FROM notifications WHERE member_id=? ORDER BY created_at DESC').all(req.user.memberId);
    res.json(notifs);
});

router.put('/notifications/:id/read', (req, res) => {
    // Verify notification belongs to this member
    const notif = db.prepare('SELECT * FROM notifications WHERE id=? AND member_id=?').get(req.params.id, req.user.memberId);
    if (!notif) return res.status(404).json({ error: 'Not found or not authorized' });
    
    db.prepare('UPDATE notifications SET is_read=1 WHERE id=?').run(req.params.id);
    res.json({ success: true });
});

router.get('/receipts', (req, res) => {
    const receipts = db.prepare(`
        SELECT p.*, m.month_label, m.calendar_month, m.month_number 
        FROM payments p 
        JOIN months m ON p.month_id = m.id 
        WHERE p.member_id=? AND p.receipt_number IS NOT NULL 
        ORDER BY m.month_number
    `).all(req.user.memberId);
    res.json(receipts);
});

router.get('/receipts/:paymentId/pdf', async (req, res) => {
    try {
        // Verify payment belongs to this member
        const payment = db.prepare(`
            SELECT p.*, m.month_label, m.calendar_month 
            FROM payments p 
            JOIN months m ON p.month_id = m.id 
            WHERE p.id=? AND p.member_id=?
        `).get(req.params.paymentId, req.user.memberId);
        if (!payment) return res.status(404).json({ error: 'Not found or not authorized' });

        const member = db.prepare('SELECT * FROM members WHERE id=?').get(req.user.memberId);
        const chitSettings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();

        const docDefinition = generateReceipt(payment, member, chitSettings);
        const pdfBuffer = await createPdfBuffer(docDefinition);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${payment.receipt_number || 'unknown'}.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Receipt PDF error:', err);
        res.status(500).json({ error: 'Failed to generate receipt PDF' });
    }
});

router.get('/statement', (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id=?').get(req.user.memberId);
    const payments = db.prepare(`
        SELECT p.*, m.month_label, m.calendar_month, m.month_number 
        FROM payments p 
        JOIN months m ON p.month_id = m.id 
        WHERE p.member_id=? 
        ORDER BY m.month_number
    `).all(req.user.memberId);
    const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
    
    const totalDue = payments.reduce((s, p) => s + p.amount_due, 0);
    const totalPaid = payments.reduce((s, p) => s + p.amount_paid, 0);
    const totalPending = payments.reduce((s, p) => s + p.remaining_amount, 0);

    res.json({ member, payments, settings, totalDue, totalPaid, totalPending });
});

router.get('/dashboard', (req, res) => {
    const member = db.prepare('SELECT * FROM members WHERE id=?').get(req.user.memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const settings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
    const payments = db.prepare(`
        SELECT p.*, m.month_label, m.calendar_month, m.month_number 
        FROM payments p 
        JOIN months m ON p.month_id = m.id 
        WHERE p.member_id=? 
        ORDER BY m.month_number
    `).all(req.user.memberId);

    const totalPaid = payments.reduce((s, p) => s + p.amount_paid, 0);
    const totalPending = payments.reduce((s, p) => s + p.remaining_amount, 0);

    // Determine current payment amount
    const currentPayment = member.lift_status === 'lifted' ? settings.post_lift_payment : settings.pre_lift_payment;

    // Find current month payment (first pending or partial, or last one)
    let currentMonthPayment = payments.find(p => p.status === 'pending' || p.status === 'partial') || payments[payments.length - 1];

    // Unread notification count
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE member_id=? AND is_read=0').get(req.user.memberId).count;

    let liftMonth = null;
    if (member.lift_month_id) {
        liftMonth = db.prepare('SELECT * FROM months WHERE id=?').get(member.lift_month_id);
    }

    res.json({
        member,
        settings,
        totalPaid,
        totalPending,
        currentPayment,
        currentMonthPayment,
        liftMonth,
        unreadNotifications: unreadCount,
        payments
    });
});

module.exports = router;
