import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

export default function SizeSelector({
    label = "Select Size",
    selectedSize,
    availableSizes = [],
    onSizeChange,
    isRing = false,
    helperText = null
}) {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSizeSelect = (size) => {
        onSizeChange(size);
        setModalVisible(false);
    };

    return (
        <>
            {/* Dropdown Trigger */}
            <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-semibold text-gray-900">
                        {label} {helperText && <Text className="text-sm font-normal text-gray-500">({helperText})</Text>}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
                    activeOpacity={0.7}
                >
                    <Text className="text-gray-900 text-base">
                        {selectedSize || "Choose size"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Size Selection Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
                            <Text className="text-xl font-bold text-gray-900">{label}</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {/* Size Label */}
                        <View className="bg-gray-50 py-3 px-4">
                            <Text className="text-center text-sm font-medium text-gray-600">
                                Size
                            </Text>
                        </View>

                        {/* Scrollable Size List */}
                        <ScrollView className="px-4 py-2" style={{ maxHeight: screenHeight * 0.5 }}>
                            {availableSizes.map((size, index) => {
                                const isSelected = selectedSize === size;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleSizeSelect(size)}
                                        className={`py-4 px-4 border-b border-gray-100 ${isSelected ? 'bg-green-100' : 'bg-white'}`}
                                        activeOpacity={0.7}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={24} color="#10B981" />
                                            )}
                                            <Text
                                                className={`text-center flex-1 text-base ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                                            >
                                                {size}
                                            </Text>
                                            {!isSelected && <View style={{ width: 24 }} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>
        </>
    );
}
