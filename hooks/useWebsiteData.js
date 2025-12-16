import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Custom hook to fetch and cache products with filters
 * Uses TanStack Query for automatic caching and background refetching
 */
export const useProductsBySubcategory = (filters = {}) => {
    // Build query string from filters
    const params = new URLSearchParams();

    if (filters.subcategory) params.append('subcategory', filters.subcategory);
    if (filters.category) params.append('category', filters.category);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.purity) params.append('purity', filters.purity);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    return useQuery({
        queryKey: ['products', filters],
        queryFn: async () => {
            const { data } = await axios.get(
                `/api/product/get-by-subcategory?${params.toString()}`
            );
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch products');
            }
            return data;
        },
        staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
        gcTime: 5 * 60 * 1000,    // Cache persists for 5 minutes
        retry: 2,
    });
};

/**
 * Custom hook to fetch available filter options
 * Returns dynamic filter values based on current filters
 */
export const useFilterOptions = (currentFilters = {}) => {
    const params = new URLSearchParams();

    if (currentFilters.subcategory) params.append('subcategory', currentFilters.subcategory);
    if (currentFilters.category) params.append('category', currentFilters.category);

    return useQuery({
        queryKey: ['filter-options', currentFilters],
        queryFn: async () => {
            const { data } = await axios.get(
                `/api/product/filter-options?${params.toString()}`
            );
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch filter options');
            }
            return data;
        },
        staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
        gcTime: 10 * 60 * 1000,   // Cache for 10 minutes
        retry: 2,
    });
};
