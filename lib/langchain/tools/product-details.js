/**
 * Product Details Tool
 * 
 * Fetches detailed information about a specific product by ID or slug.
 * Includes full description, specifications, all variants, and media.
 */

import { createTool, z } from "./index.js";
import prisma from "@/lib/prisma";

/**
 * Product Details Tool
 * Gets comprehensive details about a specific product
 */
export const productDetailsTool = createTool({
    name: "product_details",
    description: `Get detailed information about a specific product by ID or slug.

Use this tool when users:
- Ask about a specific product by name
- Want more details about a product from search results
- Ask "Tell me more about [product name]"
- Want to know specifications, variants, or pricing details

Returns complete product information including all variants, images, and specifications.`,

    schema: z.object({
        identifier: z.string().describe("Product ID (UUID) or slug to fetch details for")
    }),

    func: async ({ identifier }) => {
        try {
            console.log(`🔍 [ProductDetails] Fetching product: ${identifier}`);

            // Try to find by ID first, then by slug
            const product = await prisma.product.findFirst({
                where: {
                    OR: [
                        { id: identifier },
                        { slug: identifier }
                    ],
                    deletedAt: null
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    },
                    subCategory: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    },
                    media: {
                        select: {
                            id: true,
                            secure_url: true,
                            thumbnail_url: true,
                            alt: true,
                            title: true
                        }
                    },
                    variants: {
                        select: {
                            id: true,
                            weight: true,
                            purity: true,
                            size: true,
                            length: true,
                            gst: true,
                            labourCharge: true,
                            hallmarkCharges: true
                        }
                    }
                }
            });

            if (!product) {
                return JSON.stringify({
                    found: false,
                    product: null,
                    message: `Product not found with identifier: ${identifier}. Please check the product ID or slug.`
                });
            }

            // Calculate prices for each variant
            const metalRatePerGram = 6000; // Placeholder - should be fetched from MetalRate table

            const variantsWithPrices = product.variants.map(variant => {
                const basePrice = (variant.weight * metalRatePerGram) + variant.labourCharge + variant.hallmarkCharges;
                const finalPrice = basePrice + (basePrice * variant.gst / 100);

                return {
                    id: variant.id,
                    weight: variant.weight,
                    purity: variant.purity,
                    size: variant.size,
                    length: variant.length,
                    gst: variant.gst,
                    labourCharge: variant.labourCharge,
                    hallmarkCharges: variant.hallmarkCharges,
                    basePrice: Math.round(basePrice),
                    finalPrice: Math.round(finalPrice),
                    priceBreakdown: {
                        metalCost: Math.round(variant.weight * metalRatePerGram),
                        labourCharge: variant.labourCharge,
                        hallmarkCharges: variant.hallmarkCharges,
                        gst: Math.round(basePrice * variant.gst / 100)
                    }
                };
            });

            // Format product details
            const productDetails = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                gender: product.gender,
                category: {
                    id: product.category.id,
                    name: product.category.name,
                    slug: product.category.slug,
                    url: `/shop/${product.category.slug}`
                },
                subCategory: {
                    id: product.subCategory.id,
                    name: product.subCategory.name,
                    slug: product.subCategory.slug
                },
                variants: variantsWithPrices,
                variantCount: variantsWithPrices.length,
                priceRange: variantsWithPrices.length > 0 ? {
                    min: Math.min(...variantsWithPrices.map(v => v.finalPrice)),
                    max: Math.max(...variantsWithPrices.map(v => v.finalPrice))
                } : null,
                images: product.media.map(m => ({
                    id: m.id,
                    url: m.secure_url,
                    thumbnail: m.thumbnail_url,
                    alt: m.alt || product.name,
                    title: m.title
                })),
                imageCount: product.media.length,
                productUrl: `/products/${product.slug}`,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };

            console.log(`✅ [ProductDetails] Found product: ${product.name} with ${variantsWithPrices.length} variants`);

            return JSON.stringify({
                found: true,
                product: productDetails,
                message: `Successfully retrieved details for ${product.name}.`
            });

        } catch (error) {
            console.error(`❌ [ProductDetails] Error:`, error);
            return JSON.stringify({
                found: false,
                product: null,
                error: error.message,
                message: "Failed to fetch product details. Please try again."
            });
        }
    }
});
