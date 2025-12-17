import prisma from '@/lib/prisma'
import { addCalculatedPrices } from '@/lib/pricingHelper'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
    try {
        const { slug } = await params
        const { searchParams } = new URL(request.url)

        // Get optional variant filters from query params
        const requestedPurity = searchParams.get('purity')
        const requestedSize = searchParams.get('size')
        const requestedWeight = searchParams.get('weight')

        // Fetch product by slug with all relations
        const product = await prisma.product.findFirst({
            where: {
                slug: slug,
                deletedAt: null
            },
            include: {
                media: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'asc' }
                },
                variants: true,
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
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            )
        }

        // Add calculated prices to all variants
        const productWithPrices = await addCalculatedPrices(product)

        // Extract unique variant options
        const purities = [...new Set(productWithPrices.variants.map(v => v.purity))].filter(Boolean)
        const sizes = [...new Set(productWithPrices.variants.map(v => v.size))].filter(Boolean)
        const weights = [...new Set(productWithPrices.variants.map(v => v.weight))].filter(Boolean)

        // Find selected variant based on query params or default to first variant
        let selectedVariant = productWithPrices.variants[0]

        if (requestedPurity || requestedSize || requestedWeight) {
            const matchedVariant = productWithPrices.variants.find(variant => {
                const purityMatch = !requestedPurity || variant.purity === requestedPurity
                const sizeMatch = !requestedSize || variant.size === requestedSize
                const weightMatch = !requestedWeight || variant.weight === parseFloat(requestedWeight)

                return purityMatch && sizeMatch && weightMatch
            })

            if (matchedVariant) {
                selectedVariant = matchedVariant
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                product: {
                    id: productWithPrices.id,
                    name: productWithPrices.name,
                    slug: productWithPrices.slug,
                    description: productWithPrices.description,
                    gender: productWithPrices.gender,
                    category: productWithPrices.category,
                    subCategory: productWithPrices.subCategory
                },
                selectedVariant,
                allVariants: productWithPrices.variants,
                purities,
                sizes,
                weights,
                media: productWithPrices.media
            }
        })

    } catch (error) {
        console.error('Error fetching product details:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product details' },
            { status: 500 }
        )
    }
}
