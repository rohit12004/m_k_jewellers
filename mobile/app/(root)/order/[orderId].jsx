import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";
import api from "../../../services/api";
import { API_ROUTES, ROUTES, API_BASE_URL } from "../../../constants/routes";
import { Image } from "expo-image";
import { showToast } from "../../../utils/toast";

export default function OrderDetails() {
    const { orderId } = useLocalSearchParams();
    const router = useRouter();
    const [downloading, setDownloading] = useState(false);

    // Fetch order details
    const { data: order, isLoading, error } = useQuery({
        queryKey: ["order-details", orderId],
        queryFn: async () => {
            const { data } = await api.get(API_ROUTES.GET_ORDER_DETAILS(orderId));
            if (!data.success) {
                throw new Error(data.message || "Failed to fetch order details");
            }
            // backend returns: { success: true, data: orderObject }
            return data.data;
        },
        enabled: !!orderId,
    });

    const downloadReceipt = async () => {
        setDownloading(true);
        try {
            // Get auth token from SecureStore
            let token = await SecureStore.getItemAsync("access_token");

            if (!token) {
                showToast("error", "Authentication Error", "Please login again");
                return;
            }

            // Try to refresh the token first to ensure it's valid
            try {
                const refreshResponse = await api.post('/api/auth/refresh');
                if (refreshResponse.data.success && refreshResponse.data.data.access_token) {
                    token = refreshResponse.data.data.access_token;
                    await SecureStore.setItemAsync("access_token", token);
                }
            } catch (refreshError) {
                // Continue with existing token, might still work
            }

            // Use cache directory for better sharing compatibility
            const fileName = `MK_Jewellers_Receipt_${orderId}.pdf`;
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
            const downloadUrl = `${API_BASE_URL}${API_ROUTES.GET_RECEIPT(orderId)}`;



            const downloadResult = await FileSystem.downloadAsync(
                downloadUrl,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );



            if (downloadResult.status === 200) {
                // Verify file exists and get info
                const fileInfo = await FileSystem.getInfoAsync(fileUri);


                if (!fileInfo.exists) {
                    throw new Error('File was not saved properly');
                }

                if (fileInfo.size === 0) {
                    throw new Error('Downloaded file is empty');
                }

                // Validate that the file is actually a PDF by checking the header
                const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                    length: 100, // Read first 100 bytes to check header
                });

                // Decode base64 to check PDF magic number
                const pdfHeader = atob(fileContent.substring(0, 20));


                if (!pdfHeader.startsWith('%PDF')) {
                    // File is not a PDF, might be an error response
                    // Try to read as text to see the error
                    const errorContent = await FileSystem.readAsStringAsync(fileUri);
                    console.error('Invalid PDF file. Content:', errorContent);

                    // Try to parse as JSON error
                    try {
                        const errorJson = JSON.parse(errorContent);
                        const errorMessage = errorJson.message || 'Backend returned an error instead of PDF';
                        throw new Error(errorMessage);
                    } catch (parseError) {
                        // If not JSON, show generic error
                        if (parseError instanceof SyntaxError) {
                            throw new Error('Downloaded file is not a valid PDF document');
                        }
                        // Re-throw if it's our custom error
                        throw parseError;
                    }
                }


                showToast("success", "Success", "Receipt downloaded successfully");

                // Share/Open the file with proper MIME type and UTI
                const canShare = await Sharing.isAvailableAsync();
                if (canShare) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: "application/pdf",
                        dialogTitle: "Share Receipt",
                        UTI: "com.adobe.pdf", // iOS Uniform Type Identifier for PDF
                    });
                } else {
                    showToast("info", "Info", "Sharing is not available on this device");
                }
            } else {
                throw new Error(`Failed to download receipt: HTTP ${downloadResult.status}`);
            }
        } catch (error) {
            console.error("Download receipt error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            showToast("error", "Download Failed", error.message || "Failed to download receipt");
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text className="text-gray-600 mt-4">Loading order details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !order) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text className="text-red-600 text-lg font-semibold mt-4">Order not found</Text>
                    <Text className="text-gray-600 text-center mt-2">
                        {error?.message || "Unable to load order details"}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push(ROUTES.ACCOUNT)}
                        className="bg-purple-600 px-6 py-3 rounded-xl mt-6"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-semibold">View All Orders</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Products are returned as 'products' array relation, no parsing needed
    const cartItems = order.products || [];

    // Parse address (it is stored as JSON string)
    let parsedAddress = null;
    try {
        parsedAddress = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
    } catch (e) {
        parsedAddress = { street: order.address };
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.push(ROUTES.ACCOUNT)} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">Order Details</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Success Message */}
                <View className="bg-green-50 mx-4 mt-4 p-4 rounded-xl border border-green-200">
                    <View className="flex-row items-center">
                        <View className="bg-green-500 w-12 h-12 rounded-full items-center justify-center mr-3">
                            <Ionicons name="checkmark" size={28} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-green-800">Order Placed Successfully!</Text>
                            <Text className="text-sm text-green-700 mt-1">
                                Thank you for your purchase
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Receipt Download Info */}
                <View className="bg-blue-50 mx-4 mt-3 p-3 rounded-xl border border-blue-200">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#3b82f6" className="mt-0.5 mr-2" />
                        <Text className="text-sm text-blue-800 flex-1">
                            You can download your receipt anytime from the <Text className="font-semibold">Account</Text> tab
                        </Text>
                    </View>
                </View>

                {/* Order Info Card */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Order Information</Text>

                    <View className="space-y-3">
                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-600">Order ID</Text>
                            <Text className="font-semibold text-gray-900" numberOfLines={1}>
                                {order.orderId}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-600">Payment ID</Text>
                            <Text className="font-semibold text-gray-900" numberOfLines={1}>
                                {order.paymentId}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-600">Status</Text>
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-green-700 font-semibold text-xs">
                                    {order.orderStatus || "Confirmed"}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-600">Order Date</Text>
                            <Text className="font-semibold text-gray-900">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-2">
                            <Text className="text-gray-600">Total Amount</Text>
                            <Text className="text-xl font-bold text-purple-600">
                                ₹{Number(order.total).toLocaleString("en-IN")}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Delivery Address Card */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
                    <Text className="text-lg font-bold text-gray-900 mb-3">Delivery Address</Text>
                    {parsedAddress ? (
                        <View className="bg-gray-50 p-3 rounded-lg">
                            <Text className="text-gray-700">{parsedAddress.street}</Text>
                            {parsedAddress.street2 && <Text className="text-gray-700">{parsedAddress.street2}</Text>}
                            <Text className="text-gray-700">
                                {parsedAddress.city}, {parsedAddress.state} - {parsedAddress.postalCode}
                            </Text>
                        </View>
                    ) : (
                        <Text className="text-gray-500">No address provided</Text>
                    )}
                </View>

                {/* Order Items Card */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-xl mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Order Items ({cartItems.length})
                    </Text>

                    {cartItems.map((item, index) => (
                        <View key={index} className="flex-row gap-3 mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                            <Image
                                source={{ uri: item.media }}
                                style={{ width: 70, height: 70 }}
                                contentFit="cover"
                                className="rounded-lg border border-gray-200"
                            />
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text className="text-xs text-gray-500 mt-1">
                                    {item.color} {item.weight ? `(${item.weight}g)` : ""}
                                </Text>
                                {item.size && (
                                    <Text className="text-xs text-gray-500">Size: {item.size}</Text>
                                )}
                                <View className="flex-row justify-between items-center mt-2">
                                    <Text className="text-sm text-gray-600">
                                        Qty: {item.qty}
                                    </Text>
                                    <Text className="text-sm font-bold text-gray-900">
                                        {/* Use total price from item which is already calculated */}
                                        ₹{Number(item.totalPrice).toLocaleString("en-IN")}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View className="mx-4 mb-5 flex gap-3">
                    <TouchableOpacity
                        onPress={() => router.push(ROUTES.ACCOUNT)}
                        className="bg-purple-600 py-4 rounded-xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-center">View All Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push(ROUTES.HOME)}
                        className="bg-gray-200 py-4 rounded-xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-gray-700 font-bold text-center">Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
