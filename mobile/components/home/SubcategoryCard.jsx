import React from "react";
import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 48) / 3; // 3 columns with 16px padding on sides

const SubcategoryCard = ({ category }) => {
    const router = useRouter();

    const handlePress = () => {
        router.push({
            pathname: "/(tabs)/shop",
            params: { subcategory: category.slug }
        });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="items-center"
            activeOpacity={0.7}
            style={{ flex: 1, maxWidth: cardWidth }}
        >
            <View
                className="bg-white rounded-2xl shadow-sm mb-2 overflow-hidden"
                style={{
                    width: cardWidth - 8,
                    height: cardWidth - 8,
                }}
            >
                {category.media && category.media.length > 0 && category.media[0].secure_url ? (
                    <Image
                        source={{ uri: category.media[0].secure_url }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-full bg-gray-200 rounded-lg items-center justify-center">
                        <Text className="text-gray-400 text-xs">No Image</Text>
                    </View>
                )}
            </View>

            {/* Category name */}
            <Text
                className="text-xs font-semibold text-gray-800 text-center px-1"
                numberOfLines={2}
                style={{ width: cardWidth - 8 }}
            >
                {category.name}
            </Text>
        </TouchableOpacity>
    );
};

export default SubcategoryCard;
