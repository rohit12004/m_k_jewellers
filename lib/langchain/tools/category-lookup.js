/**
 * Category Lookup Tool
 * 
 * Retrieves all available product categories from the database.
 * Useful when users want to browse or explore what's available.
 */

import { createTool, z } from "./index.js";
import prisma from "@/lib/prisma";

/**
 * Category Lookup Tool
 * Gets all available product categories
 */
export const categoryLookupTool = createTool({
    name: "category_lookup",
    description: `Get a list of all available product categories in the store.

Use this tool when users:
- Ask "What categories do you have?"
- Want to browse available product types
- Ask "What kind of jewelry do you sell?"
- Want to explore the catalog

Returns a structured list of categories with subcategories and product counts.`,

    schema: z.object({
        includeSubCategories: z.boolean().default(true).describe("Whether to include subcategories in the response")
    }),

    func: async ({ includeSubCategories = true }) => {
        try {
            console.log(`📂 [CategoryLookup] Fetching categories (includeSubCategories: ${includeSubCategories})`);

            // Fetch categories with product counts
            const categories = await prisma.category.findMany({
                where: { deletedAt: null },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    _count: {
                        select: { products: true }
                    },
                    categorySubCategories: includeSubCategories ? {
                        select: {
                            subCategory: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    _count: {
                                        select: { products: true }
                                    }
                                }
                            }
                        }
                    } : false
                },
                orderBy: { name: 'asc' }
            });

            if (categories.length === 0) {
                return JSON.stringify({
                    found: false,
                    categories: [],
                    message: "No categories found in the database."
                });
            }

            // Format categories
            const formattedCategories = categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                productCount: cat._count.products,
                categoryUrl: `/shop/${cat.slug}`,
                subCategories: includeSubCategories
                    ? cat.categorySubCategories.map(csc => ({
                        id: csc.subCategory.id,
                        name: csc.subCategory.name,
                        slug: csc.subCategory.slug,
                        productCount: csc.subCategory._count.products
                    }))
                    : []
            }));

            const totalProducts = formattedCategories.reduce((sum, cat) => sum + cat.productCount, 0);

            console.log(`✅ [CategoryLookup] Found ${categories.length} categories with ${totalProducts} total products`);

            return JSON.stringify({
                found: true,
                count: categories.length,
                totalProducts,
                categories: formattedCategories,
                message: `Found ${categories.length} categories with ${totalProducts} total products.`
            });

        } catch (error) {
            console.error(`❌ [CategoryLookup] Error:`, error);
            return JSON.stringify({
                found: false,
                categories: [],
                error: error.message,
                message: "Failed to fetch categories. Please try again."
            });
        }
    }
});
