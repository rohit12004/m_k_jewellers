import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        // Using Prisma to aggregate monthly sales
        const monthlySales = await prisma.order.findMany({
            where: {
                paymentStatus: 'COMPLETED',
                orderStatus: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
            },
            select: {
                total: true,
                createdAt: true
            }
        });

        // Grouping logic in JS since Prisma aggregation for dates is database-specific
        const grouped = monthlySales.reduce((acc, order) => {
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!acc[key]) acc[key] = 0;
            acc[key] += Number(order.total);
            return acc;
        }, {});

        return response(true, 200, 'Data found', grouped)

    } catch (error) {
        return catchError(error)
    }
}