import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const getCategories = await prisma.category.findMany({
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
                        alt: true,
                        title: true,
                    },
                },
            },
        })

        return response(true, 200, 'Categories fetched successfully', getCategories)
    } catch (error) {
        return catchError(error);
    }
}
