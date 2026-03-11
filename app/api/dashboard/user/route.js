import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const auth = await isAuthenticated('user')
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const userId = auth.userId

        // get recent orders 
        const recentOrders = await prisma.order.findMany({
            where: { userId: userId },
            include: {
                products: true
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        // get total order count 
        const totalOrder = await prisma.order.count({
            where: { userId: userId }
        });

        return response(true, 200, 'Dashboard info.', { recentOrders, totalOrder })

    } catch (error) {
        return catchError(error)
    }
}