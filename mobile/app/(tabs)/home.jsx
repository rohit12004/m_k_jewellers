import { ScrollView, RefreshControl, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import SubcategoriesGrid from "../../components/home/SubcategoriesGrid";
import PromotionalBanner from "../../components/home/PromotionalBanner";

import { VideoBanner } from "../../components/home/VideoBanner";

export default function Home() {
    const [refreshing, setRefreshing] = useState(false);
    const queryClient = useQueryClient();

    const onRefresh = async () => {
        setRefreshing(true);
        // Invalidate all queries to refetch data
        await queryClient.invalidateQueries({ queryKey: ["subcategories"] });
        setRefreshing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#7c3aed"]}
                        tintColor="#7c3aed"
                    />
                }
            >
                <VideoBanner />
                <SubcategoriesGrid />

                {/* Design Image - matches website layout */}
                <View className="px-4 pt-2 pb-4">
                    <Image
                        source={require("../../assets/images/design_image.png")}
                        className="w-full rounded-lg"
                        resizeMode="cover"
                        style={{ height: 150 }}
                    />
                </View>

                <PromotionalBanner />
                <View className="h-4" />
            </ScrollView>
        </SafeAreaView>
    );
}
