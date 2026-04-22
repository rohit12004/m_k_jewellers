import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import ProductCard from '../shop/ProductCard';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 64) / 3; // 3 columns with padding and gaps

const SimilarProducts = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <View className="px-4 mb-4">
            <View className="flex-row items-center mb-6">
                <View className="w-1.5 h-8 bg-purple-600 rounded-full mr-3" />
                <Text className="text-xl font-bold text-gray-900">Similar Products</Text>
            </View>

            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {products.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        width={CARD_WIDTH} 
                    />
                ))}
            </View>
        </View>
    );
};

export default SimilarProducts;
