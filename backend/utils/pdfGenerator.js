const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a professional PDF invoice
 * @param {Object} sale - Sale document with populated medicine and user data
 * @param {Object} res - Express response object
 */
exports.generateSalePDF = (sale, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF directly to the response
    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#444444')
        .fontSize(20)
        .text('IndiCorp Medicine', 50, 57)
        .fontSize(10)
        .text('IndiCorp Medicine', 200, 50, { align: 'right' })
        .text('123 Healthcare Avenue', 200, 65, { align: 'right' })
        .text('New Delhi, India', 200, 80, { align: 'right' })
        .moveDown();

    // --- Invoice Info ---
    doc.fillColor('#444444')
        .fontSize(20)
        .text('Invoice', 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc.fontSize(10)
        .text('Invoice Number:', 50, customerInformationTop)
        .font('Helvetica-Bold')
        .text(sale.invoiceNumber, 150, customerInformationTop)
        .font('Helvetica')
        .text('Invoice Date:', 50, customerInformationTop + 15)
        .text(sale.createdAt.toLocaleDateString(), 150, customerInformationTop + 15)
        .text('Payment Method:', 50, customerInformationTop + 30)
        .text(sale.paymentMethod, 150, customerInformationTop + 30)

        .font('Helvetica-Bold')
        .text('Billed By:', 300, customerInformationTop)
        .font('Helvetica')
        .text(sale.soldBy?.name || 'N/A', 300, customerInformationTop + 15)
        .text(sale.soldBy?.email || '', 300, customerInformationTop + 30)
        .moveDown();

    generateHr(doc, 252);

    // --- Items Table ---
    let i;
    const invoiceTableTop = 330;

    doc.font('Helvetica-Bold');
    generateTableRow(
        doc,
        invoiceTableTop,
        'Item',
        'Unit Cost',
        'Quantity',
        'Line Total'
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    for (i = 0; i < sale.medicines.length; i++) {
        const item = sale.medicines[i];
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
            doc,
            position,
            item.medicine?.name || 'Unknown Item',
            `INR ${item.sellingPrice}`,
            item.quantity,
            `INR ${item.itemTotal}`
        );

        generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
        doc,
        subtotalPosition,
        '',
        '',
        'Subtotal',
        `INR ${sale.subtotal}`
    );

    const paidToDatePosition = subtotalPosition + 20;
    generateTableRow(
        doc,
        paidToDatePosition,
        '',
        '',
        'GST (5%)',
        `INR ${sale.gst.toFixed(2)}`
    );

    const duePosition = paidToDatePosition + 25;
    doc.font('Helvetica-Bold');
    generateTableRow(
        doc,
        duePosition,
        '',
        '',
        'Grand Total',
        `INR ${sale.grandTotal}`
    );
    doc.font('Helvetica');

    // --- Footer ---
    doc.fontSize(10)
        .text('Thank you for choosing IndiCorp Medicine.', 50, 780, { align: 'center', width: 500 });

    doc.end();
};

function generateHr(doc, y) {
    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
    doc.fontSize(10)
        .text(item, 50, y)
        .text(unitCost, 280, y, { width: 90, align: 'right' })
        .text(quantity, 370, y, { width: 90, align: 'right' })
        .text(lineTotal, 0, y, { align: 'right' });
}
