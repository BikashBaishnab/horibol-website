/**
 * Wishlist Screen
 * 
 * Displays user's saved products with add to cart and remove functionality.
 * Premium UI with swipe-to-delete and stock status indicators.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeOutRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PriceDisplay } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { addToCart } from '../../services/cart.service';
import { getWishlist, removeFromWishlist, WishlistProduct } from '../../services/wishlist.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;
const FALLBACK_IMAGE = require('../../assets/images/horibol_logo.png');

export default function WishlistScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { refreshCartCount } = useCart();
    const { showToast } = useToast();

    const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [removingItem, setRemovingItem] = useState<number | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadWishlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadWishlist = async () => {
        if (!user?.id) return;
        setLoading(true);
        const data = await getWishlist(user.id);
        setWishlist(data);
        setLoading(false);
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadWishlist();
        setRefreshing(false);
    }, [user]);

    const handleRemove = async (product: WishlistProduct) => {
        if (!user?.id) return;

        Alert.alert(
            'Remove from Wishlist',
            `Remove "${product.product_name}" from your wishlist?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const identifier = `${product.product_id}-${product.variant_id || 0}`;
                        setRemovingItem(identifier as any);
                        const success = await removeFromWishlist(user.id, product.product_id, product.variant_id);
                        if (success) {
                            setWishlist(prev => prev.filter(w => `${w.product_id}-${w.variant_id || 0}` !== identifier));
                        }
                        setRemovingItem(null);
                    }
                }
            ]
        );
    };

    const handleMoveToCart = async (product: WishlistProduct) => {
        if (product.stock === 0) {
            Alert.alert('Out of Stock', 'This product is currently out of stock');
            return;
        }

        // Add to cart
        try {
            await addToCart(product.product_id, product.variant_id);
            await refreshCartCount();
        } catch (error) {
            Alert.alert('Error', 'Failed to add item to cart');
            return;
        }

        // Remove from wishlist
        if (user?.id) {
            await removeFromWishlist(user.id, product.product_id, product.variant_id);
            const identifier = `${product.product_id}-${product.variant_id || 0}`;
            setWishlist(prev => prev.filter(w => `${w.product_id}-${w.variant_id || 0}` !== identifier));
        }

        showToast('Moved to cart');
    };

    const getImageSource = (imageUrl: string | null) => {
        if (imageUrl && imageUrl.trim() !== '') {
            return { uri: imageUrl };
        }
        return FALLBACK_IMAGE;
    };

    // Render header
    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>My Wishlist</Text>
                {wishlist.length > 0 && (
                    <Text style={styles.itemCount}>{wishlist.length} items</Text>
                )}
            </View>
            <View style={styles.headerRight} />
        </View>
    );

    // Render wishlist card
    const renderWishlistCard = ({ item, index }: { item: WishlistProduct; index: number }) => {
        const identifier = `${item.product_id}-${item.variant_id || 0}`;
        const isRemoving = removingItem === (identifier as any);
        const isOutOfStock = item.stock === 0;

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 50).duration(400)}
                exiting={FadeOutRight.duration(300)}
            >
                <TouchableOpacity
                    style={[styles.card, isOutOfStock && styles.cardOutOfStock]}
                    activeOpacity={0.9}
                    onPress={() => {
                        router.push({
                            pathname: `/product/[id]`,
                            params: { id: item.product_id, variantId: item.variant_id || undefined }
                        } as any);
                    }}
                >
                    {/* Remove Button */}
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemove(item)}
                        disabled={isRemoving}
                    >
                        {isRemoving ? (
                            <ActivityIndicator size="small" color={Colors.text.tertiary} />
                        ) : (
                            <Ionicons name="close" size={18} color={Colors.text.tertiary} />
                        )}
                    </TouchableOpacity>

                    {/* Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={getImageSource(item.main_image)}
                            style={[styles.image, !item.main_image && styles.fallbackImage]}
                            contentFit="contain"
                            cachePolicy="disk"
                            transition={300}
                        />
                        {isOutOfStock && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>Out of Stock</Text>
                            </View>
                        )}
                        {item.discount_percentage && item.discount_percentage > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>{Math.round(item.discount_percentage)}% OFF</Text>
                            </View>
                        )}
                    </View>

                    {/* Details */}
                    <View style={styles.details}>
                        {item.brand_name && (
                            <Text style={styles.brand} numberOfLines={1}>
                                {item.brand_name}
                            </Text>
                        )}
                        <Text style={styles.name} numberOfLines={2}>
                            {item.product_name}
                        </Text>
                        {item.attributes ? (
                            <Text style={styles.variantInfo} numberOfLines={1}>
                                {Object.entries(item.attributes)
                                    .filter(([key]) => key !== 'id' && key !== 'variant_name')
                                    .map(([_, val]) => String(val))
                                    .join(' | ')}
                            </Text>
                        ) : null}

                        <PriceDisplay
                            price={item.price}
                            mrp={item.mrp}
                            discountPercentage={item.discount_percentage ?? undefined}
                            size="sm"
                        />
                    </View>

                    {/* Add to Cart Button */}
                    <TouchableOpacity
                        style={[
                            styles.cartButton,
                            isOutOfStock && styles.cartButtonDisabled
                        ]}
                        onPress={() => handleMoveToCart(item)}
                        disabled={isOutOfStock}
                    >
                        <Ionicons
                            name="cart-outline"
                            size={16}
                            color={isOutOfStock ? Colors.text.tertiary : Colors.text.primary}
                        />
                        <Text style={[
                            styles.cartButtonText,
                            isOutOfStock && styles.cartButtonTextDisabled
                        ]}>
                            {isOutOfStock ? 'Unavailable' : 'Move to Cart'}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons name="heart-outline" size={80} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySubtitle}>
                Save items you love by tapping the heart icon on any product
            </Text>
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/')}
            >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    // Render login prompt
    const renderLoginPrompt = () => (
        <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Save Your Favorites</Text>
            <Text style={styles.emptySubtitle}>
                Login to save products to your wishlist and access them anytime
            </Text>
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/auth/login')}
            >
                <Text style={styles.shopButtonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading wishlist...</Text>
                </View>
            ) : !user ? (
                renderLoginPrompt()
            ) : (
                <FlatList
                    data={wishlist}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderWishlistCard}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    backButton: {
        padding: Spacing.sm,
        marginLeft: -Spacing.sm,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    itemCount: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
    },
    headerRight: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    cardOutOfStock: {
        opacity: 0.7,
    },
    removeButton: {
        position: 'absolute',
        top: Spacing.xs,
        right: Spacing.xs,
        zIndex: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.background.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    imageContainer: {
        height: 140,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.sm,
        backgroundColor: Colors.background.secondary,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fallbackImage: {
        opacity: 0.4,
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outOfStockText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.text.inverse,
        backgroundColor: Colors.semantic.error,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: Colors.semantic.error,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderBottomRightRadius: BorderRadius.sm,
    },
    discountText: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: Colors.text.inverse,
    },
    details: {
        padding: Spacing.sm,
    },
    brand: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.text.tertiary,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    name: {
        fontSize: FontSize.sm,
        color: Colors.text.primary,
        height: 36,
        lineHeight: 18,
        marginBottom: 2,
    },
    variantInfo: {
        fontSize: 10,
        color: Colors.text.tertiary,
        marginBottom: Spacing.xs,
    },
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
    },
    cartButtonDisabled: {
        backgroundColor: Colors.background.secondary,
    },
    cartButtonText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
        marginLeft: Spacing.xs,
    },
    cartButtonTextDisabled: {
        color: Colors.text.tertiary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    shopButton: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },
    shopButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
});