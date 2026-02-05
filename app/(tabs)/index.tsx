/**
 * Home Screen
 * 
 * Main landing page with categories, hero slider, and product grid.
 * Refactored to use centralized theme, services, and components.
 */

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    LayoutAnimation,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme & Components
import { LoadingSpinner, ProductCard } from '../../components/common';
import SectionRenderer from '../../components/home/SectionRenderer';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

// Context
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Services & Types
import { getHomeSections } from '../../services/home.service';
import { getCategories, getHeroSlides, getProductsPaginated } from '../../services/product.service';
import { addToWishlist, getWishlistProductIds, removeFromWishlist } from '../../services/wishlist.service';
import type { Category, HeroSlide, HomeSection, Product } from '../../types';

const { width } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    'Mobiles': 'smartphone',
    'Fashion': 'checkroom',
    'Electronics': 'electrical-services',
    'Home': 'home',
    'Beauty': 'face',
    'Appliances': 'kitchen',
    'Toys': 'toys',
    'Sports': 'sports-soccer',
};
const DEFAULT_ICON = 'category';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [logoError, setLogoError] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = [
        "Search for products...",
        "Search for mobiles...",
        "Search for accessories...",
        "Search for electronics...",
        "Search for gadgets..."
    ];
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);

    const flatListRef = useRef<FlatList<HeroSlide>>(null);

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch wishlist when user changes
    useEffect(() => {
        if (user?.id) {
            loadWishlist();
        } else {
            setWishlistIds(new Set());
        }
    }, [user?.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setPage(0);
            setHasMore(true);
            const [catData, slideData, sectionData, productData] = await Promise.all([
                getCategories(),
                getHeroSlides(),
                getHomeSections(),
                getProductsPaginated(0, 20),
            ]);

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

            setCategories(catData.filter(c => c.parent_id === null || c.parent_id === undefined));
            setHeroSlides(slideData);
            setHomeSections(sectionData);
            setProducts(productData);
            if (productData.length < 20) setHasMore(false);
        } catch (error) {
            console.error('Unexpected error fetching home data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadMoreProducts = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const moreProducts = await getProductsPaginated(nextPage, 20);

            if (moreProducts.length === 0) {
                setHasMore(false);
            } else {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setProducts(prev => [...prev, ...moreProducts]);
                setPage(nextPage);
                if (moreProducts.length < 20) setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const loadWishlist = async () => {
        if (!user?.id) return;
        const ids = await getWishlistProductIds(user.id);
        setWishlistIds(ids);
    };

    const handleWishlistToggle = useCallback(async (productId: number, variantId?: number | null) => {
        if (!user?.id) {
            router.push('/auth/login');
            return;
        }

        const vId = variantId || 0;
        const wishlistKey = `${productId}-${vId}`;
        const isWishlisted = wishlistIds.has(wishlistKey);

        // Optimistic update
        setWishlistIds(prev => {
            const newSet = new Set(prev);
            if (isWishlisted) {
                newSet.delete(wishlistKey);
            } else {
                newSet.add(wishlistKey);
            }
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
            // Revert on error
            setWishlistIds(prev => {
                const newSet = new Set(prev);
                if (isWishlisted) {
                    newSet.add(wishlistKey);
                } else {
                    newSet.delete(wishlistKey);
                }
                return newSet;
            });
        }
    }, [user, wishlistIds, router, showToast]);

    // Auto-scroll hero slider
    useEffect(() => {
        if (heroSlides.length === 0) return;
        const interval = setInterval(() => {
            let nextIndex = activeSlide + 1;
            if (nextIndex >= heroSlides.length) nextIndex = 0;
            try {
                flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                setActiveSlide(nextIndex);
            } catch (e) { }
        }, 3000);
        return () => clearInterval(interval);
    }, [activeSlide, heroSlides.length]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) setActiveSlide(viewableItems[0].index ?? 0);
    }, []);

    const getCategoryIcon = (name: string) => {
        const key = Object.keys(CATEGORY_ICONS).find(k => name.includes(k));
        return key ? CATEGORY_ICONS[key] : DEFAULT_ICON;
    };

    const renderHeaderContent = useMemo(() => (
        <>
            {/* Categories */}
            {categories.length > 0 && (
                <View style={styles.categoriesSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.categoryItem}
                                onPress={() => router.push({
                                    pathname: '/category/[id]',
                                    params: { id: cat.id, name: cat.name }
                                })}
                            >
                                <View style={styles.categoryIconCircle}>
                                    {cat.image ? (
                                        <Image
                                            source={{ uri: cat.image }}
                                            style={styles.categoryImage}
                                            contentFit="contain"
                                            cachePolicy="disk"
                                            transition={300}
                                        />
                                    ) : (
                                        <MaterialIcons name={getCategoryIcon(cat.name)} size={24} color={Colors.primaryDark} />
                                    )}
                                </View>
                                <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Hero Slider */}
            {heroSlides.length > 0 && (
                <View style={styles.sliderSection}>
                    <FlatList
                        ref={flatListRef}
                        data={heroSlides}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity activeOpacity={0.9} style={styles.slideItem}>
                                <Image
                                    source={{ uri: item.slider_image }}
                                    style={styles.slideImage}
                                    contentFit="cover"
                                    cachePolicy="disk"
                                />
                            </TouchableOpacity>
                        )}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                    />
                    <View style={styles.dotsContainer}>
                        {heroSlides.map((_, index) => (
                            <View key={index} style={[styles.dot, activeSlide === index ? styles.activeDot : styles.inactiveDot]} />
                        ))}
                    </View>
                </View>
            )}

            {/* Dynamic SDUI Sections */}
            {homeSections.map((section) => (
                <SectionRenderer
                    key={section.id}
                    section={section}
                />
            ))}

            <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>Just For You</Text>
            </View>
        </>
    ), [categories, heroSlides, homeSections, activeSlide, onViewableItemsChanged]);

    const renderFooter = useCallback(() => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
            </View>
        );
    }, [loadingMore]);

    const renderItem = useCallback(({ item }: { item: Product }) => (
        <ProductCard
            product={item}
            isWishlisted={wishlistIds.has(`${item.product_id}-${item.variant_id || 0}`)}
            onWishlistPress={handleWishlistToggle}
        />
    ), [wishlistIds, handleWishlistToggle]);

    useEffect(() => {
        const interval = setInterval(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="dark" translucent backgroundColor="transparent" />

            {/* Header */}
            <LinearGradient
                colors={['#FFDF40', '#FFFFFF']} // Semi-light brand yellow to White
                style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.logoContainer}
                        onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
                        activeOpacity={0.8}
                    >
                        {logoError ? (
                            <View style={styles.logoFallback}>
                                <Text style={styles.logoText}>H</Text>
                            </View>
                        ) : (
                            <Image
                                source={require('../../assets/images/horibol_logo.png')}
                                style={styles.logo}
                                onError={() => setLogoError(true)}
                                contentFit="contain"
                                cachePolicy="memory-disk"
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.searchContainer}
                        onPress={() => router.push('/search')}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="search" size={20} color={Colors.text.placeholder} style={styles.searchIcon} />
                        <Text style={styles.searchText}>{placeholders[placeholderIndex]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.notificationIconBtn}
                        onPress={() => router.push('/notifications')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-outline" size={26} color={Colors.text.primary} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.centerContainer}>
                    <LoadingSpinner />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item, index) => `${item.product_id}-${index}`}
                    numColumns={2}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeaderContent}
                    ListFooterComponent={renderFooter}
                    onEndReached={loadMoreProducts}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    contentContainerStyle={styles.scrollContent}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.background.primary
    },
    header: {
        paddingBottom: Spacing.sm,
        zIndex: 100,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        height: 48, // Unified row height
        gap: Spacing.sm,
    },
    logoContainer: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 32,
        height: 32
    },
    logoFallback: {
        width: 32,
        height: 32,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontWeight: FontWeight.bold,
        fontSize: FontSize.lg,
        color: Colors.text.primary,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        height: 44, // Unified height with logo and icon btn
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        ...Shadows.sm
    },
    searchIcon: {
        marginRight: Spacing.xs
    },
    searchText: {
        color: Colors.text.placeholder,
        fontSize: FontSize.md,
        flex: 1,
    },
    notificationIconBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.semantic.error,
        borderWidth: 1.5,
        borderColor: '#FFFFFF', // Contrast against gradient
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        paddingTop: Spacing.sm
    },
    categoriesSection: {
        backgroundColor: Colors.background.surface,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.sm
    },
    categoriesList: {
        paddingHorizontal: Spacing.sm
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: Spacing.xl,
        width: 60
    },
    categoryIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFDF0', // Very light yellow
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        borderWidth: 1,
        borderColor: '#FFF9E1',
        overflow: 'hidden',
        ...Shadows.sm,
    },
    categoryImage: {
        width: '70%',
        height: '70%',
    },
    categoryName: {
        fontSize: FontSize.xs + 1,
        color: Colors.text.primary,
        textAlign: 'center',
        fontWeight: FontWeight.medium
    },
    sliderSection: {
        marginBottom: Spacing.sm,
        backgroundColor: Colors.background.surface,
        paddingBottom: Spacing.sm
    },
    slideItem: {
        width: width,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center'
    },
    slideImage: {
        width: width - 20,
        height: 170,
        borderRadius: BorderRadius.md
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm
    },
    dot: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3
    },
    activeDot: {
        width: 16,
        backgroundColor: Colors.primaryDark
    },
    inactiveDot: {
        width: 6,
        backgroundColor: Colors.border.medium
    },
    productsSection: {},
    sectionTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.sm,
        color: Colors.text.primary
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm
    },
    emptyText: {
        textAlign: 'center',
        padding: Spacing.xl,
        color: Colors.text.tertiary,
        fontSize: FontSize.md
    },
    recommendationHeader: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background.surface,
        marginTop: Spacing.sm,
    },
    recommendationTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    columnWrapper: {
        paddingHorizontal: Spacing.md,
        justifyContent: 'space-between',
    }
});