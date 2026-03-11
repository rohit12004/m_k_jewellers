import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const orderStatusCounts = await prisma.order.groupBy({
            by: ['orderStatus'],
            _count: {
                id: true
            }
        });

        const formatted = orderStatusCounts.map(item => ({
            status: item.orderStatus,
            count: item._count.id
        }));

        return response(true, 200, 'Data found', formatted)

    } catch (error) {
        return catchError(error)
    }
}