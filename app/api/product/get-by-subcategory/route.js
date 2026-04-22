import { response, catchError } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addCalculatedPrices } from "@/lib/pricingHelper";

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Get filter parameters
        // Get filter parameters and ensure they are singular for DB matching
        const subcategorySlugsRaw = searchParams.get("subcategory")?.split(',').filter(Boolean) || [];
        
        const singularize = (str) => {
            if (!str) return str;
            const lower = str.toLowerCase().trim();
            if (lower.endsWith('ies')) return lower.slice(0, -3) + 'y';
            if (lower.endsWith('s') && !lower.endsWith('ss')) return lower.slice(0, -1);
            return lower;
        };
        
        const subcategorySlugs = subcategorySlugsRaw.map(singularize);
        const categorySlugs = searchParams.get("category")?.split(',').filter(Boolean) || [];
        const gender = searchParams.get("gender");
        const purities = searchParams.get("purity")?.split(',').filter(Boolean) || [];
        const sortBy = searchParams.get("sortBy") || "newest";

        // Pagination
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "12", 10);
        const skip = (page - 1) * limit;

        // Build WHERE clause
        const where = {
            deletedAt: null,
        };

        // Subcategory filter (multi-select)
        if (subcategorySlugs.length > 0) {
            const subcategories = await prisma.subCategory.findMany({
                where: { slug: { in: subcategorySlugs }, deletedAt: null },
                select: { id: true }
            });

            if (subcategories.length > 0) {
                where.subCategoryId = { in: subcategories.map(s => s.id) };
            }
        }

        // Category filter (multi-select)
        if (categorySlugs.length > 0) {
            const categories = await prisma.category.findMany({
                where: { slug: { in: categorySlugs }, deletedAt: null },
                select: { id: true }
            });

            if (categories.length > 0) {
                where.categoryId = { in: categories.map(c => c.id) };
            }
        }

        // Gender filter
        if (gender && (gender === 'MEN' || gender === 'WOMEN')) {
            where.gender = gender;
        }

        // Purity filter (requires variant join)
        const variantFilters = [];
        if (purities.length > 0) {
            variantFilters.push({ purity: { in: purities } });
        }

        // Combine variant filters
        if (variantFilters.length > 0) {
            where.variants = {
                some: {
                    AND: variantFilters
                }
            };
        }

        // Build ORDER BY
        let orderBy;
        switch (sortBy) {
            case 'price_asc':
                // Sort by minimum variant price (ascending)
                orderBy = { variants: { _min: { labourCharge: 'asc' } } };
                break;
            case 'price_desc':
                // Sort by maximum variant price (descending)
                orderBy = { variants: { _max: { labourCharge: 'desc' } } };
                break;
            case 'name_asc':
                orderBy = { name: 'asc' };
                break;
            case 'name_desc':
                orderBy = { name: 'desc' };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }

        // Fetch products and count
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    gender: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    },
                    subCategory: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    },
                    media: {
                        take: 1,
                        select: {
                            id: true,
                            secure_url: true,
                            thumbnail_url: true,
                            alt: true,
                            title: true,
                        },
                        orderBy: { order: "asc" },
                    },
                    variants: {
                        select: {
                            id: true,
                            weight: true,
                            purity: true,
                            labourCharge: true,
                            hallmarkCharges: true,
                            gst: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy,
            }),
            prisma.product.count({ where }),
        ]);

        // Get subcategory info if single subcategory selected
        let subcategoryInfo = null;
        if (subcategorySlugs.length === 1) {
            subcategoryInfo = await prisma.subCategory.findUnique({
                where: { slug: subcategorySlugs[0] },
                select: { id: true, name: true, slug: true }
            });
        }

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);

        // Add calculated prices to products
        const productsWithPrices = await addCalculatedPrices(products);

        return NextResponse.json({
            success: true,
            data: {
                subcategory: subcategoryInfo,
                products: productsWithPrices,
            },
            meta: {
                currentPage: page,
                totalPages,
                totalProducts: totalCount,
                limit,
                appliedFilters: {
                    subcategories: subcategorySlugs,
                    categories: categorySlugs,
                    gender,
                    purities,
                    sortBy,
                }
            },
        });

    } catch (error) {
        return catchError(error);
    }
}
