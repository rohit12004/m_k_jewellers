import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { API_ROUTES } from "../constants/routes";

/**
 * Custom hook to fetch and verify cart prices for checkout
 * Ensures prices are fresh and accurate before payment
 */
export const useCheckoutPrices = (cartProducts, enabled = true) => {
    return useQuery({
        queryKey: ['checkout-prices', cartProducts],
        queryFn: async () => {
            const { data } = await api.post(API_ROUTES.CALCULATE_CART_PRICES, {
                cartItems: cartProducts.map(item => ({
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
                }))
            });

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch prices');
            }

            return data.data.items;
        },
        enabled: cartProducts.length > 0 && enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes - shorter than cart to ensure fresh prices
        refetchOnWindowFocus: true,
        retry: 2,
    });
};
