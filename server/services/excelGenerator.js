const ExcelJS = require('exceljs');

function formatCurrency(amount) {
    if (amount == null) return '₹0';
    return '₹' + amount.toLocaleString('en-IN');
}

function applyHeaderStyle(row) {
    row.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            bottom: { style: 'thin', color: { argb: 'FF1E3A5F' } }
        };
    });
    row.height = 25;
}

function applyDataStyle(row, status) {
    row.eachCell(cell => {
        cell.font = { size: 10 };
        cell.alignment = { vertical: 'middle' };
        cell.border = {
            bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } }
        };
    });
    if (status === 'pending') {
        row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        });
    } else if (status === 'partial') {
        row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };
        });
    }
}

async function generateMonthlyExcel(monthData, payments, chitSettings) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = chitSettings?.name || "MANI'S CHIT FUND";

    const sheet = workbook.addWorksheet(`${monthData.month_label} Collection`);

    // Title
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `${chitSettings?.name || "MANI'S CHIT FUND"} — ${monthData.month_label} (${monthData.calendar_month})`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    titleCell.alignment = { horizontal: 'center' };

    // Summary row
    const expected = payments.reduce((s, p) => s + p.amount_due, 0);
    const collected = payments.reduce((s, p) => s + p.amount_paid, 0);
    const pending = payments.reduce((s, p) => s + p.remaining_amount, 0);

    sheet.mergeCells('A2:G2');
    sheet.getCell('A2').value = `Expected: ${formatCurrency(expected)}  |  Collected: ${formatCurrency(collected)}  |  Pending: ${formatCurrency(pending)}`;
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    // Headers
    const headers = ['Member', 'Member ID', 'Amount Due', 'Amount Paid', 'Remaining', 'Status', 'Payment Date'];
    const headerRow = sheet.addRow(headers);
    applyHeaderStyle(headerRow);

    sheet.columns = [
        { width: 25 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 }, { width: 15 }
    ];

    payments.forEach(p => {
        const statusText = p.status === 'paid' ? 'PAID' : p.status === 'partial' ? 'PARTIAL' : 'PENDING';
        const row = sheet.addRow([
            p.name || p.member_name || '',
            p.member_code || '',
            formatCurrency(p.amount_due),
            formatCurrency(p.amount_paid),
            formatCurrency(p.remaining_amount),
            statusText,
            p.payment_date || '—'
        ]);
        applyDataStyle(row, p.status);
    });

    // Totals
    const totalRow = sheet.addRow(['TOTAL', '', formatCurrency(expected), formatCurrency(collected), formatCurrency(pending), '', '']);
    totalRow.eachCell(cell => { cell.font = { bold: true, size: 11 }; });

    return workbook.xlsx.writeBuffer();
}

async function generateMemberStatementExcel(memberData, payments, chitSettings) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = chitSettings?.name || "MANI'S CHIT FUND";

    const sheet = workbook.addWorksheet('Member Statement');

    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `${chitSettings?.name || "MANI'S CHIT FUND"} — Member Statement`;
    sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.getCell('A3').value = `Member: ${memberData.name}`;
    sheet.getCell('A3').font = { bold: true };
    sheet.getCell('A4').value = `ID: ${memberData.member_code}`;
    sheet.getCell('A5').value = `Lift Status: ${memberData.lift_status === 'lifted' ? 'Lifted' : 'Not Lifted'}`;
    sheet.getCell('D3').value = `Chit Value: ${formatCurrency(chitSettings?.chit_value || 500000)}`;
    sheet.getCell('D3').font = { bold: true };
    sheet.getCell('D4').value = `Receivable: ${memberData.receivable_amount ? formatCurrency(memberData.receivable_amount) : 'N/A'}`;

    const headers = ['Month', 'Calendar', 'Due', 'Paid', 'Remaining', 'Status'];
    const headerRow = sheet.addRow([]);
    const headerRow2 = sheet.addRow(headers);
    applyHeaderStyle(headerRow2);

    sheet.columns = [
        { width: 12 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 }
    ];

    let totalDue = 0, totalPaid = 0, totalPending = 0;
    payments.forEach(p => {
        totalDue += p.amount_due;
        totalPaid += p.amount_paid;
        totalPending += p.remaining_amount;
        const statusText = p.status === 'paid' ? 'PAID' : p.status === 'partial' ? 'PARTIAL' : 'PENDING';
        const row = sheet.addRow([
            p.month_label || `Month ${p.month_id}`,
            p.calendar_month || '',
            formatCurrency(p.amount_due),
            formatCurrency(p.amount_paid),
            formatCurrency(p.remaining_amount),
            statusText
        ]);
        applyDataStyle(row, p.status);
    });

    const totalRow = sheet.addRow(['TOTAL', '', formatCurrency(totalDue), formatCurrency(totalPaid), formatCurrency(totalPending), '']);
    totalRow.eachCell(cell => { cell.font = { bold: true, size: 11 }; });

    return workbook.xlsx.writeBuffer();
}

async function generatePendingExcel(pendingPayments, chitSettings) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pending Payments');

    sheet.mergeCells('A1:G1');
    sheet.getCell('A1').value = `${chitSettings?.name || "MANI'S CHIT FUND"} — Pending Payments`;
    sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    const headers = ['Member', 'ID', 'Month', 'Due', 'Paid', 'Remaining', 'Status'];
    const headerRow = sheet.addRow(headers);
    applyHeaderStyle(headerRow);

    sheet.columns = [
        { width: 25 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 }
    ];

    pendingPayments.forEach(p => {
        const statusText = p.status === 'partial' ? 'PARTIAL' : 'PENDING';
        const row = sheet.addRow([
            p.name || p.member_name || '',
            p.member_code || '',
            p.month_label || '',
            formatCurrency(p.amount_due),
            formatCurrency(p.amount_paid),
            formatCurrency(p.remaining_amount),
            statusText
        ]);
        applyDataStyle(row, p.status);
    });

    return workbook.xlsx.writeBuffer();
}

async function generateCompleteExcel(allPayments, members, months, chitSettings) {
    const workbook = new ExcelJS.Workbook();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.mergeCells('A1:F1');
    summarySheet.getCell('A1').value = `${chitSettings?.name || "MANI'S CHIT FUND"} — Complete Report`;
    summarySheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };

    const summaryHeaders = ['Member', 'ID', 'Total Due', 'Total Paid', 'Total Pending', 'Lift Status'];
    const sHeaderRow = summarySheet.addRow(summaryHeaders);
    applyHeaderStyle(sHeaderRow);

    summarySheet.columns = [
        { width: 25 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    (members || []).forEach(m => {
        const mPayments = allPayments.filter(p => p.member_id === m.id);
        const mDue = mPayments.reduce((s, p) => s + p.amount_due, 0);
        const mPaid = mPayments.reduce((s, p) => s + p.amount_paid, 0);
        const mPending = mPayments.reduce((s, p) => s + p.remaining_amount, 0);
        const row = summarySheet.addRow([
            m.name,
            m.member_code,
            formatCurrency(mDue),
            formatCurrency(mPaid),
            formatCurrency(mPending),
            m.lift_status === 'lifted' ? 'Lifted' : 'Not Lifted'
        ]);
        applyDataStyle(row);
    });

    // Detail sheet
    const detailSheet = workbook.addWorksheet('All Payments');
    const dHeaders = ['Member', 'ID', 'Month', 'Calendar', 'Due', 'Paid', 'Remaining', 'Status'];
    const dHeaderRow = detailSheet.addRow(dHeaders);
    applyHeaderStyle(dHeaderRow);

    detailSheet.columns = [
        { width: 25 }, { width: 12 }, { width: 12 }, { width: 18 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 }
    ];

    allPayments.forEach(p => {
        const statusText = p.status === 'paid' ? 'PAID' : p.status === 'partial' ? 'PARTIAL' : 'PENDING';
        const row = detailSheet.addRow([
            p.name || p.member_name || '',
            p.member_code || '',
            p.month_label || '',
            p.calendar_month || '',
            formatCurrency(p.amount_due),
            formatCurrency(p.amount_paid),
            formatCurrency(p.remaining_amount),
            statusText
        ]);
        applyDataStyle(row, p.status);
    });

    return workbook.xlsx.writeBuffer();
}

async function generateLiftExcel(lifts, chitSettings) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Chit Lifts');

    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `${chitSettings?.name || "MANI'S CHIT FUND"} — Chit Lift Report`;
    sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    const headers = ['Month', 'Calendar', 'Member', 'ID', 'Receivable Amount', 'Lift Date'];
    const headerRow = sheet.addRow(headers);
    applyHeaderStyle(headerRow);

    sheet.columns = [
        { width: 12 }, { width: 20 }, { width: 25 }, { width: 12 }, { width: 18 }, { width: 15 }
    ];

    lifts.forEach(l => {
        sheet.addRow([
            l.month_label || '',
            l.calendar_month || '',
            l.name || l.member_name || 'Not Assigned',
            l.member_code || '—',
            formatCurrency(l.receivable_amount),
            l.lift_date || '—'
        ]);
    });

    return workbook.xlsx.writeBuffer();
}

module.exports = {
    generateMonthlyExcel,
    generateMemberStatementExcel,
    generatePendingExcel,
    generateCompleteExcel,
    generateLiftExcel
};
