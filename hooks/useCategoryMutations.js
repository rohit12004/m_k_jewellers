import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/lib/showToast";
import axios from "axios";

/**
 * Mutation hook for creating a new category
 * Automatically invalidates categories cache on success
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryData) => {
            const { data: response } = await axios.post('/api/category/create', categoryData);

            if (!response.success) {
                throw new Error(response.message);
            }

            return response;
        },
        onSuccess: (data) => {
            showToast('success', data.message || 'Category created successfully');
            // Invalidate all category-related queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            showToast('error', error.message || 'Failed to create category');
        }
    });
}

/**
 * Mutation hook for updating a category
 * Automatically invalidates categories cache on success
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryData) => {
            const { data: response } = await axios.put('/api/category/update', categoryData);

            if (!response.success) {
                throw new Error(response.message);
            }

            return response;
        },
        onSuccess: (data) => {
            showToast('success', data.message || 'Category updated successfully');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            showToast('error', error.message || 'Failed to update category');
        }
    });
}

/**
 * Mutation hook for creating a new subcategory
 * Automatically invalidates subcategories cache on success
 */
export function useCreateSubCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (subcategoryData) => {
            const { data: response } = await axios.post('/api/subcategory/create', subcategoryData);

            if (!response.success) {
                throw new Error(response.message);
            }

            return response;
        },
        onSuccess: (data) => {
            showToast('success', data.message || 'Subcategory created successfully');
            queryClient.invalidateQueries({ queryKey: ['subcategories'] });
        },
        onError: (error) => {
            showToast('error', error.message || 'Failed to create subcategory');
        }
    });
}

/**
 * Mutation hook for updating a subcategory
 * Automatically invalidates subcategories cache on success
 */
export function useUpdateSubCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (subcategoryData) => {
            const { data: response } = await axios.put('/api/subcategory/update', subcategoryData);

            if (!response.success) {
                throw new Error(response.message);
            }

            return response;
        },
        onSuccess: (data) => {
            showToast('success', data.message || 'Subcategory updated successfully');
            queryClient.invalidateQueries({ queryKey: ['subcategories'] });
        },
        onError: (error) => {
            showToast('error', error.message || 'Failed to update subcategory');
        }
    });
}
