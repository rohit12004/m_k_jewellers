import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { API_ROUTES } from "../../constants/routes";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.45; // 45% of screen width

const ProductCard = ({ product }) => {
    const router = useRouter();

    const handlePress = () => {
        router.push(`/product/${product.id}`);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="bg-white rounded-2xl overflow-hidden shadow-sm mr-3"
            style={{ width: cardWidth }}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: product.media?.[0]?.secure_url }}
                className="w-full h-40"
                contentFit="cover"
                transition={200}
            />
            <View className="p-3">
                <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
                    {product.name}
                </Text>
                {product.variants?.[0] && (
                    <Text className="text-lg font-bold text-purple-600">
                        ₹{product.variants[0].labourCharge?.toLocaleString("en-IN")}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const FeaturedProducts = () => {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["featured-products"],
        queryFn: async () => {
            const response = await api.get(API_ROUTES.GET_FEATURED_PRODUCTS);
            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch products");
            }
            return response.data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });

    if (isLoading) {
        return (
            <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text className="text-gray-500 mt-2">Loading products...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View className="py-8 items-center px-6">
                <Text className="text-gray-600 mb-2 text-center">
                    Failed to load products
                </Text>
                <Text className="text-gray-400 text-xs mb-4 text-center">
                    {error?.message || "Unknown error"}
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

    if (!data || data.length === 0) {
        return (
            <View className="py-8 items-center px-6">
                <Text className="text-gray-600 text-center">
                    No products available
                </Text>
            </View>
        );
    }

    return (
        <View className="py-6 bg-white">
            <View className="px-4 mb-4 flex-row justify-between items-center">
                <Text className="text-xl font-bold text-gray-900">
                    Featured Products
                </Text>
                <TouchableOpacity className="flex-row items-center">
                    <Text className="text-purple-600 font-semibold mr-1">View All</Text>
                    <Ionicons name="chevron-forward" size={16} color="#7c3aed" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={data}
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                snapToInterval={cardWidth + 12} // card width + margin
                decelerationRate="fast"
            />
        </View>
    );
};

export default FeaturedProducts;
