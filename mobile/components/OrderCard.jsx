import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
};

export default function OrderCard({ order }) {
    const router = useRouter();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const orderStatusClass = statusColors[order.orderStatus] || statusColors.pending;
    const paymentStatusClass = paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending;

    return (
        <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
            {/* Header */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs mb-1">Order ID</Text>
                    <Text className="text-gray-900 font-semibold text-base">
                        #{order.orderId}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-500 text-xs mb-1">Date</Text>
                    <Text className="text-gray-700 text-sm">
                        {formatDate(order.createdAt)}
                    </Text>
                </View>
            </View>

            {/* Details */}
            <View className="flex-row justify-between items-center mb-3">
                <View>
                    <Text className="text-gray-500 text-xs mb-1">Total Amount</Text>
                    <Text className="text-gray-900 font-bold text-lg">
                        ₹{order.total.toLocaleString("en-IN")}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-500 text-xs mb-1">Items</Text>
                    <Text className="text-gray-700 font-medium">
                        {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </Text>
                </View>
            </View>

            {/* Status Badges */}
            <View className="flex-row gap-2 mb-3">
                <View className={`${paymentStatusClass} px-3 py-1 rounded-full`}>
                    <Text className="text-xs font-medium capitalize">
                        {order.paymentStatus}
                    </Text>
                </View>
                <View className={`${orderStatusClass} px-3 py-1 rounded-full`}>
                    <Text className="text-xs font-medium capitalize">
                        {order.orderStatus}
                    </Text>
                </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity
                className="bg-blue-600 py-2.5 rounded-lg flex-row items-center justify-center"
                onPress={() => {
                    // TODO: Navigate to order details page when implemented
                    console.log("View order details:", order.orderId);
                }}
            >
                <Ionicons name="eye-outline" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">View Details</Text>
            </TouchableOpacity>
        </View>
    );
}
