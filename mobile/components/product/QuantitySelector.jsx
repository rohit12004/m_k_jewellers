import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const QuantitySelector = ({ quantity, onChange }) => {
    const handleDecrease = () => {
        if (quantity > 1) {
            onChange(quantity - 1);
        }
    };

    const handleIncrease = () => {
        onChange(quantity + 1);
    };

    return (
        <View>
            <Text className="text-base font-semibold text-gray-900 mb-2">Quantity</Text>
            <View className="flex-row items-center">
                <TouchableOpacity
                    onPress={handleDecrease}
                    disabled={quantity <= 1}
                    className={`w-10 h-10 rounded-lg border items-center justify-center ${quantity <= 1 ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-400'
                        }`}
                    activeOpacity={0.7}
                >
                    <Ionicons name="remove" size={20} color={quantity <= 1 ? "#9ca3af" : "#374151"} />
                </TouchableOpacity>

                <Text className="text-lg font-semibold text-gray-900 mx-6 min-w-[30px] text-center">
                    {quantity}
                </Text>

                <TouchableOpacity
                    onPress={handleIncrease}
                    className="w-10 h-10 rounded-lg border border-gray-400 bg-white items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={20} color="#374151" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default QuantitySelector;
