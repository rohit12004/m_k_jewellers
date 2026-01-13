import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useProductDetail } from "../../../hooks/useProductDetail";
import QuantitySelector from "../../../components/product/QuantitySelector";
import PriceBreakdown from "../../../components/product/PriceBreakdown";
import SizeSelector from "../../../components/product/SizeSelector";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/slices/cartSlice";

const { width: screenWidth } = Dimensions.get("window");

// Ring sizes available for jewelry products (1-33)
const RING_SIZES = Array.from({ length: 33 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString()
}));

export default function ProductDetail() {
    const { slug } = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();

    // State for client-side variant handling
    const [currentVariant, setCurrentVariant] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Fetch product details - Pass empty filters to get all variants once
    const { data, isLoading, error } = useProductDetail(slug, {});

    // Update current variant when data loads
    useEffect(() => {
        if (data?.selectedVariant) {
            setCurrentVariant(data.selectedVariant);
        }
    }, [data]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text className="text-gray-600 mt-4">Loading product...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !data) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text className="text-red-600 text-lg font-semibold mt-4">Product not found</Text>
                    <Text className="text-gray-600 text-center mt-2">
                        {error?.message || 'This product may have been removed'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-purple-600 px-6 py-3 rounded-xl mt-6"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-semibold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const { product, allVariants, purities, sizes: apiSizes, weights, media } = data;

    // Detect if product is a ring
    const isRing = /\brings?\b/.test(product.subCategory?.name?.toLowerCase() || '');

    // Determine available sizes based on product type
    const availableSizes = isRing
        ? RING_SIZES.map(s => s.value) // All sizes 1-33 for rings
        : apiSizes; // Only variant sizes for others

    const handleVariantChange = (filterType, value) => {
        if (!currentVariant) return;

        let matchedVariant;

        if (filterType === 'size' && isRing) {
            // LOOSE SIZE MATCHING for rings:
            // Find variant with same weight + purity (ignore size)
            const priceVariant = allVariants.find(v =>
                v.weight === currentVariant.weight &&
                v.purity === currentVariant.purity
            );

            if (priceVariant) {
                // Create virtual variant with selected size
                matchedVariant = {
                    ...priceVariant,
                    size: value,
                    isVirtual: true
                };
            } else {
                matchedVariant = { ...currentVariant, size: value, isVirtual: true };
            }
        } else if (filterType === 'purity') {
            matchedVariant = allVariants.find(v => v.purity === value);
        } else if (filterType === 'weight') {
            matchedVariant = allVariants.find(v => v.weight === parseFloat(value));
        } else if (filterType === 'size') {
            // Non-ring: strict matching
            matchedVariant = allVariants.find(v => v.size === value);
        }

        if (matchedVariant) {
            setCurrentVariant(matchedVariant);
        }
    };

    const handleQuantityChange = (newQty) => {
        setQuantity(newQty);
    };

    const handleAddToCart = () => {
        if (!currentVariant?.calculatedPrice?.finalPrice) {
            alert('Price not available for this variant');
            return;
        }

        const cartItem = {
            productId: product.id,
            variantId: currentVariant.id,
            name: product.name,
            size: currentVariant.size || null,
            length: currentVariant.length || null,
            weight: currentVariant.weight || null,
            purity: currentVariant.purity,
            color: currentVariant.purity,
            media: media[0]?.secure_url || null,
            qty: quantity,
            subcategory: product.subCategory?.name || null,
            category: product.category?.name || null
        };

        dispatch(addToCart(cartItem));

        // Navigate to cart tab
        router.push('/(tabs)/cart');
    };

    const handleWhatsAppContact = () => {
        const message = `Hi, I'm interested in this product: ${product.name}`;
        const phoneNumber = '919881339944';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900">Product Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1">
                {/* Image Gallery */}
                {media && media.length > 0 && (
                    <View>
                        {/* Main Image */}
                        <View style={{ width: screenWidth, height: screenWidth }}>
                            <Image
                                source={{ uri: media[activeImageIndex]?.secure_url }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                        </View>

                        {/* Thumbnail Images */}
                        {media.length > 1 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="px-4 py-3"
                                contentContainerStyle={{ gap: 8 }}
                            >
                                {media.map((img, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setActiveImageIndex(index)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            className={`border-2 rounded-lg overflow-hidden ${index === activeImageIndex ? 'border-purple-600' : 'border-gray-300'
                                                }`}
                                            style={{ width: 80, height: 80 }}
                                        >
                                            <Image
                                                source={{ uri: img.secure_url }}
                                                style={{ width: '100%', height: '100%' }}
                                                contentFit="cover"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}

                {/* Product Info */}
                <View className="px-4 py-4">
                    {/* Product Name */}
                    <Text className="text-2xl font-bold text-gray-900 mb-2">{product.name}</Text>

                    {/* Category & Subcategory */}
                    <View className="flex-row items-center mb-4">
                        {product.category && (
                            <Text className="text-sm text-gray-600">{product.category.name}</Text>
                        )}
                        {product.subCategory && (
                            <>
                                <Text className="text-gray-400 mx-2">•</Text>
                                <Text className="text-sm text-gray-600">{product.subCategory.name}</Text>
                            </>
                        )}
                    </View>

                    {/* Price */}
                    {currentVariant?.calculatedPrice && (
                        <View className="bg-purple-50 p-4 rounded-xl mb-4">
                            <Text className="text-3xl font-bold text-purple-600">
                                ₹{currentVariant.calculatedPrice.finalPrice.toLocaleString('en-IN')}
                            </Text>
                            {currentVariant.calculatedPrice.discount > 0 && (
                                <View className="flex-row items-center mt-2">
                                    <Text className="text-gray-500 line-through mr-2">
                                        ₹{currentVariant.calculatedPrice.basePrice.toLocaleString('en-IN')}
                                    </Text>
                                    <Text className="text-green-600 font-semibold">
                                        {currentVariant.calculatedPrice.discount}% OFF
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Variant Selectors */}
                    {/* Purity */}
                    {purities && purities.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-base font-semibold text-gray-900 mb-2">Purity</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {purities.map((purity) => (
                                    <TouchableOpacity
                                        key={purity}
                                        onPress={() => handleVariantChange('purity', purity)}
                                        className={`px-4 py-2 rounded-lg border ${currentVariant?.purity === purity
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={`font-medium ${currentVariant?.purity === purity ? 'text-white' : 'text-gray-700'
                                            }`}>
                                            {purity}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Size Selector (Only for rings) */}
                    {isRing && availableSizes && availableSizes.length > 0 && (
                        <SizeSelector
                            label="Size"
                            selectedSize={currentVariant?.size}
                            availableSizes={availableSizes}
                            onSizeChange={(size) => handleVariantChange('size', size)}
                            isRing={isRing}
                            helperText="Select any size you want."
                        />
                    )}

                    {/* Length Display (Only for chains/mangalsutra) */}
                    {(product.subCategory?.name?.toLowerCase().includes('chain') ||
                        product.subCategory?.name?.toLowerCase().includes('mangalsutra')) &&
                        currentVariant?.length && (
                            <View className="mb-4">
                                <Text className="text-base font-semibold text-gray-900">
                                    Length: <Text className="text-purple-600">{currentVariant.length}</Text>
                                </Text>
                            </View>
                        )}

                    {/* Quantity Selector */}
                    <View className="mb-4">
                        <QuantitySelector quantity={quantity} onChange={handleQuantityChange} />
                    </View>

                    {/* WhatsApp Contact for Customization */}
                    <TouchableOpacity
                        onPress={handleWhatsAppContact}
                        className="mb-4 p-4 border-2 border-purple-200 bg-purple-50 rounded-xl"
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-start gap-3">
                            <Text className="text-2xl">💎</Text>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-900 mb-2">
                                    Want Custom Personalization?
                                </Text>
                                <Text className="text-xs text-gray-700 mb-3">
                                    We can create custom designs tailored to your preferences. Contact us directly for personalized assistance.
                                </Text>
                                <View className="flex-row items-center bg-green-500 px-4 py-2 rounded-full self-start">
                                    <Ionicons name="logo-whatsapp" size={16} color="white" />
                                    <Text className="text-white text-sm font-medium ml-2">Contact on WhatsApp</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Price Breakdown */}
                    {currentVariant?.calculatedPrice && (
                        <PriceBreakdown pricing={currentVariant.calculatedPrice} />
                    )}

                    {/* Description */}
                    {product.description && (
                        <View className="mb-4">
                            <Text className="text-base font-semibold text-gray-900 mb-2">Description</Text>
                            <Text className="text-gray-700 leading-6">{product.description}</Text>
                        </View>
                    )}

                    {/* Product Specifications */}
                    <View className="mb-4">
                        <Text className="text-base font-semibold text-gray-900 mb-3">Product Specifications</Text>
                        <View className="bg-gray-50 rounded-xl p-4">
                            {currentVariant?.purity && (
                                <View className="flex-row justify-between py-2 border-b border-gray-200">
                                    <Text className="text-gray-600">Purity</Text>
                                    <Text className="text-gray-900 font-medium">{currentVariant.purity}</Text>
                                </View>
                            )}
                            {currentVariant?.weight && (
                                <View className="flex-row justify-between py-2 border-b border-gray-200">
                                    <Text className="text-gray-600">Weight</Text>
                                    <Text className="text-gray-900 font-medium">{currentVariant.weight}g</Text>
                                </View>
                            )}
                            {currentVariant?.size && (
                                <View className="flex-row justify-between py-2 border-b border-gray-200">
                                    <Text className="text-gray-600">Size</Text>
                                    <Text className="text-gray-900 font-medium">{currentVariant.size}</Text>
                                </View>
                            )}
                            {currentVariant?.gst && (
                                <View className="flex-row justify-between py-2 border-b border-gray-200">
                                    <Text className="text-gray-600">GST</Text>
                                    <Text className="text-gray-900 font-medium">{currentVariant.gst}%</Text>
                                </View>
                            )}
                            {product.gender && (
                                <View className="flex-row justify-between py-2">
                                    <Text className="text-gray-600">Gender</Text>
                                    <Text className="text-gray-900 font-medium">{product.gender}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Add to Cart Button */}
            <View className="px-4 py-5 border-t border-gray-200">
                <TouchableOpacity
                    onPress={handleAddToCart}
                    className="bg-purple-600 py-4 rounded-xl flex-row items-center justify-center gap-2"
                    activeOpacity={0.8}
                >
                    <Ionicons name="cart-outline" size={20} color="white" />
                    <Text className="text-white font-bold">Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
