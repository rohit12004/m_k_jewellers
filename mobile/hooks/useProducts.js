import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { API_ROUTES } from "../constants/routes";

/**
 * Custom hook to fetch products with filters
 * @param {Object} filters - Filter parameters
 * @returns {Object} Query result with products data
 */
export const useProductsBySubcategory = (filters = {}) => {
    // Build query params
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
            const response = await api.get(
                `${API_ROUTES.GET_PRODUCTS_BY_SUBCATEGORY}?${params.toString()}`
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch products');
            }
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000,    // 5 minutes
        retry: 2,
    });
};

/**
 * Custom hook to fetch available filter options
 * @param {Object} currentFilters - Current filter state
 * @returns {Object} Query result with filter options
 */
export const useFilterOptions = (currentFilters = {}) => {
    const params = new URLSearchParams();

    if (currentFilters.subcategory) params.append('subcategory', currentFilters.subcategory);
    if (currentFilters.category) params.append('category', currentFilters.category);

    return useQuery({
        queryKey: ['filter-options', currentFilters],
        queryFn: async () => {
            const response = await api.get(
                `${API_ROUTES.GET_FILTER_OPTIONS}?${params.toString()}`
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch filter options');
            }
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: 2,
    });
};
