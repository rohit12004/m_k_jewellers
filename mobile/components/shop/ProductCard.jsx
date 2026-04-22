import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 64) / 3; // 3 columns with 16px padding on sides + 16px gap


const ProductCard = ({ product, width }) => {
    const router = useRouter();
    const finalWidth = width || cardWidth;

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
            style={{ width: finalWidth }}
        >
            {/* Product Image */}
            <View
                className="bg-white rounded-2xl overflow-hidden mb-2"
                style={{
                    width: finalWidth,
                    height: finalWidth,
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
                    className="text-sm text-center font-semibold text-gray-900 mb-1"
                    numberOfLines={2}
                >
                    {product.name}
                </Text>

                {/* Product Weight */}
                {product.variants && product.variants.length > 0 && (
                    <Text className="text-xs text-center text-gray-500 mb-1">
                        {product.variants[0].weight}g
                    </Text>
                )}

                {/* Price */}
                {product.variants && product.variants.length > 0 && product.variants[0].calculatedPrice ? (
                    <View>
                        <Text className="text-base text-center font-bold text-purple-600">
                            ₹{product.variants[0].calculatedPrice.finalPrice.toLocaleString("en-IN")}
                        </Text>
                        {product.variants.length > 1 && (
                            <Text className="text-[10px] text-center text-gray-400 mt-0.5">
                                +{product.variants.length - 1} more
                            </Text>
                        )}
                    </View>
                ) : (
                    <Text className="text-xs text-center text-gray-500">
                        Price on request
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;
