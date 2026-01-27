import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/lib/showToast";
import axios from "axios";

/**
 * Mutation hook for updating metal rates
 * Automatically invalidates metal rates and cart prices on success
 */
export function useUpdateMetalRates() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rates) => {
            const { data } = await axios.post('/api/admin/metal-rates', { rates });
            return data;
        },
        onSuccess: () => {
            // Invalidate metal rates cache
            queryClient.invalidateQueries({ queryKey: ['metalRates'] });

            // Invalidate cart prices so users see updated prices immediately
            queryClient.invalidateQueries({ queryKey: ['cart-prices'] });

            // Invalidate product listings (Shop Page) to reflect new pricing
            queryClient.invalidateQueries({ queryKey: ['products'] });

            showToast('success', 'Metal rates updated successfully!');
        },
        onError: (error) => {
            showToast('error', error.response?.data?.message || 'Failed to update rates');
        }
    });
}
