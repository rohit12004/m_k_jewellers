import React from "react";
import { View, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const PromotionalBanner = () => {
    const router = useRouter();

    const handlePress = () => {
        router.push("/(tabs)/shop");
    };

    return (
        <View className="px-4 py-6">
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                className="rounded-2xl overflow-hidden bg-gray-200"
            >
                <Image
                    source={require("../../assets/advertising-banner.jpg")}
                    style={{ width: screenWidth - 32, height: 128 }}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </View>
    );
};

export default PromotionalBanner;
