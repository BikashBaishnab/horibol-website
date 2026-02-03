/**
 * ProductCard Component
 * 
 * Reusable product card for grid displays.
 * Used in Home, Search, Category, and Wishlist screens.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Colors, FontWeight, Shadows, Spacing } from '../../theme';
import type { Product } from '../../types';
import PriceDisplay from './PriceDisplay';

const { width } = Dimensions.get('window');
const FALLBACK_IMAGE = require('../../assets/images/horibol_logo.png');

interface ProductCardProps {
    product: Product;
    onWishlistPress?: (productId: number, variantId?: number | null) => void;
    isWishlisted?: boolean;
}

const ProductCard = React.memo(({
    product,
    onWishlistPress,
    isWishlisted = false,
}: ProductCardProps) => {
    const router = useRouter();

    const hasImage = product.main_image && product.main_image.trim() !== '';
    const imageSource = hasImage ? { uri: product.main_image! } : FALLBACK_IMAGE;

    const handlePress = () => {
        router.push(`/product/${product.product_id}`);
    };

    const handleWishlist = () => {
        onWishlistPress?.(product.product_id, product.variant_id);
    };

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={handlePress}
        >
            {/* Wishlist Button */}
            <TouchableOpacity
                style={styles.wishlistBtn}
                onPress={handleWishlist}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name={isWishlisted ? "heart" : "heart-outline"}
                    size={18}
                    color={isWishlisted ? Colors.semantic.error : Colors.icon.muted}
                />
            </TouchableOpacity>

            {/* Product Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={imageSource}
                    style={[styles.image, !hasImage && styles.fallbackImage]}
                    contentFit="contain"
                    cachePolicy="disk"
                    transition={500}
                />
            </View>

            {/* Product Details */}
            <View style={styles.details}>
                {product.brand_name && (
                    <Text style={styles.brand} numberOfLines={1}>
                        {product.brand_name}
                    </Text>
                )}
                <Text style={styles.name} numberOfLines={2}>
                    {product.product_name || product.name}
                </Text>
                <PriceDisplay
                    price={product.price}
                    mrp={product.mrp}
                    discountPercentage={product.discount_percentage}
                    size="sm"
                />
            </View>

            {/* Rating Badge (Overlapping Image) */}
            {product.average_rating ? (
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{product.average_rating}</Text>
                    <Ionicons name="star" size={10} color="#FFFFFF" />
                    {product.total_reviews && (
                        <Text style={styles.reviewCount}> | {product.total_reviews}</Text>
                    )}
                </View>
            ) : null}
        </TouchableOpacity>
    );
});

export default ProductCard;

const styles = StyleSheet.create({
    card: {
        width: (width - (Spacing.md * 3)) / 2, // (Screen - (3 * 16px gutter)) / 2
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border.light,
        ...Shadows.sm,
    },
    wishlistBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    imageContainer: {
        height: 180,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F8FA',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fallbackImage: {
        opacity: 0.2,
    },
    details: {
        padding: Spacing.sm,
    },
    brand: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text.secondary,
        marginBottom: 2,
        textTransform: 'capitalize',
    },
    name: {
        fontSize: 14,
        fontWeight: '400',
        color: Colors.text.primary,
        lineHeight: 18,
        marginBottom: 4,
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(56, 142, 60, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 2,
        ...Shadows.sm,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: '#FFFFFF',
    },
    reviewCount: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: FontWeight.medium,
    },
});
