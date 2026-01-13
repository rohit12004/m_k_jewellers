import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { getOrderByRazorpayId } from "@/lib/order.service";
import PDFDocument from "pdfkit";

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



        // Create PDF document with default settings
        // Webpack externalization allows PDFKit to access its font files
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
        });

        // Collect PDF chunks
        const chunks = [];

        // Listen for data chunks
        doc.on('data', (chunk) => {
            chunks.push(chunk);
        });

        // Generate PDF content BEFORE ending
        generateReceiptPDF(doc, order);

        // End the document
        doc.end();

        // Wait for PDF generation to complete
        const pdfBuffer = await new Promise((resolve, reject) => {
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
        });



        // Set response headers for PDF download
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `inline; filename="MK_Jewellers_Receipt_${order.orderId}.pdf"`);
        headers.set('Content-Length', pdfBuffer.length.toString());
        headers.set('Cache-Control', 'no-cache');

        // Return PDF as response
        return new Response(pdfBuffer, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Receipt generation error:', error);
        console.error('Error stack:', error.stack);
        return catchError(error);
    }
}

function generateReceiptPDF(doc, order) {
    // Parse address
    let address = {};
    try {
        address = typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
    } catch (e) {
        address = { street: order.address || 'N/A' };
    }

    // Header - Company Info
    doc.fontSize(26)
        .fillColor('#7c3aed')
        .text('M.K. JEWELLERS', { align: 'center' })
        .fillColor('#000000');

    doc.fontSize(10)
        .text('Premium Gold & Diamond Jewelry', { align: 'center' })
        .text('Arihant Mall, Main Road, Ratnagiri, Maharashtra - 415612', { align: 'center' })
        .text('Phone: +91-9881339944 | Email: mkjew@rediffmail.com', { align: 'center' })
        .text('GSTIN: 27XXXXX1234X1ZX', { align: 'center' })
        .moveDown(2);

    // Horizontal line
    doc.moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1);

    // Title
    doc.fontSize(22)
        .fillColor('#7c3aed')
        .text('PAYMENT RECEIPT', { align: 'center' })
        .fillColor('#000000')
        .moveDown(0.5);

    doc.fontSize(9)
        .fillColor('#666666')
        .text(`Receipt No: RCP-${order.orderId}`, { align: 'center' })
        .fillColor('#000000')
        .moveDown(1.5);

    // Order Information Section
    doc.fontSize(14)
        .fillColor('#7c3aed')
        .text('Order Information', { underline: true })
        .fillColor('#000000')
        .moveDown(0.5);

    doc.fontSize(10);

    const orderInfoY = doc.y;

    // Left column
    doc.text(`Order ID: ${order.orderId}`, 50, orderInfoY);
    doc.text(`Payment ID: ${order.paymentId}`, 50, orderInfoY + 15);
    doc.text(`Payment Method: Online (Razorpay)`, 50, orderInfoY + 30);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}`, 50, orderInfoY + 45);

    // Right column
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 300, orderInfoY);
    doc.text(`Order Status: ${order.orderStatus.toUpperCase()}`, 300, orderInfoY + 15);

    doc.moveDown(4);

    // Customer Information Section
    doc.fontSize(14)
        .fillColor('#7c3aed')
        .text('Customer Information', { underline: true })
        .fillColor('#000000')
        .moveDown(0.5);

    doc.fontSize(10)
        .text(`Name: ${order.user?.name || 'N/A'}`)
        .text(`Email: ${order.email}`)
        .text(`Phone: ${order.phone}`)
        .text(`PAN Card: ${order.panCard}`)
        .moveDown(0.5);

    doc.fontSize(10)
        .fillColor('#666666')
        .text('Delivery Address:', { underline: true })
        .fillColor('#000000')
        .moveDown(0.3);

    doc.fontSize(9)
        .text(`${address.street || ''}`)
        .text(`${address.street2 || ''}`)
        .text(`${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}`)
        .moveDown(2);

    // Order Items Section
    doc.fontSize(14)
        .fillColor('#7c3aed')
        .text('Order Items', { underline: true })
        .fillColor('#000000')
        .moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 320;
    const priceX = 390;
    const totalX = 480;

    // Table header with background
    doc.fontSize(10)
        .fillColor('#000000')
        .text('Item', itemX, tableTop, { bold: true })
        .text('Qty', qtyX, tableTop, { bold: true })
        .text('Price', priceX, tableTop, { bold: true })
        .text('Total', totalX, tableTop, { bold: true });

    // Draw line under header
    doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

    // Table rows
    let yPosition = tableTop + 25;

    order.products.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
        }

        const itemName = `${item.name}${item.color ? ` (${item.color})` : ''}${item.weight ? ` - ${item.weight}g` : ''}`;

        doc.fontSize(9)
            .fillColor('#000000')
            .text(itemName, itemX, yPosition, { width: 260 })
            .text(item.qty.toString(), qtyX, yPosition, { width: 60 })
            .text(`Rs. ${Number(item.unitPrice).toFixed(2)}`, priceX, yPosition, { width: 80 })
            .text(`Rs. ${Number(item.totalPrice).toFixed(2)}`, totalX, yPosition, { width: 70, align: 'right' });

        yPosition += 25;
    });


    // Draw line before totals
    doc.moveTo(50, yPosition)
        .lineTo(550, yPosition)
        .stroke();

    yPosition += 15;

    // Calculate subtotal and tax (assuming 18% GST for jewelry)
    const subtotal = order.total / 1.18; // Reverse calculate if total includes tax
    const gstAmount = order.total - subtotal;

    // Subtotal
    doc.fontSize(10)
        .fillColor('#000000')
        .text('Subtotal:', 400, yPosition)
        .text(`Rs. ${subtotal.toFixed(2)}`, 480, yPosition, { align: 'right' });

    yPosition += 20;

    // GST
    doc.fontSize(10)
        .text('GST (18%):', 400, yPosition)
        .text(`Rs. ${gstAmount.toFixed(2)}`, 480, yPosition, { align: 'right' });

    yPosition += 20;

    // Draw line before grand total
    doc.moveTo(400, yPosition)
        .lineTo(550, yPosition)
        .stroke();

    yPosition += 10;

    // Total Amount
    doc.fontSize(12)
        .fillColor('#000000')
        .text('Total Amount Paid:', 370, yPosition)
        .fontSize(16)
        .fillColor('#7c3aed')
        .text(`Rs. ${Number(order.total).toFixed(2)}`, 480, yPosition, { align: 'right' })
        .fillColor('#000000');


    // Footer
    const footerY = 730;

    // Horizontal line before footer
    doc.moveTo(50, footerY)
        .lineTo(550, footerY)
        .stroke();

    doc.fontSize(9)
        .fillColor('#000000')
        .text(
            'Thank you for your purchase!',
            50,
            footerY + 10,
            { align: 'center', width: 500 }
        );

    doc.fontSize(8)
        .fillColor('#666666')
        .text(
            'For any queries, please contact us at +91-9881339944 or mkjew@rediffmail.com',
            50,
            footerY + 25,
            { align: 'center', width: 500 }
        );

    doc.fontSize(7)
        .fillColor('#999999')
        .text(
            'This is a computer-generated receipt and does not require a signature.',
            50,
            footerY + 40,
            { align: 'center', width: 500 }
        )
        .text(
            'Terms & Conditions apply. Please visit our website for more details.',
            50,
            footerY + 52,
            { align: 'center', width: 500 }
        )
        .fillColor('#000000');
}
