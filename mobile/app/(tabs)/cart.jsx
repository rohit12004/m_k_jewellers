import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartPrices } from "../../hooks/useCartPrices";
import CartItem from "../../components/cart/CartItem";
import EmptyCart from "../../components/cart/EmptyCart";
import { router } from "expo-router";
import { useState } from "react";

export default function Cart() {
    const { cartProducts, subtotal, isLoading, error, refetch, itemCount } = useCartPrices();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Empty cart state
    if (itemCount === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <EmptyCart />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
                <Text className="text-sm text-gray-500 mt-1">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
            </View>

            {/* Cart Items */}
            <ScrollView
                className="flex-1 px-4 py-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {isLoading && cartProducts.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#9333EA" />
                        <Text className="text-gray-500 mt-4">Loading prices...</Text>
                    </View>
                ) : error ? (
                    <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <Text className="text-yellow-800 font-medium mb-1">
                            Unable to fetch latest prices
                        </Text>
                        <Text className="text-yellow-700 text-sm">
                            Pull down to refresh or check your internet connection
                        </Text>
                    </View>
                ) : null}

                {cartProducts.map((item) => (
                    <CartItem key={item.variantId} item={item} />
                ))}

                {/* Price Info Note */}
                <View className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                    <Text className="text-purple-800 text-sm">
                        💡 Prices are calculated based on current metal rates and update in real-time
                    </Text>
                </View>
            </ScrollView>

            {/* Footer - Price Summary & Actions */}
            <View className="border-t border-gray-200 bg-white px-4 py-4">
                {/* Subtotal */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-semibold text-gray-900">Subtotal</Text>
                    <Text className="text-2xl font-bold text-purple-600">
                        ₹{subtotal.toLocaleString('en-IN')}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/shop')}
                        className="flex-1 bg-gray-200 py-4 rounded-xl"
                        activeOpacity={0.7}
                    >
                        <Text className="text-gray-700 font-bold text-center">Continue Shopping</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(root)/checkout')}
                        className="flex-1 bg-purple-600 py-4 rounded-xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-center">Checkout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
