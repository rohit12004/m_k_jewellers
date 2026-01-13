import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RazorpayCheckout from "react-native-razorpay";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckoutPrices } from "../../hooks/useCheckoutPrices";
import { clearCart } from "../../store/slices/cartSlice";
import { showToast } from "../../utils/toast";
import api from "../../services/api";
import { API_ROUTES, ROUTES } from "../../constants/routes";
import { Image } from "expo-image";

export default function Checkout() {
    const auth = useSelector((state) => state.authStore.auth);
    const cart = useSelector((state) => state.cartStore);
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const [panCard, setPanCard] = useState("");
    const [panError, setPanError] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    // Fetch fresh prices
    const { data: cartWithPrices, isLoading: loadingPrices, error: priceError } = useCheckoutPrices(
        cart.products,
        !!auth
    );

    // Calculate total from fresh prices
    const total = cartWithPrices?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;

    // Merge cart items with fresh prices
    const cartProducts = cart.products.map(item => {
        const priceData = cartWithPrices?.find(p => p.variantId === item.variantId);
        return {
            ...item,
            unitPrice: priceData?.unitPrice || 0,
            totalPrice: priceData?.totalPrice || 0,
        };
    });

    // Check if profile is complete
    const isProfileComplete = () => {
        return auth?.phone && auth?.address;
    };

    // Redirect to login if not authenticated, or to account if profile incomplete
    useEffect(() => {
        if (!auth) {
            showToast("info", "Login Required", "Please login to continue with checkout");
            router.replace(ROUTES.LOGIN);
        } else if (!isProfileComplete()) {
            showToast("info", "Complete Profile", "Please complete your profile first");
            router.replace(ROUTES.ACCOUNT);
        } else if (cart.products.length === 0) {
            showToast("info", "Empty Cart", "Your cart is empty");
            router.replace(ROUTES.CART);
        }
    }, [auth]);

    // Validate PAN card format
    const validatePAN = (value) => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (value && !panRegex.test(value)) {
            setPanError("Invalid PAN format (e.g., ABCDE1234F)");
            return false;
        }
        setPanError("");
        return true;
    };

    // Get Razorpay order ID from backend
    const getOrderId = async (amount, panCard) => {
        try {
            const { data } = await api.post(API_ROUTES.GET_ORDER_ID, {
                amount,
                panCard
            });
            if (!data.success) {
                throw new Error(data.message);
            }
            return { success: true, order_id: data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    // Save order to backend after successful payment
    const saveOrder = async (paymentResponse, orderId) => {
        try {
            const cartItems = cartProducts.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                weight: item.weight,
                purity: item.purity || "",
                size: item.size || null,
                length: item.length || null,
                color: item.color || null,
                qty: item.qty,
                price: item.unitPrice,
                category: item.category || "",
                subcategory: item.subcategory || "",
                media: item.media || null
            }));

            const orderData = {
                userId: auth.id,
                email: auth.email,
                phone: auth.phone,
                address: auth.address || "{}",
                panCard: panCard,
                total: total,
                cartItems: cartItems,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: orderId,
                razorpay_signature: paymentResponse.razorpay_signature
            };

            const { data } = await api.post(API_ROUTES.SAVE_ORDER, orderData);

            if (data.success) {
                // Invalidate user orders cache
                queryClient.invalidateQueries({ queryKey: ["user-orders"] });

                showToast("success", "Order Placed", "Your order has been placed successfully");
                dispatch(clearCart());
                router.replace(ROUTES.ORDER_DETAILS(orderId));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to save order";

            // Check if it's a price mismatch error
            if (errorMessage.includes("Price verification failed") ||
                errorMessage.includes("Total amount mismatch") ||
                errorMessage.includes("refresh")) {

                queryClient.invalidateQueries(["checkout-prices"]);
                showToast("error", "Price Updated", "Prices have changed! Please review and try again.");
            } else {
                showToast("error", "Order Failed", errorMessage);
            }
            throw error;
        }
    };

    // Handle payment
    const handlePayment = async () => {
        // Validate PAN
        if (!panCard || !validatePAN(panCard)) {
            showToast("error", "Invalid PAN", "Please enter a valid PAN card number");
            return;
        }

        // Validate cart
        if (cart.products.length === 0) {
            showToast("error", "Empty Cart", "Your cart is empty");
            return;
        }

        // Validate prices loaded
        if (!cartWithPrices || loadingPrices) {
            showToast("error", "Loading", "Please wait for prices to load");
            return;
        }

        setPlacingOrder(true);

        try {
            // Verify prices one more time before payment
            const { data: priceCheckData } = await api.post(API_ROUTES.CALCULATE_CART_PRICES, {
                cartItems: cartProducts.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    qty: item.qty,
                    weight: item.weight,
                    purity: item.purity,
                    category: item.category,
                    subcategory: item.subcategory,
                    color: item.color,
                    size: item.size,
                    length: item.length,
                    media: item.media,
                    name: item.name,
                }))
            });

            const freshTotal = priceCheckData.data.items.reduce((sum, item) => sum + item.totalPrice, 0);

            // Check if prices have changed (tolerance of ₹10)
            if (Math.abs(freshTotal - total) > 10) {
                queryClient.invalidateQueries(["checkout-prices"]);
                showToast("info", "Price Updated", "Gold/Silver rates have been updated. Please review the revised prices.");
                setPlacingOrder(false);
                return;
            }

            // Get Razorpay order ID
            const generateOrderId = await getOrderId(total, panCard);
            if (!generateOrderId.success) {
                throw new Error(generateOrderId.message);
            }

            const orderId = generateOrderId.order_id;

            // Razorpay options
            const options = {
                description: "Payment for jewelry order",
                image: "https://res.cloudinary.com/dxh3hcxav/image/upload/v1766064001/mk_logo_udntp5.webp",
                currency: "INR",
                key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
                amount: total * 100, // Convert to paise
                name: "M.K. Jewellers",
                order_id: orderId,
                prefill: {
                    email: auth.email,
                    contact: auth.phone,
                    name: auth.name
                },
                theme: { color: "#7c3aed" }
            };



            // Open Razorpay
            RazorpayCheckout.open(options)
                .then(async (data) => {
                    // Payment successful
                    try {
                        await saveOrder(data, orderId);
                    } catch (error) {
                        console.error("Failed to save order:", error);
                    } finally {
                        setPlacingOrder(false);
                    }
                })
                .catch((error) => {
                    console.error("Razorpay Error:", error);

                    let errorMessage = "Payment was cancelled";
                    let isCancellation = false;

                    // Parse the error object/description
                    try {
                        if (error.code === 0 || error.code === 'PAYMENT_CANCELLED') {
                            isCancellation = true;
                        }

                        if (error.description) {
                            // Try to parse JSON description if present (Razorpay sometimes sends stringified JSON)
                            try {
                                const descObj = JSON.parse(error.description);
                                if (descObj.error && descObj.error.description) {
                                    errorMessage = descObj.error.description;
                                } else if (descObj.error && descObj.error.reason) {
                                    errorMessage = descObj.error.reason;
                                }
                            } catch (e) {
                                // If not JSON, use the description as is
                                errorMessage = error.description;
                            }
                        }
                    } catch (e) {
                        // Error parsing failed
                    }

                    // If it's a cancellation or unrelated 'undefined' error during cancel, show info
                    // The error {"code": 0, "description": "undefined"...} is typically a cancellation
                    if (isCancellation || errorMessage === "undefined" || errorMessage.includes("payment_error")) {
                        showToast("info", "Payment Cancelled", "You cancelled the payment process");
                    } else {
                        showToast("error", "Payment Failed", errorMessage);
                    }

                    setPlacingOrder(false);
                });

        } catch (error) {
            console.error("Checkout Error:", error);
            showToast("error", "Error", error.message || "Failed to initiate payment");
            setPlacingOrder(false);
        }
    };

    // Show loading while redirecting
    if (!auth || !isProfileComplete() || cart.products.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text className="text-gray-600 mt-4">Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Parse address
    let parsedAddress = null;
    try {
        parsedAddress = JSON.parse(auth.address);
    } catch (e) {
        parsedAddress = { street: auth.address };
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Checkout</Text>
                </View>
            </View>

            {/* Progress Indicator */}
            <View className="bg-white px-4 py-4 mb-2">
                <View className="flex-row items-center justify-center gap-4">
                    <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                        <Text className="text-sm font-medium text-gray-900">Cart</Text>
                    </View>
                    <View className="h-0.5 w-12 bg-purple-600" />
                    <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center">
                            <Text className="text-white text-sm font-medium">2</Text>
                        </View>
                        <Text className="text-sm font-medium text-purple-600">Delivery</Text>
                    </View>
                    <View className="h-0.5 w-12 bg-gray-300" />
                    <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                            <Text className="text-gray-600 text-sm font-medium">3</Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-500">Payment</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Delivery Details Card */}
                <View className="bg-white mx-4 my-2 p-4 rounded-xl">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Your Details</Text>

                    {/* Email */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2 flex-row items-center">
                            <Ionicons name="mail-outline" size={16} color="#6b7280" /> Email
                        </Text>
                        <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Text className="text-gray-700">{auth.email}</Text>
                        </View>
                    </View>

                    {/* Phone */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            <Ionicons name="call-outline" size={16} color="#6b7280" /> Phone
                        </Text>
                        <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Text className="text-gray-700">{auth.phone}</Text>
                        </View>
                    </View>

                    {/* Address */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            <Ionicons name="location-outline" size={16} color="#6b7280" /> Delivery Address
                        </Text>
                        <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {parsedAddress ? (
                                <View>
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
                    </View>

                    {/* PAN Card */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            <Ionicons name="card-outline" size={16} color="#6b7280" /> PAN Card Number <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            placeholder="ABCDE1234F"
                            placeholderTextColor="#c1bfbfff"
                            value={panCard}
                            onChangeText={(value) => {
                                const upperValue = value.toUpperCase();
                                setPanCard(upperValue);
                                validatePAN(upperValue);
                            }}
                            maxLength={10}
                            autoCapitalize="characters"
                            className={`bg-white p-3 rounded-lg border ${panError ? "border-red-500" : "border-gray-300"}`}
                        />
                        {panError && <Text className="text-xs text-red-500 mt-1">{panError}</Text>}
                        <Text className="text-xs text-gray-500 mt-1">
                            Required for all jewelry purchases for tax compliance
                        </Text>
                    </View>
                </View>

                {/* Order Summary Card */}
                <View className="bg-white mx-4 my-2 p-4 rounded-xl mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">ORDER SUMMARY</Text>

                    {/* Items Count */}
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-600">Total ({cart.count} Item{cart.count !== 1 ? "s" : ""})</Text>
                        <Text className="font-semibold">₹{total.toLocaleString("en-IN")}</Text>
                    </View>

                    <View className="border-t border-gray-200 pt-4 mb-4" />

                    {/* Product List */}
                    <View className="mb-4">
                        {loadingPrices ? (
                            <View className="items-center py-4">
                                <ActivityIndicator size="small" color="#7c3aed" />
                                <Text className="text-gray-500 mt-2 text-sm">Loading prices...</Text>
                            </View>
                        ) : priceError ? (
                            <Text className="text-red-500 text-sm text-center">Failed to load prices</Text>
                        ) : (
                            cartProducts.map((product) => (
                                <View key={product.variantId} className="flex-row gap-3 mb-3">
                                    <Image
                                        source={{ uri: product.media }}
                                        style={{ width: 60, height: 60 }}
                                        contentFit="cover"
                                        className="rounded-lg border border-gray-200"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
                                            {product.name}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {product.color} {product.weight ? `(${product.weight}g)` : ""}
                                        </Text>
                                        <Text className="text-sm font-semibold text-gray-900 mt-1">
                                            {product.unitPrice > 0 ? (
                                                `${product.qty} × ₹${product.unitPrice.toLocaleString("en-IN")}`
                                            ) : (
                                                <Text className="text-gray-400">Loading...</Text>
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <View className="border-t border-gray-200 pt-4" />

                    {/* Total Payable */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-900 mb-1">Total Payable</Text>
                        <Text className="text-2xl font-bold text-purple-600">
                            ₹{total.toLocaleString("en-IN")}
                        </Text>
                    </View>

                    {/* Payment Button */}
                    <TouchableOpacity
                        onPress={handlePayment}
                        disabled={!!panError || !panCard || placingOrder || loadingPrices}
                        className={`py-4 rounded-xl items-center ${!!panError || !panCard || placingOrder || loadingPrices
                            ? "bg-gray-300"
                            : "bg-purple-600"
                            }`}
                        activeOpacity={0.8}
                    >
                        {placingOrder ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator color="white" size="small" />
                                <Text className="text-white font-bold ml-2">Processing...</Text>
                            </View>
                        ) : (
                            <Text className="text-white font-bold">PROCEED TO PAYMENT</Text>
                        )}
                    </TouchableOpacity>

                    <View className="border-t border-gray-200 my-4" />

                    {/* Contact Info */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-900 mb-2">Any Questions?</Text>
                        <Text className="text-xs text-gray-600 mb-3">
                            Please call us at: <Text className="font-semibold text-purple-600">+91-9881339944</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                const message = "Hi, I have a question about my order";
                                const url = `https://wa.me/919881339944?text=${encodeURIComponent(message)}`;
                                Linking.openURL(url);
                            }}
                            className="bg-green-600 py-3 rounded-xl flex-row items-center justify-center"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Contact on WhatsApp</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Trust Badges */}
                    <View className="flex-row gap-4 mt-4">
                        <View className="flex-1 items-center p-3 bg-gray-50 rounded-lg">
                            <Ionicons name="lock-closed" size={24} color="#7c3aed" />
                            <Text className="text-xs font-semibold mt-2 text-black text-center">100%{"\u00A0"}SECURE</Text>
                        </View>
                        <View className="flex-1 items-center p-3 bg-gray-50 rounded-lg">
                            <Ionicons name="bag-check" size={24} color="#7c3aed" />
                            <Text className="text-xs font-semibold mt-2 text-black text-center">TRUSTED{"\u00A0"}STORE</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
