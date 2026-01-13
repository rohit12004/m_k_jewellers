import { View, Text } from "react-native";

const PriceBreakdown = ({ pricing }) => {
    if (!pricing) return null;

    return (
        <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">Price Breakdown</Text>
            <View className="bg-gray-50 rounded-xl p-4">
                {/* Metal Cost */}
                {pricing.metalCost && (
                    <View className="flex-row justify-between py-2 border-b border-gray-200">
                        <Text className="text-gray-600">Metal Cost</Text>
                        <Text className="text-gray-900 font-medium">
                            ₹{pricing.metalCost.toLocaleString('en-IN')}
                        </Text>
                    </View>
                )}

                {/* Labour Charges */}
                {pricing.labourCharge && (
                    <View className="flex-row justify-between py-2 border-b border-gray-200">
                        <Text className="text-gray-600">Labour Charges</Text>
                        <Text className="text-gray-900 font-medium">
                            ₹{pricing.labourCharge.toLocaleString('en-IN')}
                        </Text>
                    </View>
                )}

                {/* Hallmark Charges */}
                {pricing.hallmarkCharges && (
                    <View className="flex-row justify-between py-2 border-b border-gray-200">
                        <Text className="text-gray-600">Hallmark Charges</Text>
                        <Text className="text-gray-900 font-medium">
                            ₹{pricing.hallmarkCharges.toLocaleString('en-IN')}
                        </Text>
                    </View>
                )}

                {/* GST */}
                {pricing.gst && (
                    <View className="flex-row justify-between py-2 border-b border-gray-200">
                        <Text className="text-gray-600">GST</Text>
                        <Text className="text-gray-900 font-medium">
                            ₹{pricing.gst.toLocaleString('en-IN')}
                        </Text>
                    </View>
                )}

                {/* Total Price */}
                <View className="flex-row justify-between py-3 mt-2">
                    <Text className="text-gray-900 font-bold text-lg">Total Price</Text>
                    <Text className="text-purple-600 font-bold text-lg">
                        ₹{pricing.finalPrice.toLocaleString('en-IN')}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default PriceBreakdown;
