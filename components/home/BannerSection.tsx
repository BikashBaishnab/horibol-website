import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing } from '../../theme';
import type { HomeSectionItem } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BannerSectionProps {
    items: HomeSectionItem[];
}

const BannerSection: React.FC<BannerSectionProps> = React.memo(({ items }) => {
    const router = useRouter();
    const banner = items[0];

    if (!banner) return null;

    const handlePress = () => {
        if (!banner.action_type || !banner.action_value) return;

        switch (banner.action_type) {
            case 'product':
                router.push(`/product/${banner.action_value}` as any);
                break;
            case 'category':
                router.push({
                    pathname: '/search-results',
                    params: { query: banner.display_title || '' }
                } as any);
                break;
            case 'url':
                // Handle URL if needed
                break;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.touchable}
            >
                <Image
                    source={{ uri: banner.display_image }}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="disk"
                />
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
    },
    touchable: {
        width: '100%',
        height: 180, // Slightly taller for better visibility
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

BannerSection.displayName = 'BannerSection';
export default BannerSection;
