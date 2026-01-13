import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <View className="flex-row items-center justify-center gap-4 py-6">
            {/* Previous Button */}
            <TouchableOpacity
                onPress={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                className={`flex-row items-center px-4 py-2 rounded-lg border border-gray-300 ${!canGoPrevious ? 'opacity-40' : ''
                    }`}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="chevron-back"
                    size={18}
                    color={canGoPrevious ? "#374151" : "#9ca3af"}
                />
                <Text className={`ml-1 font-medium ${canGoPrevious ? 'text-gray-700' : 'text-gray-400'}`}>
                    Prev
                </Text>
            </TouchableOpacity>

            {/* Page Info */}
            <View className="bg-purple-100 px-4 py-2 rounded-lg">
                <Text className="text-purple-700 font-semibold">
                    {currentPage} / {totalPages}
                </Text>
            </View>

            {/* Next Button */}
            <TouchableOpacity
                onPress={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
                className={`flex-row items-center px-4 py-2 rounded-lg border border-gray-300 ${!canGoNext ? 'opacity-40' : ''
                    }`}
                activeOpacity={0.7}
            >
                <Text className={`mr-1 font-medium ${canGoNext ? 'text-gray-700' : 'text-gray-400'}`}>
                    Next
                </Text>
                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={canGoNext ? "#374151" : "#9ca3af"}
                />
            </TouchableOpacity>
        </View>
    );
};

export default Pagination;
