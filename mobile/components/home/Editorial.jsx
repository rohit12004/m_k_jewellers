import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { ROUTES } from '../../constants/routes';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const CONTAINER_PADDING = 16;
const CARD_WIDTH = (width - (CONTAINER_PADDING * 2) - COLUMN_GAP) / 2;

const Editorial = () => {
    return (
        <View className="py-6 bg-white">
            {/* Header */}
            <View className="items-center mb-5 px-4">
                <Text className="text-4xl font-serif text-gray-900 mb-2">Editorial</Text>
                <Text className="text-gray-400 uppercase tracking-[0.4em] text-[8px] font-bold text-center">
                    The Art of Storytelling • MK Jewellers
                </Text>
            </View>

            {/* Masonry-style Grid using two columns */}
            <View className="px-4 flex-row" style={{ gap: COLUMN_GAP }}>
                
                {/* Left Column */}
                <View className="flex-1" style={{ gap: COLUMN_GAP }}>
                    {/* 1. Large Portrait */}
                    <View className="rounded-3xl overflow-hidden bg-gray-100" style={{ height: 320 }}>
                        <Image 
                            source={require('../../assets/images/editorial1.png')} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>

                    {/* 4. Square */}
                    <View className="rounded-2xl overflow-hidden relative bg-gray-100" style={{ height: 160 }}>
                        <Image 
                            source={require('../../assets/images/editorial4.png')} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <View className="border border-white/50 px-3 py-1.5 rounded-full bg-black/10 backdrop-blur-sm">
                                <Text className="text-white text-[7px] font-black tracking-widest uppercase">New Era</Text>
                            </View>
                        </View>
                    </View>

                    {/* 5. Square */}
                    <View className="rounded-2xl overflow-hidden relative bg-gray-100" style={{ height: 160 }}>
                        <Image 
                            source={require('../../assets/images/editorial5.png')} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <View className="border border-white/50 px-3 py-1.5 rounded-full bg-black/10 backdrop-blur-sm">
                                <Text className="text-white text-[7px] font-black tracking-widest uppercase">Essentials</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Right Column */}
                <View className="flex-1" style={{ gap: COLUMN_GAP }}>
                    {/* 2. Square */}
                    <View className="rounded-2xl overflow-hidden relative bg-gray-100" style={{ height: 180 }}>
                        <Image 
                            source={require('../../assets/images/editorial2.png')} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <View className="border border-white/50 px-3 py-1.5 rounded-full bg-black/10 backdrop-blur-sm">
                                <Text className="text-white text-[7px] font-black tracking-widest uppercase">Trending</Text>
                            </View>
                        </View>
                    </View>

                    {/* 3. Square */}
                    <View className="rounded-2xl overflow-hidden relative bg-gray-100" style={{ height: 140 }}>
                        <Image 
                            source={require('../../assets/images/editorial3.png')} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <View className="border border-white/50 px-3 py-1.5 rounded-full bg-black/10 backdrop-blur-sm">
                                <Text className="text-white text-[7px] font-black tracking-widest uppercase">Must Have</Text>
                            </View>
                        </View>
                    </View>

                    {/* 6. Large Portrait */}
                    <View className="rounded-3xl overflow-hidden bg-gray-100" style={{ height: 320 }}>
                        <Image 
                            source={require('../../assets/images/editorial6.png')} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                </View>

            </View>

            {/* Footer Button */}
            <View className="mt-12 items-center">
                <Link href={ROUTES.SHOP} asChild>
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        className="bg-gray-900 flex-row items-center px-12 py-5 rounded-full"
                        style={styles.buttonShadow}
                    >
                        <Text className="text-white text-[10px] font-black tracking-[0.4em] uppercase">
                            Explore Shop
                        </Text>
                        <View className="ml-4 w-8 h-[1px] bg-white/30" />
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
});

export default Editorial;
