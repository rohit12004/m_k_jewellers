import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { updateUserPanCard } from "@/lib/order.service";
import { z } from "zod";
import Razorpay from "razorpay";

export async function POST(request) {
    try {
        // Verify user is authenticated
        const session = await getUserSession()
        if (!session) {
            return response(false, 401, 'Unauthorized. Please login to continue.')
        }

        const payload = await request.json()

        // Validate amount and PAN card
        const schema = z.object({
            amount: z.number()
                .positive('Amount must be positive')
                .max(10000000, 'Amount exceeds maximum limit'), // ₹1 Crore max
            panCard: z.string()
                .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format')
                .optional()
        })

        const validate = schema.safeParse(payload)

        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { amount, panCard } = validate.data

        // Update user's PAN card if provided and not already set
        if (panCard) {
            try {
                await updateUserPanCard(session.userId, panCard)
            } catch (error) {
                console.error('PAN card update failed during order ID generation:', error)
                // Don't fail order ID generation if PAN update fails
            }
        }

        const razInstance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const razOption = {
            amount: Number(amount) * 100, // Convert to paise
            currency: 'INR'
        }

        const orderDetail = await razInstance.orders.create(razOption)
        const order_id = orderDetail.id

        return response(true, 200, 'Order id generated.', order_id)

    } catch (error) {
        return catchError(error)
    }
}