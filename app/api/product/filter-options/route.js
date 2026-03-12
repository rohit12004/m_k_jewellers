import { catchError, response } from "@/lib/helperFunction"
import prisma from "@/lib/prisma"

/**
 * Get available filter options for products
 * Returns dynamic filter values based on current filters
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse current filters to show relevant options
        const subcategorySlug = searchParams.get('subcategory')
        const categorySlug = searchParams.get('category')

        // Build base where clause
        const baseWhere = {
            deletedAt: null,
        }

        // Add subcategory filter if provided
        if (subcategorySlug) {
            const subcategory = await prisma.subCategory.findUnique({
                where: { slug: subcategorySlug }
            })
            if (subcategory) {
                baseWhere.subCategoryId = subcategory.id
            }
        }

        // Add category filter if provided
        if (categorySlug) {
            const category = await prisma.category.findUnique({
                where: { slug: categorySlug }
            })
            if (category) {
                baseWhere.categoryId = category.id
            }
        }

        // Get total count matching base filters
        const totalProducts = await prisma.product.count({
            where: baseWhere
        })

        if (totalProducts === 0) {
            return response(true, 200, 'No products found for filters', {
                categories: [],
                subcategories: [],
                purities: [],
                totalProducts: 0
            })
        }

        // Parallelize aggregation queries
        const [categoryCounts, subcategoryCounts, variantGroups] = await Promise.all([
            // 1. Category counts
            prisma.product.groupBy({
                by: ['categoryId'],
                where: baseWhere,
                _count: { _all: true }
            }),
            // 2. Subcategory counts
            prisma.product.groupBy({
                by: ['subCategoryId'],
                where: baseWhere,
                _count: { _all: true }
            }),
            // 3. Unique purities (via variants)
            prisma.productVariant.groupBy({
                by: ['purity'],
                where: {
                    product: baseWhere
                },
            })
        ])

        // Fetch display names for categories/subcategories
        const [categories, subcategories] = await Promise.all([
            prisma.category.findMany({
                where: { id: { in: categoryCounts.map(c => c.categoryId) } },
                select: { id: true, name: true, slug: true }
            }),
            prisma.subCategory.findMany({
                where: { id: { in: subcategoryCounts.map(s => s.subCategoryId) } },
                select: { id: true, name: true, slug: true }
            })
        ])

        // Format result: Merge counts with display info
        const formattedCategories = categories.map(cat => ({
            ...cat,
            count: categoryCounts.find(c => c.categoryId === cat.id)?._count?._all || 0
        })).sort((a, b) => b.count - a.count)

        const formattedSubcategories = subcategories.map(sub => ({
            ...sub,
            count: subcategoryCounts.find(s => s.subCategoryId === sub.id)?._count?._all || 0
        })).sort((a, b) => b.count - a.count)

        // Extract unique purities
        const purities = variantGroups.map(v => v.purity).filter(Boolean).sort()

        return response(true, 200, 'Filter options fetched successfully', {
            categories: formattedCategories,
            subcategories: formattedSubcategories,
            purities,
            totalProducts
        })

    } catch (error) {
        return catchError(error)
    }
}
