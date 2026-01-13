import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import { API_ROUTES } from "../../../constants/routes";
import StatCard from "../../../components/StatCard";
import OrderCard from "../../../components/OrderCard";

export default function Dashboard() {
    const auth = useSelector((store) => store.authStore.auth);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch user orders
    const {
        data: ordersResponse,
        isLoading: loadingOrders,
        refetch: refetchOrders,
    } = useQuery({
        queryKey: ["user-orders", auth?.id],
        queryFn: async () => {
            const { data } = await api.get(API_ROUTES.GET_USER_ORDERS);
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch orders");
            }
            return data.data;
        },
        enabled: !!auth,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const ordersData = ordersResponse || null;

    // Pull-to-refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetchOrders();
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScrollView
            className="flex-1 bg-gray-50 px-6 py-4"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#3b82f6"]} // Android
                    tintColor="#3b82f6" // iOS
                />
            }
        >
            {/* Stats */}
            <View className="grid grid-cols-2 gap-3 mb-6">
                <StatCard
                    title="Total Orders"
                    value={loadingOrders ? "..." : ordersData?.summary?.totalOrders || 0}
                    iconName="bag-outline"
                    color="green"
                />
                <StatCard
                    title="Items Ordered"
                    value={loadingOrders ? "..." : ordersData?.summary?.totalItemsOrdered || 0}
                    iconName="cube-outline"
                    color="purple"
                />
            </View>
            <View className="mb-6">
                <StatCard
                    title="Total Spent"
                    value={
                        loadingOrders
                            ? "..."
                            : `₹${(ordersData?.summary?.totalAmountSpent || 0).toLocaleString("en-IN")}`
                    }
                    iconName="cash-outline"
                    color="orange"
                />
            </View>

            {/* Orders List */}
            <View className="mb-4">
                <Text className="text-xl font-bold text-gray-900 mb-3">Order History</Text>
                {loadingOrders ? (
                    <View className="items-center py-8">
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text className="text-gray-600 mt-2">Loading orders...</Text>
                    </View>
                ) : ordersData?.orders?.length > 0 ? (
                    ordersData.orders.map((order) => <OrderCard key={order.id} order={order} />)
                ) : (
                    <View className="bg-white border border-gray-200 rounded-lg p-8 items-center">
                        <Ionicons name="cart-outline" size={48} color="#9ca3af" />
                        <Text className="text-gray-600 mt-3 text-center">No orders yet</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Start shopping to see your orders here
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
