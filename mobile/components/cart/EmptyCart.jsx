import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function EmptyCart() {
    return (
        <View className="flex-1 items-center justify-center px-6">
            <View className="items-center mb-8">
                <Ionicons name="cart-outline" size={100} color="#D1D5DB" />
                <Text className="font-bold text-gray-800 mt-4 mb-2" style={{ fontSize: 24 }}>Cart Empty</Text>
                <Text className="text-gray-500 text-center">
                    Looks like you haven't added anything to your cart
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => router.push('/(tabs)/shop')}
                className="bg-purple-600 px-8 py-4 rounded-xl"
                activeOpacity={0.8}
            >
                <Text className="text-white font-bold">Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );
}
