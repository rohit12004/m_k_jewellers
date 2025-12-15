import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const getSubCategories = await prisma.subCategory.findMany({
            where: {
                deletedAt: null,
            },
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

        return response(true, 200, 'Subcategories fetched successfully', getSubCategories)
    } catch (error) {
        return catchError(error);
    }
}
