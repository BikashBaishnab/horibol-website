import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';
import type { HomeSectionItem } from '../../types';

interface SDUICardProps {
    item: HomeSectionItem;
    width?: number | string;
}

const SDUICard: React.FC<SDUICardProps> = React.memo(({ item, width = 120 }) => {
    const router = useRouter();

    const handlePress = () => {
        if (!item.action_type || !item.action_value) return;

        switch (item.action_type) {
            case 'product':
                router.push(`/product/${item.action_value}` as any);
                break;
            case 'category':
                // Navigate to search results with category name as query
                router.push({
                    pathname: '/search-results',
                    params: { query: item.display_title || '' }
                } as any);
                break;
            case 'url':
                // Handle external URL or internal deep link
                break;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { width: width as any }]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.display_image || 'https://via.placeholder.com/150' }}
                    style={styles.image}
                    contentFit="contain"
                    cachePolicy="disk"
                />
            </View>
            <View style={styles.content}>
                {item.display_title && (
                    <Text style={styles.title} numberOfLines={1}>
                        {item.display_title}
                    </Text>
                )}
                {item.display_footer && (
                    <Text style={styles.footer} numberOfLines={1}>
                        {item.display_footer}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm,
        alignItems: 'center',
        ...Shadows.sm,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        backgroundColor: Colors.background.subtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    image: {
        width: '90%',
        height: '90%',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: FontSize.sm,
        color: Colors.text.primary,
        fontWeight: FontWeight.semibold,
        textAlign: 'center',
        marginBottom: 2,
    },
    footer: {
        fontSize: FontSize.xs + 1,
        color: Colors.primaryDark,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
    },
});

SDUICard.displayName = 'SDUICard';
export default SDUICard;
