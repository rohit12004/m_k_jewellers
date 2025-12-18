import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { getOrderByRazorpayId } from "@/lib/order.service";

export async function GET(request, { params }) {
    try {
        const { order_id } = await params

        if (!order_id) {
            return response(false, 400, 'Order ID is required')
        }

        // Get user session (optional - allows guest checkout)
        const session = await getUserSession()

        // Fetch order
        const order = await getOrderByRazorpayId(order_id)

        if (!order) {
            return response(false, 404, 'Order not found')
        }

        // If user is logged in, verify they own this order
        if (session && order.userId && order.userId !== session.userId) {
            return response(false, 403, 'Unauthorized to view this order')
        }

        // Return order details
        return response(true, 200, 'Order details fetched successfully', order)

    } catch (error) {
        console.error('Order details fetch error:', error)
        return catchError(error)
    }
}
