import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET() {
    try {

        const getProduct = await prisma.product.findMany({
            where: {
                deletedAt: null,
            },
            take: 8,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                media: {
                    select: {
                        id: true,
                        secure_url: true,
                    },
                    orderBy: { order: "asc" },
                },
            },
        })

        return response(true, 200, 'Products fetched successfully', getProduct)
    } catch (error) {
        return catchError(error);
    }
}
