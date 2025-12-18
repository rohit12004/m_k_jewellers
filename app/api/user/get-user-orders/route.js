import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        // Verify user is authenticated
        const session = await getUserSession()
        if (!session) {
            return response(false, 401, 'Unauthorized. Please login to continue.')
        }

        // Fetch user's orders with products
        const orders = await prisma.order.findMany({
            where: {
                userId: session.userId
            },
            include: {
                products: {
                    select: {
                        id: true,
                        qty: true,
                        totalPrice: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Calculate summary statistics
        const totalOrders = orders.length
        const totalItemsOrdered = orders.reduce((sum, order) => {
            return sum + order.products.reduce((itemSum, product) => itemSum + product.qty, 0)
        }, 0)
        const totalAmountSpent = orders.reduce((sum, order) => sum + Number(order.total), 0)

        // Format orders for frontend
        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderId: order.orderId,
            total: Number(order.total),
            itemCount: order.products.reduce((sum, product) => sum + product.qty, 0),
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt
        }))

        return response(true, 200, 'Orders fetched successfully', {
            summary: {
                totalOrders,
                totalItemsOrdered,
                totalAmountSpent
            },
            orders: formattedOrders
        })

    } catch (error) {
        console.error('Get user orders error:', error)
        return catchError(error)
    }
}
