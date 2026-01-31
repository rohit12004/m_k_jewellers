import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = 160; // Fixed width for chat carousel

export default function ChatProductCard({ product }) {
    const router = useRouter();
    const imageUrl = product?.image || product?.media?.[0]?.secure_url || null;

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(product.price || product.variants?.[0]?.calculatedPrice?.finalPrice || 0);

    return (
        <TouchableOpacity
            onPress={() => router.push(`/product/${product.slug}`)}
            activeOpacity={0.8}
            className="bg-white rounded-xl border border-amber-100 shadow-sm mr-3 overflow-hidden"
            style={{ width: cardWidth }}
        >
            {/* Image */}
            <View className="h-28 bg-amber-50 relative">
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-amber-300 text-xs">No Image</Text>
                    </View>
                )}

                {product.category && (
                    <View className="absolute top-2 right-2 bg-amber-600/90 rounded-full px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-white">{product.category}</Text>
                    </View>
                )}
            </View>

            {/* Details */}
            <View className="p-2">
                <Text className="text-xs font-semibold text-gray-800 mb-1" numberOfLines={2}>
                    {product.name}
                </Text>

                {(product.purity || product.weight) && (
                    <View className="flex-row gap-1 mb-2 flex-wrap">
                        {product.purity && (
                            <Text className="text-[9px] bg-amber-50 text-gray-500 px-1 rounded border border-amber-100">
                                {product.purity}
                            </Text>
                        )}
                        {product.weight && (
                            <Text className="text-[9px] bg-amber-50 text-gray-500 px-1 rounded border border-amber-100">
                                {product.weight}g
                            </Text>
                        )}
                    </View>
                )}

                <View className="flex-row items-center justify-between mt-auto">
                    <Text className="text-xs font-bold text-amber-700">
                        {formattedPrice}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
