import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 64) / 3; // 3 columns with 16px padding on sides + gaps


const ProductCard = ({ product }) => {
    const router = useRouter();

    const imageUrl = product?.media && product.media.length > 0
        ? product.media[0].secure_url
        : null;

    const handlePress = () => {
        router.push(`/product/${product.slug}`);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            className="mb-4"
            style={{ width: cardWidth }}
        >
            {/* Product Image */}
            <View
                className="bg-white rounded-2xl overflow-hidden mb-2"
                style={{
                    width: cardWidth,
                    height: cardWidth,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <View className="w-full h-full bg-gray-200 items-center justify-center">
                        <Text className="text-gray-400 text-xs">No Image</Text>
                    </View>
                )}
            </View>

            {/* Product Info */}
            <View className="px-1">
                {/* Product Name */}
                <Text
                    className="text-sm font-semibold text-gray-900 mb-1"
                    numberOfLines={2}
                >
                    {product.name}
                </Text>

                {/* Price */}
                {product.variants && product.variants.length > 0 && product.variants[0].calculatedPrice ? (
                    <View>
                        <Text className="text-base font-bold text-purple-600">
                            ₹{product.variants[0].calculatedPrice.finalPrice.toLocaleString("en-IN")}
                        </Text>
                        {product.variants.length > 1 && (
                            <Text className="text-xs text-gray-500 mt-0.5">
                                +{product.variants.length - 1} variant{product.variants.length > 2 ? 's' : ''}
                            </Text>
                        )}
                    </View>
                ) : (
                    <Text className="text-sm text-gray-500">
                        Price on request
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;
