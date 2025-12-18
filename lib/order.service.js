import prisma from './prisma.js'
import { addCalculatedPrices } from './pricingHelper.js'

/**
 * Verify cart prices by recalculating them server-side
 * @param {Array} cartItems - Cart items from frontend
 * @returns {Object} { valid: boolean, verifiedItems: Array, totalMismatch: number }
 */
export async function verifyCartPrices(cartItems) {
    try {
        // Extract unique product IDs
        const productIds = [...new Set(cartItems.map(item => item.productId))]

        // Fetch products with variants and category
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                deletedAt: null
            },
            include: {
                category: true,
                variants: true
            }
        })

        // Add calculated prices
        const productsWithPrices = await addCalculatedPrices(products)

        // Verify each cart item
        const verifiedItems = []
        let totalMismatch = 0

        for (const cartItem of cartItems) {
            const product = productsWithPrices.find(p => p.id === cartItem.productId)

            if (!product) {
                throw new Error(`Product ${cartItem.productId} not found`)
            }

            const variant = product.variants.find(v => v.id === cartItem.variantId)

            if (!variant) {
                throw new Error(`Variant ${cartItem.variantId} not found`)
            }

            if (!variant.calculatedPrice) {
                throw new Error(`Price calculation failed for variant ${cartItem.variantId}`)
            }

            const serverPrice = variant.calculatedPrice.finalPrice
            const clientPrice = cartItem.price
            const priceDifference = Math.abs(serverPrice - clientPrice)

            // Allow ₹10 tolerance for rounding differences
            if (priceDifference > 10) {
                totalMismatch += priceDifference
            }

            verifiedItems.push({
                productId: cartItem.productId,
                variantId: cartItem.variantId,
                name: product.name,
                weight: variant.weight,
                purity: variant.purity,
                size: variant.size || null,
                length: variant.length || null,
                color: cartItem.color || null,
                qty: cartItem.qty,
                unitPrice: serverPrice, // Use server-calculated price
                totalPrice: serverPrice * cartItem.qty,
                metalRate: variant.calculatedPrice.breakdown.rate,
                category: product.category.name,
                subcategory: cartItem.subcategory || '',
                media: cartItem.media || null
            })
        }

        return {
            valid: totalMismatch <= 10, // Allow small rounding differences
            verifiedItems,
            totalMismatch
        }

    } catch (error) {
        console.error('Cart verification error:', error)
        throw error
    }
}

/**
 * Create order with products in a transaction
 * @param {Object} orderData - Order information
 * @param {Array} products - Verified product items
 * @returns {Object} Created order
 */
export async function createOrderWithProducts(orderData, products) {
    try {
        const order = await prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    userId: orderData.userId || null,
                    email: orderData.email,
                    phone: orderData.phone,
                    address: orderData.address,
                    panCard: orderData.panCard,
                    total: orderData.total,
                    paymentId: orderData.paymentId,
                    orderId: orderData.orderId,
                    paymentStatus: orderData.paymentStatus || 'PENDING',
                    orderStatus: 'PENDING'
                }
            })

            // Create order products
            await tx.orderProduct.createMany({
                data: products.map(product => ({
                    orderId: newOrder.id,
                    productId: product.productId,
                    variantId: product.variantId,
                    name: product.name,
                    weight: product.weight,
                    purity: product.purity,
                    size: product.size,
                    length: product.length,
                    color: product.color,
                    qty: product.qty,
                    unitPrice: product.unitPrice,
                    totalPrice: product.totalPrice,
                    metalRate: product.metalRate,
                    category: product.category,
                    subcategory: product.subcategory,
                    media: product.media
                }))
            })

            return newOrder
        })

        return order

    } catch (error) {
        console.error('Order creation error:', error)
        throw error
    }
}

/**
 * Get order by Razorpay order ID
 * @param {String} razorpay_order_id - Razorpay order ID
 * @returns {Object} Order with products
 */
export async function getOrderByRazorpayId(razorpay_order_id) {
    try {
        const order = await prisma.order.findUnique({
            where: { orderId: razorpay_order_id },
            include: {
                products: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return order

    } catch (error) {
        console.error('Order fetch error:', error)
        throw error
    }
}

/**
 * Update user's PAN card if not already set
 * @param {String} userId - User ID
 * @param {String} panCard - PAN card number
 * @returns {Object} Updated user
 */
export async function updateUserPanCard(userId, panCard) {
    try {
        console.log('=== updateUserPanCard called ===')
        console.log('User ID:', userId)
        console.log('PAN Card:', panCard)

        // Check if user already has PAN card
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { panCard: true }
        })

        console.log('User found:', user)

        if (!user) {
            throw new Error('User not found')
        }

        // Only update if PAN card is not already set
        if (!user.panCard && panCard) {
            console.log('Updating PAN card in database...')
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { panCard }
            })
            console.log('PAN card updated successfully:', updatedUser.panCard)
            return updatedUser
        } else {
            console.log('PAN card not updated. Existing PAN:', user.panCard)
        }

        return user

    } catch (error) {
        console.error('PAN card update error:', error)
        throw error
    }
}
