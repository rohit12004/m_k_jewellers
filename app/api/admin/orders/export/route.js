import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        // Fetch all orders with user details for export
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!orders || orders.length === 0) {
            return response(false, 404, 'No orders found.')
        }

        // Return raw data with nested user object (Datatable will extract columns)
        return response(true, 200, 'Data found.', orders)

    } catch (error) {
        return catchError(error)
    }
}
