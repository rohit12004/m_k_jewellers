import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";
import { showToast } from "../utils/toast";
import { API_BASE_URL, API_ROUTES, ROUTES } from "../constants/routes";

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
    const [downloading, setDownloading] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

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
            const fileName = `MK_Jewellers_Receipt_${order.orderId}.pdf`;
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
            const downloadUrl = `${API_BASE_URL}${API_ROUTES.GET_RECEIPT(order.orderId)}`;



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

            {/* Action Buttons */}
            <View className="flex-row gap-2">
                <TouchableOpacity
                    className="flex-1 bg-blue-600 py-2.5 rounded-lg flex-row items-center justify-center"
                    onPress={() => router.push(ROUTES.ORDER_DETAILS(order.orderId))}
                    activeOpacity={0.8}
                >
                    <Ionicons name="eye-outline" size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-purple-600 py-2.5 px-4 rounded-lg flex-row items-center justify-center"
                    onPress={downloadReceipt}
                    disabled={downloading}
                    activeOpacity={0.8}
                >
                    {downloading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Ionicons name="download-outline" size={18} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
