const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };
const { logAudit } = require('../../services/auditLogger');

router.get('/', (req, res) => {
    let query = 'SELECT p.*, m.name as member_name, mo.calendar_month FROM payments p JOIN members m ON p.member_id = m.id JOIN months mo ON p.month_id = mo.id WHERE 1=1';
    const params = [];
    if (req.query.monthId) {
        query += ' AND p.month_id = ?';
        params.push(req.query.monthId);
    }
    if (req.query.status) {
        query += ' AND p.status = ?';
        params.push(req.query.status);
    }
    if (req.query.memberId) {
        query += ' AND p.member_id = ?';
        params.push(req.query.memberId);
    }
    const payments = db.prepare(query).all(...params);
    res.json(payments);
});

router.get('/pending', (req, res) => {
    const payments = db.prepare('SELECT p.*, m.name as member_name, mo.calendar_month FROM payments p JOIN members m ON p.member_id = m.id JOIN months mo ON p.month_id = mo.id WHERE p.status IN ("pending", "partial")').all();
    res.json(payments);
});

router.get('/month/:monthId', (req, res) => {
    const payments = db.prepare('SELECT p.*, m.name as member_name, m.member_code FROM payments p JOIN members m ON p.member_id = m.id WHERE p.month_id = ?').all(req.params.monthId);
    let expected = 0, collected = 0, pending = 0;
    payments.forEach(p => {
        expected += p.amount_due;
        collected += p.amount_paid;
        pending += p.remaining_amount;
    });
    res.json({ expected, collected, pending, payments });
});

router.post('/', (req, res) => {
    const { memberId, monthId, amountPaid, paymentDate, paymentMethod, transactionReference, notes } = req.body;
    
    if (!memberId || !monthId || amountPaid == null) {
        return res.status(400).json({ error: 'memberId, monthId, and amountPaid are required' });
    }

    db.exec('BEGIN TRANSACTION');
    try {
        const current = db.prepare('SELECT * FROM payments WHERE member_id=? AND month_id=?').get(memberId, monthId);
        if (!current) throw new Error("Payment record not found");

        const month = db.prepare('SELECT * FROM months WHERE id=?').get(monthId);
        const member = db.prepare('SELECT * FROM members WHERE id=?').get(memberId);

        const newTotalPaid = current.amount_paid + amountPaid;
        const newRemaining = Math.max(0, current.amount_due - newTotalPaid);
        let status = 'pending';
        if (newRemaining <= 0) status = 'paid';
        else if (newTotalPaid > 0) status = 'partial';

        let receiptNum = null;
        if (amountPaid > 0) {
            const count = db.prepare('SELECT COUNT(*) as c FROM payments WHERE receipt_number IS NOT NULL').get().c;
            receiptNum = `MCF-${String(count + 1).padStart(6, '0')}`;
        }

        db.prepare(`
            UPDATE payments SET amount_paid=?, remaining_amount=?, payment_date=?, payment_method=?, transaction_reference=?, receipt_number=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        `).run(newTotalPaid, newRemaining, paymentDate, paymentMethod, transactionReference, receiptNum || current.receipt_number, status, notes, current.id);

        const statusEmoji = status === 'paid' ? '🟢' : status === 'partial' ? '🟠' : '🔴';
        const monthLabel = month ? month.month_label : `Month ${monthId}`;
        if (amountPaid > 0) {
            db.prepare('INSERT INTO notifications (member_id, title, message, type) VALUES (?, ?, ?, ?)').run(
                memberId, "Payment Received", 
                `${statusEmoji} Your ${monthLabel} payment of ₹${amountPaid.toLocaleString('en-IN')} has been recorded. Status: ${status.toUpperCase()}.`, 
                'payment'
            );
        }

        logAudit(db, {
            userId: req.user.id, action: 'record_payment', entityType: 'payment', entityId: current.id,
            oldValue: { amount_paid: current.amount_paid, remaining: current.remaining_amount, status: current.status },
            newValue: { amount_paid: newTotalPaid, remaining: newRemaining, status }, 
            ipAddress: req.ip
        });

        db.exec('COMMIT');

        // Return full payment data for receipt display
        const updatedPayment = db.prepare(`
            SELECT p.*, m.month_label, m.calendar_month 
            FROM payments p JOIN months m ON p.month_id = m.id 
            WHERE p.id=?
        `).get(current.id);

        res.json({ 
            success: true, 
            receipt_number: receiptNum, 
            payment: updatedPayment,
            member: { name: member.name, member_code: member.member_code, phone: member.phone }
        });
    } catch(e) {
        console.error('PAYMENT POST ERROR:', e);
        try { db.exec('ROLLBACK'); } catch(_) {}
        res.status(500).json({ error: e.message });
    }
});

router.put('/:id', (req, res) => {
    const { amount_due, amount_paid, payment_date, payment_method, transaction_reference, status, notes, reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reason for edit required' });

    const current = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Not found' });

    const remaining = amount_due - amount_paid;

    db.prepare(`
        UPDATE payments SET amount_due=?, amount_paid=?, remaining_amount=?, payment_date=?, payment_method=?, transaction_reference=?, status=?, notes=?
        WHERE id=?
    `).run(amount_due, amount_paid, remaining, payment_date, payment_method, transaction_reference, status, notes, req.params.id);

    logAudit(db, {
        userId: req.user.id, action: 'edit_payment', entityType: 'payment', entityId: req.params.id,
        oldValue: current, newValue: req.body, reason, ipAddress: req.ip
    });

    res.json({ success: true });
});

module.exports = router;
