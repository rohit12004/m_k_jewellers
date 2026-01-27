import { useQuery } from "@tanstack/react-query";
import { API_SUBCATEGORY_GET_ALL } from "@/routes/websiteRoutes";

/**
 * Custom hook to fetch and cache all subcategories using TanStack Query
 * @returns {Object} Query result with subcategories data, loading state, and error
 */
export function useSubCategories() {
    return useQuery({
        queryKey: ['subcategories', 'all'],
        queryFn: async () => {
            const res = await fetch(API_SUBCATEGORY_GET_ALL);

            if (!res.ok) {
                throw new Error('Failed to fetch subcategories');
            }

            const data = await res.json();
            return data.success ? data.data : [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour - data stays fresh
        gcTime: 1000 * 60 * 60 * 2, // 2 hours - cache garbage collection
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
    });
}
