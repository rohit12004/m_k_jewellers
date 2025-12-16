import { response, catchError } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Get query parameters
        const subcategorySlug = searchParams.get("subcategory");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "12", 10);

        // Validate subcategory parameter
        if (!subcategorySlug) {
            return response(false, 400, "Subcategory slug is required.");
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build query to find subcategory and get products
        const subcategory = await prisma.subCategory.findUnique({
            where: {
                slug: subcategorySlug,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        // If subcategory not found
        if (!subcategory) {
            return response(false, 404, "Subcategory not found.");
        }

        // Get products for this subcategory
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: {
                    subCategoryId: subcategory.id,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    media: {
                        take: 1, // Only get first image
                        select: {
                            id: true,
                            secure_url: true,
                            thumbnail_url: true,
                            alt: true,
                            title: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.product.count({
                where: {
                    subCategoryId: subcategory.id,
                    deletedAt: null,
                },
            }),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: {
                subcategory,
                products,
            },
            meta: {
                currentPage: page,
                totalPages,
                totalProducts: totalCount,
                limit,
            },
        });

    } catch (error) {
        return catchError(error);
    }
}
