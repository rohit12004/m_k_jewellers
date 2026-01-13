import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { calculateCartPrices } from '../services/cartService';

/**
 * Hook to fetch fresh prices for cart items
 * @returns {Object} - Query result with cart items and prices
 */
export const useCartPrices = () => {
    const cart = useSelector(state => state.cartStore);

    const { data: cartWithPrices, isLoading, error, refetch } = useQuery({
        queryKey: ['cart-prices', cart.products],
        queryFn: () => calculateCartPrices(cart.products),
        enabled: cart.products.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        refetchOnWindowFocus: true,
        retry: 2
    });

    // Merge cart items with fresh prices
    const cartProducts = cart.products.map(item => {
        const priceData = cartWithPrices?.find(p => p.variantId === item.variantId);
        return {
            ...item,
            unitPrice: priceData?.unitPrice || 0,
            totalPrice: (priceData?.unitPrice || 0) * item.qty
        };
    });

    const subtotal = cartProducts.reduce((sum, product) => sum + product.totalPrice, 0);

    return {
        cartProducts,
        subtotal,
        isLoading,
        error,
        refetch,
        itemCount: cart.count
    };
};
