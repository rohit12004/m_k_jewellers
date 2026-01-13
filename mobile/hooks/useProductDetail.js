import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

/**
 * Custom hook to fetch product details by slug
 * @param {string} slug - Product slug
 * @param {Object} variantFilters - Optional variant filters (purity, size, weight)
 * @returns {Object} Query result with product details
 */
export const useProductDetail = (slug, variantFilters = {}) => {
    // Build query params for variant selection
    const params = new URLSearchParams();
    if (variantFilters.purity) params.append('purity', variantFilters.purity);
    if (variantFilters.size) params.append('size', variantFilters.size);
    if (variantFilters.weight) params.append('weight', variantFilters.weight);

    const queryString = params.toString();
    const url = `/api/product/details/${slug}${queryString ? `?${queryString}` : ''}`;

    return useQuery({
        queryKey: ['product-detail', slug, variantFilters],
        queryFn: async () => {
            const response = await api.get(url);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch product details');
            }
            return response.data.data;
        },
        enabled: !!slug, // Only run if slug is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: 2,
    });
};
