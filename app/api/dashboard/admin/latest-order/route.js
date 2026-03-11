import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const latestOrder = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return response(true, 200, 'Data found', latestOrder)

    } catch (error) {
        return catchError(error)
    }
}