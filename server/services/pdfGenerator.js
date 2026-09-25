const PdfPrinter = require('pdfmake');

const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

const printer = new PdfPrinter(fonts);

function formatCurrency(amount) {
    if (amount == null) return '₹0';
    return '₹' + amount.toLocaleString('en-IN');
}

function generateReceipt(paymentData, memberData, chitSettings) {
    const statusText = paymentData.status === 'paid' ? '🟢 PAID' : paymentData.status === 'partial' ? '🟠 PARTIAL' : '🔴 PENDING';

    const docDefinition = {
        content: [
            { text: chitSettings.name || "MANI'S CHIT FUND", style: 'header', alignment: 'center' },
            { text: 'PAYMENT RECEIPT', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 15] },
            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { text: 'Member Details', style: 'sectionTitle' },
                            { text: `Name: ${memberData.name}`, margin: [0, 5, 0, 2] },
                            { text: `Member ID: ${memberData.member_code}`, margin: [0, 2, 0, 2] },
                            { text: `Phone: ${memberData.phone || 'N/A'}`, margin: [0, 2, 0, 2] },
                        ]
                    },
                    {
                        width: '50%',
                        stack: [
                            { text: 'Receipt Details', style: 'sectionTitle' },
                            { text: `Receipt No: ${paymentData.receipt_number || 'N/A'}`, margin: [0, 5, 0, 2] },
                            { text: `Date: ${paymentData.payment_date || 'N/A'}`, margin: [0, 2, 0, 2] },
                            { text: `Method: ${(paymentData.payment_method || 'N/A').toUpperCase()}`, margin: [0, 2, 0, 2] },
                        ]
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 0, 0, 15] },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                        [{ text: 'Description', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader', alignment: 'right' }],
                        ['Month', { text: paymentData.month_label || `Month ${paymentData.month_id}`, alignment: 'right' }],
                        ['Amount Due', { text: formatCurrency(paymentData.amount_due), alignment: 'right' }],
                        ['Amount Paid', { text: formatCurrency(paymentData.amount_paid), alignment: 'right', bold: true }],
                        ['Remaining', { text: formatCurrency(paymentData.remaining_amount), alignment: 'right' }],
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: (i) => i === 0 || i === 1 ? '#1e3a5f' : '#eeeeee',
                    paddingTop: () => 8,
                    paddingBottom: () => 8,
                },
                margin: [0, 0, 0, 20]
            },
            {
                columns: [
                    { text: `Status: ${statusText}`, bold: true, fontSize: 14 },
                    paymentData.transaction_reference ? { text: `Ref: ${paymentData.transaction_reference}`, alignment: 'right' } : {}
                ],
                margin: [0, 10, 0, 30]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 10] },
            { text: 'This is a system-generated receipt.', italics: true, fontSize: 9, alignment: 'center', color: '#888888' },
        ],
        styles: {
            header: { fontSize: 22, bold: true, color: '#1e3a5f' },
            subheader: { fontSize: 14, bold: true, color: '#d4a843' },
            sectionTitle: { fontSize: 12, bold: true, color: '#1e3a5f' },
            tableHeader: { bold: true, fontSize: 11, color: '#1e3a5f' },
        },
        defaultStyle: { fontSize: 11 },
        pageMargins: [40, 40, 40, 40],
    };

    return docDefinition;
}

function generateMemberStatement(memberData, payments, chitSettings) {
    const totalDue = payments.reduce((sum, p) => sum + p.amount_due, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalPending = payments.reduce((sum, p) => sum + p.remaining_amount, 0);

    const tableBody = [
        [
            { text: 'Month', style: 'tableHeader' },
            { text: 'Due', style: 'tableHeader', alignment: 'right' },
            { text: 'Paid', style: 'tableHeader', alignment: 'right' },
            { text: 'Remaining', style: 'tableHeader', alignment: 'right' },
            { text: 'Status', style: 'tableHeader', alignment: 'center' },
        ]
    ];

    payments.forEach(p => {
        const statusText = p.status === 'paid' ? 'PAID' : p.status === 'partial' ? 'PARTIAL' : 'PENDING';
        tableBody.push([
            p.month_label || `Month ${p.month_id}`,
            { text: formatCurrency(p.amount_due), alignment: 'right' },
            { text: formatCurrency(p.amount_paid), alignment: 'right' },
            { text: formatCurrency(p.remaining_amount), alignment: 'right' },
            { text: statusText, alignment: 'center', color: p.status === 'paid' ? '#16a34a' : p.status === 'partial' ? '#ea580c' : '#dc2626' }
        ]);
    });

    return {
        content: [
            { text: chitSettings.name || "MANI'S CHIT FUND", style: 'header', alignment: 'center' },
            { text: 'MEMBER STATEMENT', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 15] },
            {
                columns: [
                    {
                        stack: [
                            { text: `Member: ${memberData.name}`, bold: true },
                            { text: `ID: ${memberData.member_code}`, margin: [0, 3, 0, 0] },
                            { text: `Phone: ${memberData.phone || 'N/A'}`, margin: [0, 3, 0, 0] },
                        ]
                    },
                    {
                        stack: [
                            { text: `Chit Value: ${formatCurrency(chitSettings.chit_value)}`, bold: true },
                            { text: `Lift Status: ${memberData.lift_status === 'lifted' ? 'Lifted' : 'Not Lifted'}`, margin: [0, 3, 0, 0] },
                            { text: `Receivable: ${memberData.receivable_amount ? formatCurrency(memberData.receivable_amount) : 'N/A'}`, margin: [0, 3, 0, 0] },
                        ]
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                    body: tableBody
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: (i) => i <= 1 ? '#1e3a5f' : '#eeeeee',
                    paddingTop: () => 6,
                    paddingBottom: () => 6,
                },
                margin: [0, 0, 0, 20]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 10] },
            {
                columns: [
                    { text: `Total Due: ${formatCurrency(totalDue)}`, bold: true },
                    { text: `Total Paid: ${formatCurrency(totalPaid)}`, bold: true, color: '#16a34a' },
                    { text: `Total Pending: ${formatCurrency(totalPending)}`, bold: true, color: '#dc2626' },
                ]
            }
        ],
        styles: {
            header: { fontSize: 22, bold: true, color: '#1e3a5f' },
            subheader: { fontSize: 14, bold: true, color: '#d4a843' },
            tableHeader: { bold: true, fontSize: 10, color: '#1e3a5f' },
        },
        defaultStyle: { fontSize: 10 },
        pageMargins: [30, 30, 30, 30],
    };
}

function generateMonthlyReport(monthData, payments, chitSettings) {
    const expected = payments.reduce((s, p) => s + p.amount_due, 0);
    const collected = payments.reduce((s, p) => s + p.amount_paid, 0);
    const pending = payments.reduce((s, p) => s + p.remaining_amount, 0);

    const tableBody = [
        [
            { text: 'Member', style: 'tableHeader' },
            { text: 'ID', style: 'tableHeader' },
            { text: 'Due', style: 'tableHeader', alignment: 'right' },
            { text: 'Paid', style: 'tableHeader', alignment: 'right' },
            { text: 'Remaining', style: 'tableHeader', alignment: 'right' },
            { text: 'Status', style: 'tableHeader', alignment: 'center' },
        ]
    ];

    payments.forEach(p => {
        const statusText = p.status === 'paid' ? 'PAID' : p.status === 'partial' ? 'PARTIAL' : 'PENDING';
        tableBody.push([
            p.name || p.member_name || '',
            p.member_code || '',
            { text: formatCurrency(p.amount_due), alignment: 'right' },
            { text: formatCurrency(p.amount_paid), alignment: 'right' },
            { text: formatCurrency(p.remaining_amount), alignment: 'right' },
            { text: statusText, alignment: 'center', color: p.status === 'paid' ? '#16a34a' : p.status === 'partial' ? '#ea580c' : '#dc2626' }
        ]);
    });

    return {
        content: [
            { text: chitSettings.name || "MANI'S CHIT FUND", style: 'header', alignment: 'center' },
            { text: `MONTHLY COLLECTION REPORT — ${monthData.month_label} (${monthData.calendar_month})`, style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 15] },
            {
                columns: [
                    { text: `Expected: ${formatCurrency(expected)}`, bold: true },
                    { text: `Collected: ${formatCurrency(collected)}`, bold: true, color: '#16a34a' },
                    { text: `Pending: ${formatCurrency(pending)}`, bold: true, color: '#dc2626' },
                ],
                margin: [0, 0, 0, 15]
            },
            {
                table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'], body: tableBody },
                layout: {
                    hLineWidth: (i, node) => (i <= 1 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: (i) => i <= 1 ? '#1e3a5f' : '#eeeeee',
                    paddingTop: () => 6,
                    paddingBottom: () => 6,
                },
            }
        ],
        styles: {
            header: { fontSize: 22, bold: true, color: '#1e3a5f' },
            subheader: { fontSize: 12, bold: true, color: '#d4a843' },
            tableHeader: { bold: true, fontSize: 10, color: '#1e3a5f' },
        },
        defaultStyle: { fontSize: 10 },
        pageMargins: [30, 30, 30, 30],
    };
}

function generatePendingReport(pendingPayments, chitSettings) {
    const tableBody = [
        [
            { text: 'Member', style: 'tableHeader' },
            { text: 'ID', style: 'tableHeader' },
            { text: 'Month', style: 'tableHeader' },
            { text: 'Due', style: 'tableHeader', alignment: 'right' },
            { text: 'Paid', style: 'tableHeader', alignment: 'right' },
            { text: 'Remaining', style: 'tableHeader', alignment: 'right' },
            { text: 'Status', style: 'tableHeader', alignment: 'center' },
        ]
    ];

    pendingPayments.forEach(p => {
        const statusText = p.status === 'partial' ? 'PARTIAL' : 'PENDING';
        tableBody.push([
            p.name || p.member_name || '',
            p.member_code || '',
            p.month_label || '',
            { text: formatCurrency(p.amount_due), alignment: 'right' },
            { text: formatCurrency(p.amount_paid), alignment: 'right' },
            { text: formatCurrency(p.remaining_amount), alignment: 'right' },
            { text: statusText, alignment: 'center', color: p.status === 'partial' ? '#ea580c' : '#dc2626' }
        ]);
    });

    return {
        content: [
            { text: (chitSettings && chitSettings.name) || "MANI'S CHIT FUND", style: 'header', alignment: 'center' },
            { text: 'PENDING PAYMENTS REPORT', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 15] },
            {
                table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'], body: tableBody },
                layout: {
                    hLineWidth: (i, node) => (i <= 1 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: (i) => i <= 1 ? '#1e3a5f' : '#eeeeee',
                    paddingTop: () => 5,
                    paddingBottom: () => 5,
                },
            }
        ],
        styles: {
            header: { fontSize: 22, bold: true, color: '#1e3a5f' },
            subheader: { fontSize: 14, bold: true, color: '#d4a843' },
            tableHeader: { bold: true, fontSize: 9, color: '#1e3a5f' },
        },
        defaultStyle: { fontSize: 9 },
        pageMargins: [20, 30, 20, 30],
    };
}

function generateLiftReport(lifts, chitSettings) {
    const tableBody = [
        [
            { text: 'Month', style: 'tableHeader' },
            { text: 'Calendar', style: 'tableHeader' },
            { text: 'Member', style: 'tableHeader' },
            { text: 'ID', style: 'tableHeader' },
            { text: 'Receivable', style: 'tableHeader', alignment: 'right' },
            { text: 'Lift Date', style: 'tableHeader' },
        ]
    ];

    lifts.forEach(l => {
        tableBody.push([
            l.month_label || '',
            l.calendar_month || '',
            l.name || l.member_name || 'Not Assigned',
            l.member_code || '—',
            { text: formatCurrency(l.receivable_amount), alignment: 'right' },
            l.lift_date || '—',
        ]);
    });

    return {
        content: [
            { text: (chitSettings && chitSettings.name) || "MANI'S CHIT FUND", style: 'header', alignment: 'center' },
            { text: 'CHIT LIFT REPORT', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 15] },
            {
                table: { headerRows: 1, widths: ['auto', '*', '*', 'auto', 'auto', 'auto'], body: tableBody },
                layout: {
                    hLineWidth: (i, node) => (i <= 1 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: (i) => i <= 1 ? '#1e3a5f' : '#eeeeee',
                    paddingTop: () => 6,
                    paddingBottom: () => 6,
                },
            }
        ],
        styles: {
            header: { fontSize: 22, bold: true, color: '#1e3a5f' },
            subheader: { fontSize: 14, bold: true, color: '#d4a843' },
            tableHeader: { bold: true, fontSize: 10, color: '#1e3a5f' },
        },
        defaultStyle: { fontSize: 10 },
        pageMargins: [30, 30, 30, 30],
    };
}

function generateCompleteReport(allPayments, members, months, chitSettings) {
    const content = [
        { text: (chitSettings && chitSettings.name) || "MANI'S CHIT FUND", style: 'header', alignment: 'center' },
        { text: 'COMPLETE 23-MONTH REPORT', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1e3a5f' }], margin: [0, 0, 0, 15] },
    ];

    const totalDue = allPayments.reduce((s, p) => s + p.amount_due, 0);
    const totalPaid = allPayments.reduce((s, p) => s + p.amount_paid, 0);
    const totalPending = allPayments.reduce((s, p) => s + p.remaining_amount, 0);

    content.push({
        columns: [
            { text: `Total Due: ${formatCurrency(totalDue)}`, bold: true },
            { text: `Total Paid: ${formatCurrency(totalPaid)}`, bold: true, color: '#16a34a' },
            { text: `Total Pending: ${formatCurrency(totalPending)}`, bold: true, color: '#dc2626' },
        ],
        margin: [0, 0, 0, 15]
    });

    // Summary table per member
    const summaryBody = [
        [
            { text: 'Member', style: 'tableHeader' },
            { text: 'ID', style: 'tableHeader' },
            { text: 'Total Due', style: 'tableHeader', alignment: 'right' },
            { text: 'Total Paid', style: 'tableHeader', alignment: 'right' },
            { text: 'Total Pending', style: 'tableHeader', alignment: 'right' },
            { text: 'Lift Status', style: 'tableHeader', alignment: 'center' },
        ]
    ];

    (members || []).forEach(m => {
        const memberPayments = allPayments.filter(p => p.member_id === m.id);
        const mDue = memberPayments.reduce((s, p) => s + p.amount_due, 0);
        const mPaid = memberPayments.reduce((s, p) => s + p.amount_paid, 0);
        const mPending = memberPayments.reduce((s, p) => s + p.remaining_amount, 0);
        summaryBody.push([
            m.name,
            m.member_code,
            { text: formatCurrency(mDue), alignment: 'right' },
            { text: formatCurrency(mPaid), alignment: 'right' },
            { text: formatCurrency(mPending), alignment: 'right' },
            { text: m.lift_status === 'lifted' ? 'Lifted' : 'Not Lifted', alignment: 'center' }
        ]);
    });

    content.push({
        table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'], body: summaryBody },
        layout: {
            hLineWidth: (i, node) => (i <= 1 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: (i) => i <= 1 ? '#1e3a5f' : '#eeeeee',
            paddingTop: () => 5,
            paddingBottom: () => 5,
        },
    });

    return {
        content,
        styles: {
            header: { fontSize: 22, bold: true, color: '#1e3a5f' },
            subheader: { fontSize: 14, bold: true, color: '#d4a843' },
            tableHeader: { bold: true, fontSize: 9, color: '#1e3a5f' },
        },
        defaultStyle: { fontSize: 9 },
        pageMargins: [20, 30, 20, 30],
    };
}

function createPdfBuffer(docDefinition) {
    return new Promise((resolve, reject) => {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);
        pdfDoc.end();
    });
}

module.exports = {
    generateReceipt,
    generateMemberStatement,
    generateMonthlyReport,
    generatePendingReport,
    generateLiftReport,
    generateCompleteReport,
    createPdfBuffer,
    printer,
};
