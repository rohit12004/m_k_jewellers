import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

const FilterBottomSheet = ({
    visible,
    onClose,
    filters,
    onApply,
    filterOptions,
    onClearAll
}) => {
    const [tempFilters, setTempFilters] = useState(filters);

    // Sync tempFilters with current filters when modal opens
    useEffect(() => {
        if (visible) {
            setTempFilters(filters);
        }
    }, [visible, filters]);

    const handleApply = () => {
        onApply(tempFilters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters = {
            subcategory: null,
            category: null,
            gender: null,
            purity: null,
            sortBy: 'newest',
            page: 1,
            limit: 20
        };
        setTempFilters(clearedFilters);
        onClearAll();
        onClose();
    };

    const toggleFilter = (filterType, value) => {
        if (filterType === 'gender' || filterType === 'sortBy') {
            // Single select
            setTempFilters(prev => ({
                ...prev,
                [filterType]: prev[filterType] === value ? null : value,
                page: 1
            }));
        } else {
            // Multi-select (subcategory, category, purity)
            const currentValues = tempFilters[filterType]?.split(',').filter(Boolean) || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

            setTempFilters(prev => ({
                ...prev,
                [filterType]: newValues.length > 0 ? newValues.join(',') : null,
                page: 1
            }));
        }
    };

    const isSelected = (filterType, value) => {
        if (filterType === 'gender' || filterType === 'sortBy') {
            return tempFilters[filterType] === value;
        }
        const currentValues = tempFilters[filterType]?.split(',').filter(Boolean) || [];
        return currentValues.includes(value);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
                        <Text className="text-xl font-bold text-gray-900">Filters</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-4 py-4" style={{ maxHeight: screenHeight * 0.6 }}>
                        {/* Sort By */}
                        <View className="mb-6">
                            <Text className="text-base font-semibold text-gray-900 mb-3">Sort By</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {[
                                    { value: 'newest', label: 'Newest First' },
                                    { value: 'name_asc', label: 'Name: A to Z' },
                                    { value: 'name_desc', label: 'Name: Z to A' }
                                ].map(option => (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => toggleFilter('sortBy', option.value)}
                                        className={`px-4 py-2 rounded-full border ${isSelected('sortBy', option.value)
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={`font-medium ${isSelected('sortBy', option.value) ? 'text-white' : 'text-gray-700'
                                            }`}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Subcategory (Type) Filter */}
                        {filterOptions?.subcategories && filterOptions.subcategories.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-base font-semibold text-gray-900 mb-3">Type</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {filterOptions.subcategories.map((subcategory) => (
                                        <TouchableOpacity
                                            key={subcategory.id}
                                            onPress={() => toggleFilter('subcategory', subcategory.slug)}
                                            className={`px-4 py-2 rounded-full border ${isSelected('subcategory', subcategory.slug)
                                                    ? 'bg-purple-600 border-purple-600'
                                                    : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <Text className={`font-medium ${isSelected('subcategory', subcategory.slug) ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                {subcategory.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Category (Material) Filter */}
                        {filterOptions?.categories && filterOptions.categories.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-base font-semibold text-gray-900 mb-3">Material</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {filterOptions.categories.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            onPress={() => toggleFilter('category', category.slug)}
                                            className={`px-4 py-2 rounded-full border ${isSelected('category', category.slug)
                                                    ? 'bg-purple-600 border-purple-600'
                                                    : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <Text className={`font-medium ${isSelected('category', category.slug) ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Gender */}
                        <View className="mb-6">
                            <Text className="text-base font-semibold text-gray-900 mb-3">Gender</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {['MEN', 'WOMEN'].map(gender => (
                                    <TouchableOpacity
                                        key={gender}
                                        onPress={() => toggleFilter('gender', gender)}
                                        className={`px-4 py-2 rounded-full border ${isSelected('gender', gender)
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={`font-medium ${isSelected('gender', gender) ? 'text-white' : 'text-gray-700'
                                            }`}>
                                            {gender === 'MEN' ? 'Men' : 'Women'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Purity */}
                        {filterOptions?.purities && filterOptions.purities.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-base font-semibold text-gray-900 mb-3">Purity</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {filterOptions.purities.map(purity => (
                                        <TouchableOpacity
                                            key={purity}
                                            onPress={() => toggleFilter('purity', purity)}
                                            className={`px-4 py-2 rounded-full border ${isSelected('purity', purity)
                                                ? 'bg-purple-600 border-purple-600'
                                                : 'bg-white border-gray-300'
                                                }`}
                                        >
                                            <Text className={`font-medium ${isSelected('purity', purity) ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                {purity}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View className="px-4 py-4 border-t border-gray-200 flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleClear}
                            className="flex-1 bg-gray-200 py-3 rounded-xl"
                            activeOpacity={0.7}
                        >
                            <Text className="text-gray-700 font-semibold text-center">Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleApply}
                            className="flex-1 bg-purple-600 py-3 rounded-xl"
                            activeOpacity={0.7}
                        >
                            <Text className="text-white font-semibold text-center">Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

export default FilterBottomSheet;
