import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Custom hook to fetch and cache products by subcategory
 * Uses TanStack Query for automatic caching and background refetching
 */
export const useProductsBySubcategory = (subcategory, page = 1, limit = 12) => {
    return useQuery({
        queryKey: ['products', subcategory, page],
        queryFn: async () => {
            const { data } = await axios.get(
                `/api/product/get-by-subcategory?subcategory=${subcategory}&page=${page}&limit=${limit}`
            );
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch products');
            }
            return data;
        },
        staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
        gcTime: 5 * 60 * 1000,    // Cache persists for 5 minutes
        enabled: !!subcategory,   // Only fetch if subcategory is provided
        retry: 2,
    });
};
