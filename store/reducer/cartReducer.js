import { createSlice } from "@reduxjs/toolkit";
import { MAX_UNIQUE_ITEMS, MAX_QTY_PER_ITEM } from "@/lib/cartLimits";

const initialState = {
    products: [],
    count: 0
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { productId, variantId, name, size, length, weight, color, purity, media, qty, subcategory, category } = action.payload;

            // Check if product variant already exists in cart
            const existingProductIndex = state.products.findIndex(
                item => item.productId === productId && item.variantId === variantId
            );

            if (existingProductIndex !== -1) {
                // Update quantity — cap at MAX_QTY_PER_ITEM
                const newQty = state.products[existingProductIndex].qty + qty;
                state.products[existingProductIndex].qty = Math.min(newQty, MAX_QTY_PER_ITEM);
            } else {
                // Enforce max unique items limit
                if (state.products.length >= MAX_UNIQUE_ITEMS) {
                    return; // Silently reject — UI layer shows the toast
                }
                // Add new product to cart (NO PRICE - Industry standard)
                state.products.push({
                    productId,
                    variantId,
                    name,
                    size,
                    length,
                    weight,
                    purity,
                    color,
                    media,
                    qty: Math.min(qty, MAX_QTY_PER_ITEM), // Cap initial qty too
                    subcategory,
                    category
                    // NO PRICE - Calculated fresh on demand
                });
            }

            // Update total count
            state.count = state.products.reduce((total, product) => total + product.qty, 0);
        },

        removeFromCart: (state, action) => {
            const { productId, variantId } = action.payload;

            // Remove product from cart
            state.products = state.products.filter(
                item => !(item.productId === productId && item.variantId === variantId)
            );

            // Update total count
            state.count = state.products.reduce((total, product) => total + product.qty, 0);
        },

        updateCartQuantity: (state, action) => {
            const { productId, variantId, qty } = action.payload;

            const productIndex = state.products.findIndex(
                item => item.productId === productId && item.variantId === variantId
            );

            if (productIndex !== -1) {
                if (qty <= 0) {
                    // Remove product if quantity is 0 or less
                    state.products.splice(productIndex, 1);
                } else {
                    // Update quantity — cap at MAX_QTY_PER_ITEM
                    state.products[productIndex].qty = Math.min(qty, MAX_QTY_PER_ITEM);
                }
            }

            // Update total count
            state.count = state.products.reduce((total, product) => total + product.qty, 0);
        },

        increaseQuantity: (state, action) => {
            const { productId, variantId } = action.payload;

            const productIndex = state.products.findIndex(
                item => item.productId === productId && item.variantId === variantId
            );

            if (productIndex !== -1) {
                // Enforce max qty per item limit
                if (state.products[productIndex].qty < MAX_QTY_PER_ITEM) {
                    state.products[productIndex].qty += 1;
                }
            }

            // Update total count
            state.count = state.products.reduce((total, product) => total + product.qty, 0);
        },

        decreaseQuantity: (state, action) => {
            const { productId, variantId } = action.payload;

            const productIndex = state.products.findIndex(
                item => item.productId === productId && item.variantId === variantId
            );

            if (productIndex !== -1) {
                if (state.products[productIndex].qty > 1) {
                    state.products[productIndex].qty -= 1;
                } else {
                    // Remove product if quantity would be 0
                    state.products.splice(productIndex, 1);
                }
            }

            // Update total count
            state.count = state.products.reduce((total, product) => total + product.qty, 0);
        },

        clearCart: (state) => {
            state.products = [];
            state.count = 0;
        }
    }
});

export const { addToCart, removeFromCart, updateCartQuantity, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
