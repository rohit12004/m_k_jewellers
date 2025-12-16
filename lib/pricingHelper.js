import prisma from './prisma.js'
import { calculateVariantPrices } from './pricing/calculatePrice.js'

/**
 * Add calculated prices to product(s)
 * @param {Object|Array} products - Single product or array of products
 * @returns {Object|Array} Products with calculatedPrice added to variants
 */
export async function addCalculatedPrices(products) {
    // Fetch current metal rates once
    const metalRates = await prisma.metalRate.findMany()

    // Handle single product or array
    const isArray = Array.isArray(products)
    const productArray = isArray ? products : [products]

    // Add calculated prices to each product's variants
    const withPrices = productArray.map(product => {
        if (!product) return product

        return {
            ...product,
            variants: product.variants
                ? calculateVariantPrices(product, product.variants, metalRates)
                : []
        }
    })

    return isArray ? withPrices : withPrices[0]
}
