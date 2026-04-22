import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import SubcategoryCard from "./SubcategoryCard";
import SubcategoriesGridSkeleton from "./SubcategorySkeleton";
import { API_ROUTES } from "../../constants/routes";

const SubcategoriesGrid = () => {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["subcategories"],
        queryFn: async () => {
            try {
                console.log('🔍 Fetching subcategories from:', API_ROUTES.GET_ALL_SUBCATEGORIES);
                const response = await api.get(API_ROUTES.GET_ALL_SUBCATEGORIES);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Failed to fetch subcategories");
                }

                const subcategories = response.data.data || [];
                console.log(`✅ Fetched ${subcategories.length} subcategories`);

                // Log the first item's media to verify structure
                if (subcategories.length > 0) {
                    console.log('📸 Sample Subcategory Media:', JSON.stringify(subcategories[0].media, null, 2));
                }

                return subcategories;
            } catch (err) {
                console.error('❌ Subcategories error:', err);
                throw err;
            }
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    if (isLoading) {
        return <SubcategoriesGridSkeleton />;
    }

    if (isError) {
        return (
            <View className="py-8 items-center px-6">
                <Text className="text-gray-600 mb-2 text-center font-semibold">
                    Failed to load subcategories
                </Text>
                <Text className="text-gray-500 mb-4 text-center text-sm">
                    {error?.response?.data?.message || error?.message || 'Unknown error'}
                </Text>
                <TouchableOpacity
                    onPress={() => refetch()}
                    className="bg-purple-600 px-6 py-3 rounded-xl"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="py-6 bg-gray-50">
            <FlatList
                data={data}
                renderItem={({ item }) => <SubcategoryCard category={item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{ paddingHorizontal: 16, marginBottom: 16 }}
                scrollEnabled={false}
            />
        </View>
    );
};

export default SubcategoriesGrid;
