/**
 * Categories Screen
 * 
 * Modern category browsing with hierarchical navigation.
 * Premium UI with animated cards and smooth transitions.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../../context/CartContext';
import { Category, CategoryWithChildren, getCategoriesWithHierarchy } from '../../services/category.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

// Fallback gradient colors for categories without images
const GRADIENT_COLORS = [
    ['#FF6B6B', '#FF8E8E'],
    ['#4ECDC4', '#7BE0D8'],
    ['#45B7D1', '#6FC8DC'],
    ['#96E6A1', '#B8F0BD'],
    ['#DDA0DD', '#E8C1E8'],
    ['#F7DC6F', '#FAE99F'],
    ['#BB8FCE', '#D2B4DE'],
    ['#85C1E9', '#AED6F1'],
];

const FALLBACK_IMAGE = require('../../assets/images/horibol_logo.png');

export default function CategoriesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { cartCount } = useCart();

    const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedParent, setSelectedParent] = useState<CategoryWithChildren | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const data = await getCategoriesWithHierarchy();
        setCategories(data);
        setLoading(false);
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadCategories();
        setRefreshing(false);
    }, []);

    const handleCategoryPress = (category: Category) => {
        // Navigate to search results filtered by category
        router.push({
            pathname: '/search-results',
            params: { query: category.name, categoryId: category.id.toString() }
        });
    };

    const handleParentPress = (parent: CategoryWithChildren) => {
        if (parent.children && parent.children.length > 0) {
            setSelectedParent(parent);
        } else {
            handleCategoryPress(parent);
        }
    };

    const getImageSource = (category: Category) => {
        if (category.image_url && category.image_url.trim() !== '') {
            return { uri: category.image_url };
        }
        if (category.image && category.image.trim() !== '') {
            return { uri: category.image };
        }
        return FALLBACK_IMAGE;
    };

    const getGradientColor = (index: number) => {
        return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
    };

    // Render header
    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Categories</Text>
                <Text style={styles.headerSubtitle}>Browse by category</Text>
            </View>
            <TouchableOpacity
                style={styles.cartButton}
                onPress={() => router.push('/(tabs)/cart')}
            >
                <Ionicons name="cart-outline" size={24} color={Colors.text.primary} />
                {cartCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    // Render parent category card
    const renderParentCard = ({ item, index }: { item: CategoryWithChildren; index: number }) => {
        const hasImage = item.image_url || item.image;
        const gradientColors = getGradientColor(index);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                <TouchableOpacity
                    style={[
                        styles.parentCard,
                        !hasImage && { backgroundColor: gradientColors[0] }
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleParentPress(item)}
                >
                    {hasImage ? (
                        <Image
                            source={getImageSource(item)}
                            style={styles.parentImage}
                            contentFit="cover"
                            transition={300}
                        />
                    ) : (
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name="shape-outline"
                                size={40}
                                color="rgba(255,255,255,0.9)"
                            />
                        </View>
                    )}
                    <View style={[styles.parentOverlay, hasImage && styles.parentOverlayWithImage]}>
                        <Text style={styles.parentName} numberOfLines={2}>{item.name}</Text>
                        {item.children && item.children.length > 0 && (
                            <View style={styles.subcategoryBadge}>
                                <Text style={styles.subcategoryCount}>
                                    {item.children.length} subcategories
                                </Text>
                                <Ionicons name="chevron-forward" size={14} color={Colors.text.inverse} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Render subcategory list (when a parent is selected)
    const renderSubcategoryView = () => {
        if (!selectedParent) return null;

        return (
            <View style={styles.subcategoryContainer}>
                {/* Breadcrumb Header */}
                <Animated.View entering={FadeInRight.duration(300)} style={styles.breadcrumbHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedParent(null)}
                    >
                        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <View style={styles.breadcrumbText}>
                        <Text style={styles.breadcrumbLabel}>Subcategories of</Text>
                        <Text style={styles.breadcrumbTitle}>{selectedParent.name}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => handleCategoryPress(selectedParent)}
                    >
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Subcategory Grid */}
                <FlatList
                    data={selectedParent.children}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
                            <TouchableOpacity
                                style={styles.subcategoryCard}
                                activeOpacity={0.8}
                                onPress={() => handleCategoryPress(item)}
                            >
                                <Image
                                    source={getImageSource(item)}
                                    style={styles.subcategoryImage}
                                    contentFit="cover"
                                    transition={200}
                                />
                                <Text style={styles.subcategoryName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                    contentContainerStyle={styles.subcategoryList}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons name="shape-outline" size={80} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Categories</Text>
            <Text style={styles.emptySubtitle}>Categories will appear here once added</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            {selectedParent ? (
                renderSubcategoryView()
            ) : (
                <FlatList
                    data={categories}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderParentCard}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    headerSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
        marginTop: 2,
    },
    cartButton: {
        padding: Spacing.sm,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.semantic.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: Colors.text.inverse,
        fontSize: 10,
        fontWeight: FontWeight.bold,
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
    parentCard: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.1,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        ...Shadows.md,
    },
    parentImage: {
        width: '100%',
        height: '100%',
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    parentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
    },
    parentOverlayWithImage: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    parentName: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.inverse,
    },
    subcategoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    subcategoryCount: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.8)',
        marginRight: 2,
    },
    // Subcategory View
    subcategoryContainer: {
        flex: 1,
    },
    breadcrumbHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    backButton: {
        padding: Spacing.xs,
        marginRight: Spacing.sm,
    },
    breadcrumbText: {
        flex: 1,
    },
    breadcrumbLabel: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
    },
    breadcrumbTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },
    viewAllButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.sm,
    },
    viewAllText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },
    subcategoryList: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    subcategoryCard: {
        width: CARD_WIDTH,
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    subcategoryImage: {
        width: '100%',
        height: CARD_WIDTH * 0.7,
        backgroundColor: Colors.background.secondary,
    },
    subcategoryName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.text.primary,
        padding: Spacing.sm,
        textAlign: 'center',
    },
    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
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
    },
});
