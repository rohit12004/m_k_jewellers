import { View, Text, ScrollView, RefreshControl, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProductsBySubcategory, useFilterOptions } from "../../hooks/useProducts";
import ProductCard from "../../components/shop/ProductCard";
import ActiveFilters from "../../components/shop/ActiveFilters";
import Pagination from "../../components/shop/Pagination";
import FilterBottomSheet from "../../components/shop/FilterBottomSheet";

export default function Shop() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Initialize filters from URL params
    const [filters, setFilters] = useState({
        subcategory: params.subcategory || null,
        category: params.category || null,
        gender: params.gender || null,
        purity: params.purity || null,
        sortBy: params.sortBy || 'newest',
        page: parseInt(params.page || '1', 10),
        limit: 20,
    });

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Update filters when URL params change (using individual values to prevent infinite loop)
    useEffect(() => {
        setFilters({
            subcategory: params.subcategory || null,
            category: params.category || null,
            gender: params.gender || null,
            purity: params.purity || null,
            sortBy: params.sortBy || 'newest',
            page: parseInt(params.page || '1', 10),
            limit: 20,
        });
    }, [params.subcategory, params.category, params.gender, params.purity, params.sortBy, params.page]);

    // Fetch products and filter options
    const { data, isLoading, error, refetch } = useProductsBySubcategory(filters);
    // Fetch all filter options (don't pass current filters to show all options)
    const { data: filterOptionsData } = useFilterOptions({});

    const products = data?.data?.products || [];
    const meta = data?.meta || {};
    const subcategoryData = data?.data?.subcategory;

    // Get page title
    const getPageTitle = () => {
        if (subcategoryData) {
            return subcategoryData.name;
        }
        return 'All Products';
    };

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.subcategoryId) count += filters.subcategoryId.split(',').length;
        if (filters.categoryId) count += filters.categoryId.split(',').length;
        if (filters.gender) count++;
        if (filters.purity) count += filters.purity.split(',').length;
        return count;
    };

    // Handle filter changes
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        updateURL(newFilters);
    };

    // Handle removing a single filter
    const handleRemoveFilter = (filterType, value) => {
        if (filterType === 'gender') {
            const newFilters = { ...filters, gender: null, page: 1 };
            setFilters(newFilters);
            updateURL(newFilters);
        } else {
            const currentValues = filters[filterType]?.split(',').filter(Boolean) || [];
            const newValues = currentValues.filter(v => v !== value);
            const newFilters = {
                ...filters,
                [filterType]: newValues.length > 0 ? newValues.join(',') : null,
                page: 1
            };
            setFilters(newFilters);
            updateURL(newFilters);
        }
    };

    // Clear all filters
    const handleClearAll = () => {
        const newFilters = {
            subcategoryId: null,
            categoryId: null,
            gender: null,
            purity: null,
            sortBy: 'newest',
            page: 1,
            limit: 20
        };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    // Update URL with new filters
    const updateURL = (newFilters) => {
        const params = {};
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== null && value !== '' && key !== 'limit') {
                params[key] = value;
            }
        });
        router.setParams(params);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    // Handle refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Loading state
    if (isLoading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text className="text-gray-500 mt-4">Loading products...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text className="text-red-600 text-lg font-semibold mt-4">Error loading products</Text>
                    <Text className="text-gray-600 text-center mt-2">{error?.message || 'Something went wrong'}</Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        className="bg-purple-600 px-6 py-3 rounded-xl mt-6"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-semibold">Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-2xl font-bold text-gray-900">
                        {getPageTitle()}
                    </Text>

                    {/* Filter Button */}
                    <TouchableOpacity
                        onPress={() => setFilterModalVisible(true)}
                        className="flex-row items-center bg-purple-100 px-4 py-2 rounded-full"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="filter" size={18} color="#7c3aed" />
                        <Text className="text-purple-700 font-semibold ml-2">Filters</Text>
                        {getActiveFilterCount() > 0 && (
                            <View className="bg-purple-600 rounded-full w-5 h-5 items-center justify-center ml-2">
                                <Text className="text-white text-xs font-bold">
                                    {getActiveFilterCount()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <Text className="text-gray-600 text-sm">
                    {meta.totalProducts || 0} product{meta.totalProducts !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Active Filters */}
            <View className="px-4 pt-3">
                <ActiveFilters
                    filters={filters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearAll}
                    filterOptions={filterOptionsData?.data}
                />
            </View>

            {/* Products */}
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#7c3aed"]}
                        tintColor="#7c3aed"
                    />
                }
            >
                {products.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-6">
                        <Ionicons name="search-outline" size={64} color="#9ca3af" />
                        <Text className="text-gray-600 text-lg font-semibold mt-4">No products found</Text>
                        <Text className="text-gray-500 text-center mt-2">
                            Try adjusting your filters
                        </Text>
                        {getActiveFilterCount() > 0 && (
                            <TouchableOpacity
                                onPress={handleClearAll}
                                className="bg-purple-600 px-6 py-3 rounded-xl mt-6"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-semibold">Clear All Filters</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View className="px-4 py-4">
                        {/* Product Grid */}
                        <View className="flex-row flex-wrap justify-start gap-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </View>

                        {/* Pagination */}
                        <Pagination
                            currentPage={meta.currentPage || 1}
                            totalPages={meta.totalPages || 1}
                            onPageChange={handlePageChange}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Filter Bottom Sheet */}
            <FilterBottomSheet
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                filters={filters}
                onApply={handleApplyFilters}
                filterOptions={filterOptionsData?.data}
                onClearAll={handleClearAll}
            />
        </SafeAreaView>
    );
}
