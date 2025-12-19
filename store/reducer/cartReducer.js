import { createSlice } from "@reduxjs/toolkit";

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
                // Update quantity if product already exists
                state.products[existingProductIndex].qty += qty;
            } else {
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
                    qty,
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
                    // Update quantity
                    state.products[productIndex].qty = qty;
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
                state.products[productIndex].qty += 1;
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
