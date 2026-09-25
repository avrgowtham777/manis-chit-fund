const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };
const { generateReceipt, generateMemberStatement, generateMonthlyReport, generatePendingReport, generateLiftReport, generateCompleteReport, createPdfBuffer } = require('../../services/pdfGenerator');
const { generateMonthlyExcel, generateMemberStatementExcel, generatePendingExcel, generateCompleteExcel, generateLiftExcel } = require('../../services/excelGenerator');

// Data endpoints
router.get('/monthly/:monthId', (req, res) => {
    const monthId = req.params.monthId;
    const month = db.prepare('SELECT * FROM months WHERE id=?').get(monthId);
    if (!month) return res.status(404).json({ error: 'Month not found' });
    const payments = db.prepare('SELECT p.*, m.name, m.member_code FROM payments p JOIN members m ON p.member_id = m.id WHERE p.month_id=?').all(monthId);
    res.json({ month, payments });
});

router.get('/member/:memberId', (req, res) => {
    const memberId = req.params.memberId;
    const member = db.prepare('SELECT * FROM members WHERE id=?').get(memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const payments = db.prepare('SELECT p.*, m.calendar_month, m.month_label FROM payments p JOIN months m ON p.month_id = m.id WHERE p.member_id=? ORDER BY p.month_id').all(memberId);
    res.json({ member, payments });
});

router.get('/pending', (req, res) => {
    const payments = db.prepare(`
        SELECT p.*, m.name, m.member_code, mo.calendar_month, mo.month_label 
        FROM payments p 
        JOIN members m ON p.member_id = m.id 
        JOIN months mo ON p.month_id = mo.id 
        WHERE p.status IN ('pending', 'partial')
        ORDER BY mo.month_number, m.name
    `).all();
    res.json(payments);
});

router.get('/lifts', (req, res) => {
    const lifts = db.prepare(`
        SELECT m.month_number, m.month_label, m.calendar_month, m.receivable_amount, m.lift_date, 
        mem.name, mem.member_code 
        FROM months m 
        LEFT JOIN members mem ON m.lifted_by_member_id = mem.id
        ORDER BY m.month_number
    `).all();
    res.json(lifts);
});

router.get('/complete', (req, res) => {
    const data = db.prepare(`
        SELECT p.*, m.name, m.member_code, mo.calendar_month, mo.month_label 
        FROM payments p 
        JOIN members m ON p.member_id = m.id 
        JOIN months mo ON p.month_id = mo.id 
        ORDER BY mo.month_number, m.name
    `).all();
    res.json(data);
});

// PDF Downloads
router.get('/download/pdf/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { monthId, memberId } = req.query;
        const chitSettings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
        let docDefinition;
        let filename;

        switch (type) {
            case 'monthly': {
                if (!monthId) return res.status(400).json({ error: 'monthId required' });
                const month = db.prepare('SELECT * FROM months WHERE id=?').get(monthId);
                if (!month) return res.status(404).json({ error: 'Month not found' });
                const payments = db.prepare('SELECT p.*, m.name, m.member_code FROM payments p JOIN members m ON p.member_id = m.id WHERE p.month_id=?').all(monthId);
                docDefinition = generateMonthlyReport(month, payments, chitSettings);
                filename = `monthly_report_month_${month.month_number}.pdf`;
                break;
            }
            case 'member': {
                if (!memberId) return res.status(400).json({ error: 'memberId required' });
                const member = db.prepare('SELECT * FROM members WHERE id=?').get(memberId);
                if (!member) return res.status(404).json({ error: 'Member not found' });
                const payments = db.prepare('SELECT p.*, m.calendar_month, m.month_label FROM payments p JOIN months m ON p.month_id = m.id WHERE p.member_id=? ORDER BY p.month_id').all(memberId);
                docDefinition = generateMemberStatement(member, payments, chitSettings);
                filename = `statement_${member.member_code}.pdf`;
                break;
            }
            case 'pending': {
                const payments = db.prepare(`
                    SELECT p.*, m.name, m.member_code, mo.calendar_month, mo.month_label 
                    FROM payments p JOIN members m ON p.member_id = m.id JOIN months mo ON p.month_id = mo.id 
                    WHERE p.status IN ('pending', 'partial') ORDER BY mo.month_number, m.name
                `).all();
                docDefinition = generatePendingReport(payments, chitSettings);
                filename = 'pending_payments.pdf';
                break;
            }
            case 'lifts': {
                const lifts = db.prepare(`
                    SELECT m.month_number, m.month_label, m.calendar_month, m.receivable_amount, m.lift_date, 
                    mem.name, mem.member_code 
                    FROM months m LEFT JOIN members mem ON m.lifted_by_member_id = mem.id ORDER BY m.month_number
                `).all();
                docDefinition = generateLiftReport(lifts, chitSettings);
                filename = 'chit_lift_report.pdf';
                break;
            }
            case 'complete': {
                const allPayments = db.prepare(`
                    SELECT p.*, m.name, m.member_code, mo.calendar_month, mo.month_label 
                    FROM payments p JOIN members m ON p.member_id = m.id JOIN months mo ON p.month_id = mo.id 
                    ORDER BY mo.month_number, m.name
                `).all();
                const members = db.prepare('SELECT * FROM members ORDER BY name').all();
                const months = db.prepare('SELECT * FROM months ORDER BY month_number').all();
                docDefinition = generateCompleteReport(allPayments, members, months, chitSettings);
                filename = 'complete_23_month_report.pdf';
                break;
            }
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        const pdfBuffer = await createPdfBuffer(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
    }
});

// Excel Downloads
router.get('/download/excel/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { monthId, memberId } = req.query;
        const chitSettings = db.prepare('SELECT * FROM chit_settings LIMIT 1').get();
        let buffer;
        let filename;

        switch (type) {
            case 'monthly': {
                if (!monthId) return res.status(400).json({ error: 'monthId required' });
                const month = db.prepare('SELECT * FROM months WHERE id=?').get(monthId);
                if (!month) return res.status(404).json({ error: 'Month not found' });
                const payments = db.prepare('SELECT p.*, m.name, m.member_code FROM payments p JOIN members m ON p.member_id = m.id WHERE p.month_id=?').all(monthId);
                buffer = await generateMonthlyExcel(month, payments, chitSettings);
                filename = `monthly_report_month_${month.month_number}.xlsx`;
                break;
            }
            case 'member': {
                if (!memberId) return res.status(400).json({ error: 'memberId required' });
                const member = db.prepare('SELECT * FROM members WHERE id=?').get(memberId);
                if (!member) return res.status(404).json({ error: 'Member not found' });
                const payments = db.prepare('SELECT p.*, m.calendar_month, m.month_label FROM payments p JOIN months m ON p.month_id = m.id WHERE p.member_id=? ORDER BY p.month_id').all(memberId);
                buffer = await generateMemberStatementExcel(member, payments, chitSettings);
                filename = `statement_${member.member_code}.xlsx`;
                break;
            }
            case 'pending': {
                const payments = db.prepare(`
                    SELECT p.*, m.name, m.member_code, mo.calendar_month, mo.month_label 
                    FROM payments p JOIN members m ON p.member_id = m.id JOIN months mo ON p.month_id = mo.id 
                    WHERE p.status IN ('pending', 'partial') ORDER BY mo.month_number, m.name
                `).all();
                buffer = await generatePendingExcel(payments, chitSettings);
                filename = 'pending_payments.xlsx';
                break;
            }
            case 'lifts': {
                const lifts = db.prepare(`
                    SELECT m.month_number, m.month_label, m.calendar_month, m.receivable_amount, m.lift_date, 
                    mem.name, mem.member_code 
                    FROM months m LEFT JOIN members mem ON m.lifted_by_member_id = mem.id ORDER BY m.month_number
                `).all();
                buffer = await generateLiftExcel(lifts, chitSettings);
                filename = 'chit_lift_report.xlsx';
                break;
            }
            case 'complete': {
                const allPayments = db.prepare(`
                    SELECT p.*, m.name, m.member_code, mo.calendar_month, mo.month_label 
                    FROM payments p JOIN members m ON p.member_id = m.id JOIN months mo ON p.month_id = mo.id 
                    ORDER BY mo.month_number, m.name
                `).all();
                const members = db.prepare('SELECT * FROM members ORDER BY name').all();
                const months = db.prepare('SELECT * FROM months ORDER BY month_number').all();
                buffer = await generateCompleteExcel(allPayments, members, months, chitSettings);
                filename = 'complete_23_month_report.xlsx';
                break;
            }
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error('Excel generation error:', err);
        res.status(500).json({ error: 'Failed to generate Excel: ' + err.message });
    }
});

module.exports = router;
