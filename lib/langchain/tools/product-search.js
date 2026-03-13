/**
 * Product Search Tool
 * 
 * Searches products in the database with filters for category, price, material, etc.
 * Returns formatted product results for the agent to present to users.
 */

import { createTool, z } from "./index.js";
import prisma from "@/lib/prisma";
import { calculatePrice } from "@/lib/pricing/calculatePrice";

/**
 * Product Search Tool
 * Searches the product database with various filters
 */
export const productSearchTool = createTool({
    name: "product_search",
    description: `REQUIRED TOOL: Search for jewelry products in the database with optional filters.

WHEN TO USE THIS TOOL (MANDATORY):
- User wants to browse products by category (rings, necklaces, earrings, bracelets, etc.)
- User asks to "show me" or "find" any type of jewelry
- User wants products within a price range
- User searches by material/purity (gold, silver, diamond, 22K, 18K, etc.)
- User searches by keywords in product name or description
- User wants to filter by gender (MEN, WOMEN)
- User asks "do you have" any specific type of product

DO NOT provide generic product information. ALWAYS use this tool to get real products from the database.

Returns a list of actual products with name, price, category, images, and links.`,

    schema: z.object({
        category: z.string().optional().describe("Main Material Category (e.g., 'gold', 'silver', 'other'). DO NOT use for 'rings', 'necklaces' etc."),
        subCategory: z.string().optional().describe("Product Type (e.g., 'rings', 'necklaces', 'earrings', 'bracelets', 'chains')"),
        minPrice: z.number().optional().describe("Minimum price filter in rupees"),
        maxPrice: z.number().optional().describe("Maximum price filter in rupees"),
        purity: z.string().optional().describe("Material purity filter (e.g., '22K', '18K', '24K', '92.5' for silver)"),
        gender: z.enum(["MEN", "WOMEN"]).optional().describe("Gender filter"),
        keywords: z.string().optional().describe("Search keywords for product name or description"),
        limit: z.number().default(5).describe("Maximum number of results to return (default: 5, max: 10)")
    }),

    func: async ({ category, subCategory, minPrice, maxPrice, purity, gender, keywords, limit = 5 }) => {
        try {
            // Limit to max 10 products
            const resultLimit = Math.min(limit, 10);

            console.log(`🔍 [ProductSearch] Searching with filters:`, {
                category, subCategory, minPrice, maxPrice, purity, gender, keywords, limit: resultLimit
            });

            // Build where clause
            const whereClause = {
                deletedAt: null, // Only active products
                AND: []
            };

            // Fetch metal rates for accurate pricing/filtering
            const metalRates = await prisma.metalRate.findMany();

            // Category filter
            // Category/SubCategory flexible filter
            if (category) {
                const categorySlug = category.toLowerCase();
                whereClause.AND.push({
                    OR: [
                        { category: { slug: categorySlug } },
                        { subCategory: { slug: categorySlug } }
                    ]
                });
            }

            // SubCategory filter
            if (subCategory) {
                const subCategorySlug = subCategory.toLowerCase();
                whereClause.AND.push({
                    subCategory: { slug: subCategorySlug }
                });
            }

            // Gender filter
            if (gender) {
                whereClause.AND.push({ gender });
            }

            // Keywords search (in name or description)
            if (keywords) {
                whereClause.AND.push({
                    OR: [
                        { name: { contains: keywords, mode: 'insensitive' } },
                        { description: { contains: keywords, mode: 'insensitive' } }
                    ]
                });
            }

            // Query products
            const products = await prisma.product.findMany({
                where: whereClause.AND.length > 0 ? whereClause : { deletedAt: null },
                include: {
                    category: { select: { name: true, slug: true } },
                    subCategory: { select: { name: true, slug: true } },
                    media: {
                        take: 1,
                        select: {
                            secure_url: true,
                            thumbnail_url: true,
                            alt: true
                        }
                    },
                    variants: {
                        select: {
                            weight: true,
                            purity: true,
                            size: true,
                            length: true,
                            gst: true,
                            labourCharge: true,
                            hallmarkCharges: true
                        }
                    }
                },
                take: resultLimit
            });

            // Filter by purity if specified (check variants)
            let filteredProducts = products;
            if (purity) {
                filteredProducts = products.filter(p =>
                    p.variants.some(v => v.purity === purity)
                );
            }

            // Filter by price range if specified
            if (minPrice !== undefined || maxPrice !== undefined) {
                filteredProducts = filteredProducts.filter(p => {
                    // Calculate base price from first variant
                    if (p.variants.length === 0) return false;

                    const variant = p.variants[0];
                    const categoryName = p.category?.name;

                    // Use shared helper for price calculation
                    const priceDetails = calculatePrice(p, variant, metalRates);
                    const finalPrice = priceDetails ? priceDetails.finalPrice : 0;

                    if (minPrice !== undefined && finalPrice < minPrice) return false;
                    if (maxPrice !== undefined && finalPrice > maxPrice) return false;
                    return true;
                });
            }

            // Limit results after filtering
            filteredProducts = filteredProducts.slice(0, resultLimit);

            if (filteredProducts.length === 0) {
                return JSON.stringify({
                    found: false,
                    count: 0,
                    products: [],
                    message: "No products found matching the specified criteria. Try adjusting the filters or suggest browsing other categories."
                });
            }

            // Format products for agent response
            const formattedProducts = filteredProducts.map(p => {
                const variant = p.variants[0] || {};
                const image = p.media[0];

                // Calculate price dynamically
                let finalPrice = 0;
                if (variant.weight) {
                    const priceDetails = calculatePrice(p, variant, metalRates);
                    finalPrice = priceDetails ? priceDetails.finalPrice : 0;
                }

                return {
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description.substring(0, 150) + (p.description.length > 150 ? '...' : ''),
                    category: p.category.name,
                    categorySlug: p.category.slug,
                    subCategory: p.subCategory.name,
                    gender: p.gender,
                    price: Math.round(finalPrice),
                    weight: variant.weight,
                    purity: variant.purity,
                    size: variant.size,
                    length: variant.length,
                    image: image?.secure_url || image?.thumbnail_url || null,
                    imageAlt: image?.alt || p.name,
                    productUrl: `/products/${p.slug}`,
                    shopUrl: `/shop?category=${p.category.slug}&subcategory=${p.subCategory.slug}`
                };
            });

            console.log(`✅ [ProductSearch] Found ${formattedProducts.length} products`);

            return JSON.stringify({
                found: true,
                count: formattedProducts.length,
                products: formattedProducts,
                message: `Found ${formattedProducts.length} product(s) matching the criteria.`
            });

        } catch (error) {
            console.error(`❌ [ProductSearch] Error:`, error);
            return JSON.stringify({
                found: false,
                count: 0,
                products: [],
                error: error.message,
                message: "Failed to search products. Please try again or contact support."
            });
        }
    }
});
