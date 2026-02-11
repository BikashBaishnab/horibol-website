import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing } from '../../theme';
import type { HomeSectionItem } from '../../types';

interface BannerSectionProps {
    items: HomeSectionItem[];
}

const BannerSection: React.FC<BannerSectionProps> = React.memo(({ items }) => {
    const router = useRouter();
    const banner = items[0];

    if (!banner) return null;

    const handlePress = () => {
        if (!banner.action_type || banner.action_type === 'none') return;

        if (banner.action_type === 'product') {
            if (!banner.product_id) return;
            router.push(`/product/${String(banner.product_id)}` as any);
            return;
        }

        if (banner.action_type === 'category') {
            if (!banner.category_id) return;
            router.push({
                pathname: '/category/[id]',
                params: {
                    id: String(banner.category_id),
                    name: banner.title || 'Category',
                },
            } as any);
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
                    source={{ uri: banner.image_url }}
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
        height: 180,
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
