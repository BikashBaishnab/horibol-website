/**
 * Category Results Page
 * 
 * Displays products for a specific category.
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getProductsByCategory } from '../../services/product.service';
import { addToWishlist, getWishlistProductIds, removeFromWishlist } from '../../services/wishlist.service';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';
import type { Product } from '../../types';

export default function CategoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { cartCount } = useCart();
    const { user } = useAuth();
    const { showToast } = useToast();
    const params = useLocalSearchParams<{ id: string; name: string }>();
    const categoryId = parseInt(params.id || '0');
    const categoryName = params.name || 'Category';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchProducts();
        if (user?.id) {
            loadWishlist();
        }
    }, [categoryId, user?.id]);

    const loadWishlist = async () => {
        if (!user?.id) return;
        const ids = await getWishlistProductIds(user.id);
        setWishlistIds(ids);
    };

    const fetchProducts = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const currentPage = isRefresh ? 0 : page;
            const data = await getProductsByCategory(categoryId, currentPage, 20);

            if (isRefresh) {
                setProducts(data);
                setPage(0);
                setHasMore(data.length === 20);
            } else {
                setProducts(data);
                setHasMore(data.length === 20);
            }
        } catch (error) {
            console.error('Error fetching category products:', error);
            showToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const moreData = await getProductsByCategory(categoryId, nextPage, 20);

            if (moreData.length === 0) {
                setHasMore(false);
            } else {
                setProducts(prev => [...prev, ...moreData]);
                setPage(nextPage);
                setHasMore(moreData.length === 20);
            }
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleWishlistToggle = async (productId: number, variantId?: number | null) => {
        if (!user?.id) {
            router.push('/auth/login');
            return;
        }

        const vId = variantId || 0;
        const wishlistKey = `${productId}-${vId}`;
        const isWishlisted = wishlistIds.has(wishlistKey);

        setWishlistIds(prev => {
            const newSet = new Set(prev);
            if (isWishlisted) newSet.delete(wishlistKey);
            else newSet.add(wishlistKey);
            return newSet;
        });

        try {
            if (isWishlisted) {
                await removeFromWishlist(user.id, productId, variantId);
                showToast('Removed from wishlist');
            } else {
                await addToWishlist(user.id, productId, variantId);
                showToast('Added to wishlist');
            }
        } catch (error) {
            showToast('Failed to update wishlist', 'error');
            loadWishlist(); // Revert
        }
    };

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                {products.length > 0 && (
                    <Text style={styles.headerSubtitle}>{products.length} Products</Text>
                )}
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} style={styles.cartButton}>
                <Ionicons name="cart-outline" size={24} color={Colors.text.primary} />
                {cartCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}

            <FlatList
                data={products}
                numColumns={2}
                keyExtractor={(item, index) => `${item.product_id}-${index}`}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        isWishlisted={wishlistIds.has(`${item.product_id}-${item.variant_id || 0}`)}
                        onWishlistPress={handleWishlistToggle}
                    />
                )}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(true)} />
                }
                ListFooterComponent={
                    loadingMore ? <ActivityIndicator style={{ padding: 20 }} color={Colors.primary} /> : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bag-outline" size={64} color={Colors.text.tertiary} />
                        <Text style={styles.emptyText}>No products found in this category</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        backgroundColor: Colors.background.surface,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    headerSubtitle: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
    },
    cartButton: {
        padding: Spacing.sm,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.semantic.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    listContent: {
        paddingVertical: Spacing.sm,
        paddingBottom: 40,
    },
    columnWrapper: {
        paddingHorizontal: Spacing.md,
        justifyContent: 'space-between',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
        textAlign: 'center',
    },
});
