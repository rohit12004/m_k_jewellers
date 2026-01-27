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
        staleTime: 1000 * 60 * 60, // 1 hour - data stays fresh
        gcTime: 1000 * 60 * 60 * 2, // 2 hours - cache garbage collection
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch if data exists
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
        staleTime: 1000 * 60 * 60, // 1 hour - data stays fresh (matches categories)
        gcTime: 1000 * 60 * 60 * 2, // 2 hours - cache garbage collection
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch if data exists
        retry: 2,
    });
};
