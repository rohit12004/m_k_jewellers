/**
 * Calculate product price based on variant attributes and current metal rates
 * @param {Object} product - Product with category relation
 * @param {Object} variant - ProductVariant with weight, purity, charges
 * @param {Array} metalRates - Array of current metal rates
 * @returns {Object|null} Calculated price breakdown or null if rate not found
 */
export function calculatePrice(product, variant, metalRates) {
    // Get category name (e.g., "Gold", "Silver")
    const categoryName = product.category?.name

    if (!categoryName) {
        console.error('Product category not found')
        return null
    }

    // Find rate for this category + purity
    const rate = metalRates.find(
        r => r.categoryName?.toLowerCase() === categoryName.toLowerCase() &&
            r.purity === variant.purity
    )

    if (!rate) {
        console.warn(`No rate found for ${categoryName} ${variant.purity}`)
        return null
    }

    // 1. Metal cost: weight × rate per gram
    const metalCost = variant.weight * rate.ratePerGram

    // 2. Labour charges (percentage of metal cost)
    const labourChargePercent = variant.labourCharge || 0
    const labourCharge = metalCost * (labourChargePercent / 100)

    // 3. Subtotal (before hallmark)
    const subtotalBeforeHallmark = metalCost + labourCharge

    // 4. GST (applied to metal + labour, before hallmark)
    const gstAmount = subtotalBeforeHallmark * (variant.gst / 100)

    // 5. Add hallmark charges (after GST)
    const hallmarkCharges = variant.hallmarkCharges || 0

    // 6. Final price
    const finalPrice = subtotalBeforeHallmark + gstAmount + hallmarkCharges

    return {
        metalCost: Math.round(metalCost),
        labourCharge: Math.round(labourCharge),
        hallmarkCharges: Math.round(hallmarkCharges),
        subtotal: Math.round(subtotalBeforeHallmark),
        gst: Math.round(gstAmount),
        finalPrice: Math.round(finalPrice),
        breakdown: {
            rate: rate.ratePerGram,
            weight: variant.weight,
            purity: variant.purity,
            categoryName: categoryName,
            gstPercentage: variant.gst
        }
    }
}

/**
 * Calculate prices for multiple variants
 * @param {Object} product - Product with category relation
 * @param {Array} variants - Array of ProductVariants
 * @param {Array} metalRates - Array of current metal rates
 * @returns {Array} Variants with calculated prices
 */
export function calculateVariantPrices(product, variants, metalRates) {
    return variants.map(variant => ({
        ...variant,
        calculatedPrice: calculatePrice(product, variant, metalRates)
    }))
}
