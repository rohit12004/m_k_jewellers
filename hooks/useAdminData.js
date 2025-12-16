import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Custom hook to fetch and cache categories
 * Uses TanStack Query for automatic caching and background refetching
 */
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get('/api/category?deleteType=SD&size=10000');
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch categories');
            }
            return data;
        },
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        gcTime: 10 * 60 * 1000,   // Cache persists for 10 minutes (formerly cacheTime)
        retry: 2, // Retry failed requests twice
    });
};

/**
 * Custom hook to fetch and cache subcategories
 * Uses TanStack Query for automatic caching and background refetching
 */
export const useSubcategories = () => {
    return useQuery({
        queryKey: ['subcategories'],
        queryFn: async () => {
            const { data } = await axios.get('/api/subcategory?deleteType=SD&size=10000');
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch subcategories');
            }
            return data;
        },
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        gcTime: 10 * 60 * 1000,   // Cache persists for 10 minutes
        retry: 2,
    });
};
