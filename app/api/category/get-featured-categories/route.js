import { catchError, response } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

// API route to get featured categories
export async function GET() {
    try {
        // Debug: Log the DATABASE_URL being used
        console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 80) + '...');

        const getCategories = await prisma.category.findMany({
            where: {
                deletedAt: null,
            },
            take: 8,
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                media: {
                    select: {
                        id: true,
                        secure_url: true,
                        alt: true,
                        title: true,
                    },
                    orderBy: { order: "asc" },
                },
            },
        })

        return response(true, 200, 'Categories fetched successfully', getCategories)
    } catch (error) {
        console.error('❌ Category fetch error:', error.message);
        return catchError(error);
    }
}
