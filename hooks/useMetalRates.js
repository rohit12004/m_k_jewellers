import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Custom hook to fetch and cache metal rates
 * Critical for pricing calculations - cached for 1 hour
 */
export function useMetalRates() {
    return useQuery({
        queryKey: ['metalRates'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/metal-rates');
            return data.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour - rates change daily usually
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
        refetchOnWindowFocus: false,
        retry: 2,
    });
}
