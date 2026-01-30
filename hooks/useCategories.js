import { useQuery } from "@tanstack/react-query";
import { API_CATEGORY_GET_FEATURED } from "@/routes/websiteRoutes";

/**
 * Custom hook to fetch and cache featured categories using TanStack Query
 * @param {Array} initialData - Optional server-fetched categories to use as initial data
 * @returns {Object} Query result with categories data, loading state, and error
 */
export function useCategories(initialData = null) {
    return useQuery({
        queryKey: ['categories', 'featured'],
        queryFn: async () => {
            const res = await fetch(API_CATEGORY_GET_FEATURED);

            if (!res.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await res.json();
            return data.success ? data.data : [];
        },
        // ✅ Use server-fetched data if available - prevents client-side fetch
        initialData: initialData && initialData.length > 0 ? initialData : undefined,
        staleTime: 1000 * 60 * 60, // 1 hour - data stays fresh
        gcTime: 1000 * 60 * 60 * 2, // 2 hours - cache garbage collection
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data exists
        retry: 2, // Retry failed requests 2 times
    });
}
