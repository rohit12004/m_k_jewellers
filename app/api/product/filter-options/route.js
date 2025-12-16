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

        // Get all products matching base filters
        const products = await prisma.product.findMany({
            where: baseWhere,
            include: {
                category: true,
                subCategory: true,
                variants: true,
            }
        })

        // Extract unique categories with counts
        const categoryMap = new Map()
        products.forEach(product => {
            if (product.category) {
                const existing = categoryMap.get(product.category.id) || {
                    id: product.category.id,
                    name: product.category.name,
                    slug: product.category.slug,
                    count: 0
                }
                existing.count++
                categoryMap.set(product.category.id, existing)
            }
        })

        // Extract unique subcategories with counts
        const subcategoryMap = new Map()
        products.forEach(product => {
            if (product.subCategory) {
                const existing = subcategoryMap.get(product.subCategory.id) || {
                    id: product.subCategory.id,
                    name: product.subCategory.name,
                    slug: product.subCategory.slug,
                    count: 0
                }
                existing.count++
                subcategoryMap.set(product.subCategory.id, existing)
            }
        })

        // Extract unique purities from variants
        const puritySet = new Set()
        products.forEach(product => {
            product.variants?.forEach(variant => {
                if (variant.purity) {
                    puritySet.add(variant.purity)
                }
            })
        })

        return response(true, 200, 'Filter options fetched successfully', {
            categories: Array.from(categoryMap.values()).sort((a, b) => b.count - a.count),
            subcategories: Array.from(subcategoryMap.values()).sort((a, b) => b.count - a.count),
            purities: Array.from(puritySet).sort(),
            totalProducts: products.length
        })

    } catch (error) {
        return catchError(error)
    }
}
