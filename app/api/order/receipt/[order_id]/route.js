import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { getOrderByRazorpayId } from "@/lib/order.service";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export async function GET(request, { params }) {
    try {
        const { order_id } = await params;

        if (!order_id) {
            return response(false, 400, 'Order ID is required');
        }

        // Verify user is authenticated
        const session = await getUserSession();
        if (!session) {
            return response(false, 401, 'Unauthorized. Please login to continue.');
        }

        // Fetch order details
        const order = await getOrderByRazorpayId(order_id);

        if (!order) {
            return response(false, 404, 'Order not found');
        }

        // Verify user owns this order
        if (order.userId !== session.userId) {
            return response(false, 403, 'Unauthorized to access this order');
        }

        // Create PDF document
        const doc = new PDFDocument({
            margin: 40,
            size: 'A4',
            info: {
                Title: `MK_Jewellers_Receipt_${order.orderId}`,
                Author: 'M.K. Jewellers',
            }
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        // Generate the modernized luxury PDF content
        await generateModernReceiptPDF(doc, order);

        doc.end();

        const pdfBuffer = await new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `inline; filename="MK_Jewellers_Receipt_${order.orderId}.pdf"`);
        headers.set('Content-Length', pdfBuffer.length.toString());
        headers.set('Cache-Control', 'no-cache');

        return new Response(pdfBuffer, { status: 200, headers });

    } catch (error) {
        console.error('Receipt generation error:', error);
        return catchError(error);
    }
}

async function generateModernReceiptPDF(doc, order) {
    const primaryColor = '#7c3aed';
    const darkGray = '#333333';
    const lightGray = '#666666';
    const borderFill = '#f9fafb';
    const tableHeaderColor = '#7c3aed';

    // Parse address
    let address = {};
    try {
        address = typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
    } catch (e) {
        address = { street: order.address || 'N/A' };
    }

    // 1. Header with Logo and Brand
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'mk_logo.jpg');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 257.5, 25, { width: 80 }); // Moved up from 40 to 25
        doc.y = 115; // Set cursor explicitly below the image to prevent overlap
    } else {
        doc.moveDown(2);
    }

    doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor(darkGray)
        .text('M. K. JEWELLERS', { align: 'center', characterSpacing: 1 })
        .moveDown(0.2);

    doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text('EXQUISITE CRAFTSMANSHIP', { align: 'center', characterSpacing: 4 })
        .moveDown(1.5);

    // 2. Tax Invoice Box
    const boxTop = doc.y;
    doc.rect(150, boxTop, 300, 30)
        .fillAndStroke(borderFill, primaryColor + '33'); // Transparent primary color stroke

    doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor(darkGray)
        .text('TAX INVOICE / RECEIPT', 150, boxTop + 8, { align: 'center', width: 300 });

    doc.moveDown(3);

    // 3. Metadata Grid
    const gridTop = doc.y;
    const colWidth = 130;

    const metadata = [
        { label: 'Order ID', value: `#${order.orderId.split('_')[1] || order.orderId}` },
        { label: 'Invoice Date', value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
        { label: 'Payment ID', value: order.paymentId || 'N/A' },
        { label: 'Status', value: order.orderStatus.toUpperCase() }
    ];

    metadata.forEach((item, i) => {
        const x = 40 + (i * colWidth);
        doc.fontSize(8).fillColor(lightGray).font('Helvetica-Bold').text(item.label.toUpperCase(), x, gridTop);
        doc.fontSize(10).fillColor(darkGray).font('Helvetica-Bold').text(item.value, x, gridTop + 12);
    });

    doc.moveDown(3);

    // 4. Billed To & Shipped To Columns
    const addrTop = doc.y;
    doc.fontSize(9).fillColor(primaryColor).font('Helvetica-Bold').text('BILLED TO', 40, addrTop, { characterSpacing: 1 });
    doc.fontSize(9).fillColor(primaryColor).font('Helvetica-Bold').text('SHIPPED TO', 300, addrTop, { characterSpacing: 1 });

    doc.moveTo(40, addrTop + 12).lineTo(250, addrTop + 12).stroke(primaryColor + '33');
    doc.moveTo(300, addrTop + 12).lineTo(550, addrTop + 12).stroke(primaryColor + '33');

    const addrContentTop = addrTop + 20;

    // Billed To Content
    doc.fontSize(12).fillColor(darkGray).font('Helvetica-Bold').text(order.user?.name || 'Customer', 40, addrContentTop);
    doc.fontSize(9).font('Helvetica').fillColor(lightGray)
        .text(order.email, 40, addrContentTop + 15)
        .text(order.phone, 40, addrContentTop + 27)
        .font('Helvetica-Bold').fillColor(darkGray)
        .text(`PAN: ${order.panCard}`, 40, addrContentTop + 42);

    // Shipped To Content
    doc.fontSize(10).fillColor(darkGray).font('Helvetica-Bold').text(address.street || '', 300, addrContentTop);
    doc.fontSize(9).font('Helvetica').fillColor(lightGray)
        .text(address.street2 || '', 300, addrContentTop + 15)
        .text(`${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}`, 300, addrContentTop + 27)
        .font('Helvetica-Oblique')
        .text('Certified & Insured Delivery', 300, addrContentTop + 45);

    doc.moveDown(6);

    // 5. Items Table
    doc.fontSize(9).fillColor(primaryColor).font('Helvetica-Bold').text('ITEMIZED BREAKDOWN', 40, doc.y, { characterSpacing: 1 });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemCol = 40;
    const descCol = 80;
    const rateCol = 320;
    const qtyCol = 420;
    const amountCol = 480;

    // Header Background
    doc.rect(40, tableTop, 515, 25).fill(tableHeaderColor);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
    doc.text('SR.', itemCol + 5, tableTop + 8);
    doc.text('PRODUCT DESCRIPTION', descCol, tableTop + 8);
    doc.text('RATE', rateCol, tableTop + 8, { width: 80, align: 'center' });
    doc.text('QTY', qtyCol, tableTop + 8, { width: 40, align: 'center' });
    doc.text('AMOUNT', amountCol, tableTop + 8, { width: 75, align: 'right' });

    let y = tableTop + 25;

    order.products.forEach((item, index) => {
        // Stripe background
        if (index % 2 !== 0) {
            doc.rect(40, y, 515, 30).fill(borderFill);
        }

        doc.fillColor(darkGray).fontSize(9).font('Helvetica');
        doc.text((index + 1).toString(), itemCol + 5, y + 10);
        
        // Item Details
        doc.font('Helvetica-Bold').text(item.name.toUpperCase(), descCol, y + 5, { width: 230 });
        doc.fontSize(7).font('Helvetica').fillColor(lightGray).text(
            `${item.purity || ''} • ${item.weight}g ${item.color ? `• ${item.color}` : ''} ${item.size ? `• Size: ${item.size}` : ''}`,
            descCol, y + 18
        );

        doc.fontSize(9).fillColor(darkGray).text(
            Number(item.unitPrice).toLocaleString('en-IN'), 
            rateCol, y + 10, { width: 80, align: 'center' }
        );
        doc.font('Helvetica-Bold').text(
            item.qty.toString(), 
            qtyCol, y + 10, { width: 40, align: 'center' }
        );
        doc.text(
            Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 
            amountCol, y + 10, { width: 75, align: 'right' }
        );

        y += 30;
    });

    // 6. Totals
    doc.moveDown(2);
    const totalsY = doc.y;
    const totalsLabelX = 380;
    const totalsValueX = 480;

    doc.fontSize(9).font('Helvetica').fillColor(lightGray);
    doc.text('Subtotal', totalsLabelX, totalsY);
    doc.fillColor(darkGray).font('Helvetica-Bold').text(`₹${Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValueX, totalsY, { align: 'right' });

    doc.fillColor(lightGray).text('GST (Inclusive)', totalsLabelX, totalsY + 15); // Adjust offset after removing shipping
    doc.fillColor(darkGray).text('-', totalsValueX, totalsY + 15, { align: 'right' });

    doc.moveTo(380, totalsY + 30).lineTo(555, totalsY + 30).stroke(primaryColor + '33');

    doc.fontSize(12).fillColor(darkGray).font('Helvetica-Bold').text('Total Paid', totalsLabelX, totalsY + 40);
    doc.fontSize(20).fillColor(primaryColor).text(
        Number(order.total).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
        totalsValueX - 50, totalsY + 40, { align: 'right', width: 125 }
    );


    // 7. Footer
    const footerY = 700;
    doc.moveTo(40, footerY).lineTo(555, footerY).stroke('#eee');

    // Badges
    doc.fontSize(7).font('Helvetica-Bold').fillColor(lightGray);
    doc.text('AUTHENTIC', 250, footerY + 15);
    doc.text('SECURE', 310, footerY + 15);

    doc.fontSize(8).fillColor(lightGray).font('Helvetica-Bold')
        .text('M.K. JEWELLERS — SINCE 2004', 40, footerY + 40, { align: 'center', width: 515, characterSpacing: 2 });

    doc.fontSize(7).font('Helvetica').fillColor(lightGray)
        .text('Arihant Mall, Main Road, Ratnagiri, Maharashtra, 415612', 40, footerY + 55, { align: 'center', width: 515 })
        .text('This is a computer generated invoice and does not require a signature.', 40, footerY + 65, { align: 'center', width: 515 });
}
