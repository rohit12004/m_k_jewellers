import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ActiveFilters = ({ filters, onRemoveFilter, onClearAll, filterOptions }) => {
    const activeFilters = [];

    // Subcategories
    if (filters.subcategory) {
        const subcategorySlugs = filters.subcategory.split(',');
        subcategorySlugs.forEach(slug => {
            const subcategory = filterOptions?.subcategories?.find(s => s.slug === slug);
            if (subcategory) {
                activeFilters.push({
                    type: 'subcategory',
                    value: slug,
                    label: subcategory.name
                });
            }
        });
    }

    // Categories
    if (filters.category) {
        const categorySlugs = filters.category.split(',');
        categorySlugs.forEach(slug => {
            const category = filterOptions?.categories?.find(c => c.slug === slug);
            if (category) {
                activeFilters.push({
                    type: 'category',
                    value: slug,
                    label: category.name
                });
            }
        });
    }

    // Gender
    if (filters.gender) {
        activeFilters.push({
            type: 'gender',
            value: filters.gender,
            label: filters.gender === 'MEN' ? 'Men' : 'Women'
        });
    }

    // Purity
    if (filters.purity) {
        const purities = filters.purity.split(',');
        purities.forEach(purity => {
            activeFilters.push({
                type: 'purity',
                value: purity,
                label: `${purity} Purity`
            });
        });
    }

    if (activeFilters.length === 0) return null;

    return (
        <View className="mb-3">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
            >
                {activeFilters.map((filter, index) => (
                    <View
                        key={`${filter.type}-${filter.value}-${index}`}
                        className="bg-purple-100 rounded-full px-3 py-1.5 mr-2 flex-row items-center"
                    >
                        <Text className="text-purple-700 text-sm font-medium mr-1">
                            {filter.label}
                        </Text>
                        <TouchableOpacity
                            onPress={() => onRemoveFilter(filter.type, filter.value)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close-circle" size={16} color="#7c3aed" />
                        </TouchableOpacity>
                    </View>
                ))}

                {activeFilters.length > 1 && (
                    <TouchableOpacity
                        onPress={onClearAll}
                        className="bg-gray-200 rounded-full px-3 py-1.5 flex-row items-center"
                    >
                        <Text className="text-gray-700 text-sm font-medium">
                            Clear All
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

export default ActiveFilters;
