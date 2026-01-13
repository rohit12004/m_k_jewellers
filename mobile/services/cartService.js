import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Calculate fresh prices for cart items
 * @param {Array} cartItems - Array of cart items from Redux store
 * @returns {Promise} - Cart items with calculated prices
 */
export const calculateCartPrices = async (cartItems) => {
    try {
        const response = await axios.post(`${API_URL}/api/cart/calculate-prices`, {
            cartItems: cartItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                qty: item.qty,
                weight: item.weight,
                purity: item.purity,
                category: item.category,
                subcategory: item.subcategory,
                color: item.color,
                size: item.size,
                length: item.length,
                media: item.media,
                name: item.name,
                price: 0 // Will be calculated by backend
            }))
        });

        return response.data.data.items;
    } catch (error) {
        console.error('Error calculating cart prices:', error);
        throw error;
    }
};
