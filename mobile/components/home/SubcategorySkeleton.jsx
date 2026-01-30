import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

const SubcategorySkeleton = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View className="flex-1 items-center mx-1">
            {/* Image skeleton */}
            <Animated.View
                style={{ opacity }}
                className="w-24 h-24 bg-gray-300 rounded-2xl mb-2"
            />
            {/* Text skeleton */}
            <Animated.View
                style={{ opacity }}
                className="w-20 h-3 bg-gray-300 rounded"
            />
        </View>
    );
};

const SubcategoriesGridSkeleton = () => {
    return (
        <View className="py-6 bg-gray-50">
            <View className="px-4">
                {/* First row */}
                <View className="flex-row justify-between mb-4">
                    <SubcategorySkeleton />
                    <SubcategorySkeleton />
                    <SubcategorySkeleton />
                </View>
                {/* Second row */}
                <View className="flex-row justify-between mb-4">
                    <SubcategorySkeleton />
                    <SubcategorySkeleton />
                    <SubcategorySkeleton />
                </View>
                {/* Third row */}
                <View className="flex-row justify-between">
                    <SubcategorySkeleton />
                    <SubcategorySkeleton />
                    <SubcategorySkeleton />
                </View>
            </View>
        </View>
    );
};

export default SubcategoriesGridSkeleton;
