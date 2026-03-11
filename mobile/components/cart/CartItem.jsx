import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { removeFromCart, increaseQuantity, decreaseQuantity } from "../../store/slices/cartSlice";

// Keep in sync with web/lib/cartLimits.js
const MAX_QTY_PER_ITEM = 5;

export default function CartItem({ item }) {
    const dispatch = useDispatch();

    const handleRemove = () => {
        dispatch(removeFromCart({
            productId: item.productId,
            variantId: item.variantId
        }));
    };

    const handleIncrease = () => {
        dispatch(increaseQuantity({
            productId: item.productId,
            variantId: item.variantId
        }));
    };

    const handleDecrease = () => {
        dispatch(decreaseQuantity({
            productId: item.productId,
            variantId: item.variantId
        }));
    };

    return (
        <View className="flex-row gap-3 mb-4 pb-4 border-b border-gray-200">
            {/* Product Image */}
            <View className="flex-shrink-0">
                <Image
                    source={{ uri: item.media }}
                    style={{ width: 80, height: 80 }}
                    contentFit="cover"
                    className="rounded-lg border border-gray-200"
                />
            </View>

            {/* Product Details and Price Container */}
            <View className="flex-1">
                {/* Top Row: Product Details and Price Side by Side */}
                <View className="flex-row justify-between gap-3 mr-5 ml-5">
                    {/* Product Details */}
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
                            {item.name}
                        </Text>

                        <Text className="text-sm text-gray-500 mb-1">
                            {item.color}{item.weight ? ` (${item.weight}g)` : ''}
                        </Text>

                        {item.size && (
                            <Text className="text-sm text-gray-500 mb-1">
                                Size: {item.size}
                            </Text>
                        )}

                        {item.length && (
                            <Text className="text-sm text-gray-500 mb-1">
                                Length: {item.length}
                            </Text>
                        )}
                    </View>

                    {/* Price */}
                    <View className="items-end justify-start">
                        {item.unitPrice > 0 ? (
                            <>
                                <Text className="text-base font-bold text-gray-900">
                                    ₹{item.totalPrice.toLocaleString('en-IN')}
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    {item.qty} × ₹{item.unitPrice.toLocaleString('en-IN')}
                                </Text>
                            </>
                        ) : (
                            <Text className="text-sm text-gray-400">Loading price...</Text>
                        )}
                    </View>
                </View>

                {/* Bottom Row: Quantity Controls and Remove Button */}
                <View className="flex-row items-center justify-between mt-3 mr-5 ml-5">
                    {/* Quantity Controls */}
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={handleDecrease}
                            className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="remove" size={18} color="#374151" />
                        </TouchableOpacity>

                        <Text className="text-base font-semibold text-gray-900 min-w-[24px] text-center">
                            {item.qty}
                        </Text>

                        <TouchableOpacity
                            onPress={handleIncrease}
                            disabled={item.qty >= MAX_QTY_PER_ITEM}
                            className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center"
                            style={{ opacity: item.qty >= MAX_QTY_PER_ITEM ? 0.4 : 1 }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={18} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Remove Button */}
                    <TouchableOpacity
                        onPress={handleRemove}
                        activeOpacity={0.7}
                    >
                        <Text className="text-red-500 text-sm font-medium">Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
