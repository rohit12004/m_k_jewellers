import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { sendMail } from "@/lib/sendMail";
import { orderNotification } from "@/email/orderNotification";
import { verifyCartPrices, createOrderWithProducts } from "@/lib/order.service";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { z } from "zod";
import { getBaseUrl } from "@/lib/getBaseUrl";

export async function POST(request) {
    try {
        // Verify user is authenticated
        const session = await getUserSession()
        if (!session) {
            return response(false, 401, 'Unauthorized. Please login to continue.')
        }

        const payload = await request.json()

        // Product schema for cart items
        const productSchema = z.object({
            productId: z.string().uuid('Invalid product id format'),
            variantId: z.string().uuid('Invalid variant id format'),
            name: z.string().min(1),
            weight: z.number().nullable().optional(),
            purity: z.string().nullable().optional(),
            size: z.string().nullable().optional(),
            length: z.string().nullable().optional(),
            color: z.string().nullable().optional(),
            qty: z.number().min(1),
            price: z.number().nonnegative(), // Client-side price (will be verified)
            category: z.string().optional(),
            subcategory: z.string().optional(),
            media: z.string().nullable().optional()
        })

        // Order schema
        const orderSchema = z.object({
            userId: z.string().uuid().optional(),
            email: z.string().email(),
            phone: z.string().min(10),
            address: z.string().min(1), // JSON string
            panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format'),
            razorpay_payment_id: z.string().min(3, 'Payment id is required.'),
            razorpay_order_id: z.string().min(3, 'Order id is required.'),
            razorpay_signature: z.string().min(3, 'Signature is required.'),
            total: z.number().nonnegative(),
            cartItems: z.array(productSchema).min(1, 'Cart cannot be empty')
        })

        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            console.error('Validation failed:', validate.error.errors)
            return response(false, 400, 'Invalid or missing fields.', { errors: validate.error.errors })
        }

        const validatedData = validate.data

        // Step 1: Verify payment signature
        const verification = validatePaymentVerification({
            order_id: validatedData.razorpay_order_id,
            payment_id: validatedData.razorpay_payment_id
        }, validatedData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

        if (!verification) {
            return response(false, 400, 'Payment verification failed. Invalid signature.')
        }

        // Step 2: Verify cart prices (prevent price manipulation)
        const priceVerification = await verifyCartPrices(validatedData.cartItems)

        if (!priceVerification.valid) {
            console.error(`Price mismatch detected: ₹${priceVerification.totalMismatch}`)
            return response(false, 400, 'Price verification failed. Please refresh and try again.')
        }

        // Calculate verified totals
        const verifiedSubtotal = priceVerification.verifiedItems.reduce(
            (sum, item) => sum + item.totalPrice, 0
        )
        const verifiedTotal = verifiedSubtotal // Add shipping/taxes if needed

        // Verify total matches (with small tolerance)
        if (Math.abs(verifiedTotal - validatedData.total) > 10) {
            return response(false, 400, 'Total amount mismatch. Please refresh and try again.')
        }

        // Step 3: Create order with verified prices
        const orderData = {
            userId: session.userId,
            email: validatedData.email,
            phone: validatedData.phone,
            address: validatedData.address,
            panCard: validatedData.panCard,
            total: priceVerification.verifiedItems.reduce((sum, item) => sum + item.totalPrice, 0),
            paymentId: validatedData.razorpay_payment_id,
            orderId: validatedData.razorpay_order_id,
            paymentStatus: 'COMPLETED' // Payment verified
        }

        const newOrder = await createOrderWithProducts(orderData, priceVerification.verifiedItems)

        // Step 4: Send order confirmation email
        try {
            const mailData = {
                order_id: validatedData.razorpay_order_id,
                orderDetailsUrl: `${getBaseUrl()}/order-details/${validatedData.razorpay_order_id}`
            }

            // Send to Customer
            await sendMail('Order placed successfully.', validatedData.email, orderNotification(mailData))

            // Send to Admin
            await sendMail(
                `🚨 New Order Received: ${validatedData.razorpay_order_id}`, 
                process.env.ADMIN_EMAIL, 
                orderNotification(mailData)
            )
            
        } catch (error) {
            console.error('Email notification failed:', error)
            // Don't fail the order if email fails
        }

        return response(true, 200, 'Order placed successfully.', {
            orderId: validatedData.razorpay_order_id
        })

    } catch (error) {
        console.error('Save order error:', error)
        return catchError(error)
    }
}