/**
 * Categories Screen
 * 
 * Modern category browsing with hierarchical navigation.
 * Premium UI with animated cards and smooth transitions.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../../context/CartContext';
import { Brand, getBrandsWithLogos } from '../../services/brand.service';
import { Category, CategoryWithChildren, getCategoriesWithHierarchy } from '../../services/category.service';
import { Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

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
    const [selectedParent, setSelectedParent] = useState<CategoryWithChildren | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandsLoading, setBrandsLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedParent?.show_brands) {
            loadBrands(selectedParent.id);
        } else {
            setBrands([]);
        }
    }, [selectedParent]);

    const loadBrands = async (id: number) => {
        setBrandsLoading(true);
        // Fetch only featured brands for the selected category
        const data = await getBrandsWithLogos({
            categoryId: id,
            onlyFeatured: true
        });

        setBrands(data);
        setBrandsLoading(false);
    };

    const loadCategories = async () => {
        setLoading(true);
        const data = await getCategoriesWithHierarchy();
        setCategories(data);
        if (data.length > 0) {
            setSelectedParent(data[0]);
        }
        setLoading(false);
    };

    const handleCategoryPress = (category: Category) => {
        // If it's a "View All" group (id: -1), use the parent's data
        const isViewAll = category.id === -1;

        router.push({
            pathname: '/search-results',
            params: {
                query: isViewAll ? selectedParent?.name : category.name,
                categoryId: isViewAll ? selectedParent?.id.toString() : category.id.toString()
            }
        });
    };

    const handleBrandPress = (brand: Brand) => {
        router.push({
            pathname: '/search-results',
            params: { query: brand.name, brands: brand.name }
        });
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

    // Render header
    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Categories</Text>
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

    // Sidebar Category Item
    const renderSidebarItem = ({ item }: { item: CategoryWithChildren }) => {
        const isSelected = selectedParent?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.sidebarItem, isSelected && styles.sidebarItemActive]}
                onPress={() => setSelectedParent(item)}
            >
                {isSelected && <View style={styles.activeIndicator} />}
                <View style={[styles.sidebarIconContainer, isSelected && styles.sidebarIconActive]}>
                    <Image
                        source={getImageSource(item)}
                        style={styles.sidebarIcon}
                        contentFit="contain"
                    />
                </View>
                <Text
                    style={[styles.sidebarText, isSelected && styles.sidebarTextActive]}
                    numberOfLines={2}
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    // Subcategory Group Section
    const renderSubcategoryGroup = (group: CategoryWithChildren) => {
        return (
            <View key={group.id} style={styles.groupContainer}>
                <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    <View style={styles.groupLine} />
                </View>
                <View style={styles.subGrid}>
                    {group.children.map((sub, idx) => (
                        <Animated.View
                            key={sub.id}
                            style={styles.subItem}
                            entering={FadeInDown.delay(idx * 30).duration(400)}
                        >
                            <TouchableOpacity
                                onPress={() => handleCategoryPress(sub)}
                                style={styles.subItemContent}
                            >
                                <View style={styles.subImageContainer}>
                                    <Image
                                        source={getImageSource(sub)}
                                        style={styles.subImage}
                                        contentFit="contain"
                                    />
                                </View>
                                <Text style={styles.subText} numberOfLines={2}>
                                    {sub.name}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                    {/* View All placeholder for group */}
                    <TouchableOpacity
                        style={styles.subItem}
                        onPress={() => handleCategoryPress(group)}
                    >
                        <View style={[styles.subImageContainer, styles.viewAllGrid]}>
                            <Ionicons name="apps-outline" size={24} color={Colors.text.secondary} />
                        </View>
                        <Text style={styles.subText}>View All</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                {/* Left Sidebar */}
                <View style={styles.sidebar}>
                    <FlatList
                        data={categories}
                        renderItem={renderSidebarItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                {/* Right Pane */}
                <View style={styles.rightPane}>
                    <FlatList
                        data={selectedParent?.children || []}
                        keyExtractor={(item) => item.id.toString()}
                        ListHeaderComponent={() => (
                            <View style={styles.rightHeader}>
                                <Text style={styles.rightHeaderTitle}>
                                    {selectedParent?.name}
                                </Text>
                            </View>
                        )}
                        renderItem={({ item, index }) => {
                            // If it has children (sub-sub-categories), render as a group
                            if (item.children && item.children.length > 0) {
                                return renderSubcategoryGroup(item);
                            }

                            const hasAnyGroupedChildren = selectedParent?.children.some(c => c.children.length > 0);

                            if (!hasAnyGroupedChildren) {
                                return null;
                            }

                            const firstLeafIndex = selectedParent?.children.findIndex(c => c.children.length === 0);
                            if (index === firstLeafIndex) {
                                const leafItems = selectedParent?.children.filter(c => c.children.length === 0) || [];
                                return renderSubcategoryGroup({
                                    id: -1,
                                    name: `View All ${selectedParent?.name}`,
                                    children: leafItems,
                                    parent_id: selectedParent?.id || null,
                                } as any);
                            }

                            return null;
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContent}>
                                <Text style={styles.emptyText}>No subcategories found</Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={() => {
                            const hasAnyGroupedChildren = selectedParent?.children.some(c => c.children.length > 0);
                            const showBrandsSection = selectedParent?.show_brands;

                            return (
                                <View style={{ paddingBottom: 100 }}>
                                    {!hasAnyGroupedChildren && (selectedParent?.children.length || 0) > 0 && (
                                        <View style={styles.subGridFull}>
                                            {selectedParent?.children.map(item => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.subItemFull}
                                                    onPress={() => handleCategoryPress(item)}
                                                >
                                                    <View style={styles.subImageContainer}>
                                                        <Image
                                                            source={getImageSource(item)}
                                                            style={styles.subImage}
                                                            contentFit="contain"
                                                        />
                                                    </View>
                                                    <Text style={styles.subText} numberOfLines={2}>
                                                        {item.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {/* Brands Section (if enabled for this category) */}
                                    {showBrandsSection && (
                                        <View style={styles.brandsSection}>
                                            <View style={styles.groupHeader}>
                                                <Text style={styles.groupTitle}>Shop by Brand</Text>
                                                <View style={styles.groupLine} />
                                            </View>
                                            {brandsLoading ? (
                                                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
                                            ) : (
                                                <View style={styles.brandsGrid}>
                                                    {brands.map((brand) => (
                                                        <TouchableOpacity
                                                            key={brand.id}
                                                            style={styles.brandCard}
                                                            onPress={() => handleBrandPress(brand)}
                                                        >
                                                            <View style={styles.brandImageContainer}>
                                                                <Image
                                                                    source={{ uri: brand.image || undefined }}
                                                                    style={styles.brandImage}
                                                                    contentFit="contain"
                                                                />
                                                            </View>
                                                            <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                    />
                </View>
            </View>
        </View>
    );
}

const SIDEBAR_WIDTH = 90;

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
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
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
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        backgroundColor: '#F8F9FA',
        borderRightWidth: 1,
        borderRightColor: Colors.border.light,
    },
    sidebarItem: {
        width: '100%',
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
    },
    sidebarItemActive: {
        backgroundColor: Colors.background.surface,
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: 4,
        backgroundColor: Colors.primary,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    sidebarIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        ...Shadows.sm,
    },
    sidebarIconActive: {
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    sidebarIcon: {
        width: 30,
        height: 30,
    },
    sidebarText: {
        fontSize: 11,
        color: Colors.text.secondary,
        textAlign: 'center',
        fontWeight: FontWeight.medium,
        paddingHorizontal: 4,
    },
    sidebarTextActive: {
        color: Colors.primary,
        fontWeight: FontWeight.bold,
    },
    rightPane: {
        flex: 1,
        backgroundColor: Colors.background.surface,
    },
    rightHeader: {
        padding: Spacing.md,
    },
    rightHeaderTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    groupContainer: {
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.sm,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    groupTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginRight: Spacing.sm,
    },
    groupLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border.light,
    },
    subGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    subItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    subItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    subImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    subImage: {
        width: 40,
        height: 40,
    },
    subText: {
        fontSize: FontSize.xs,
        color: Colors.text.primary,
        textAlign: 'center',
        fontWeight: FontWeight.medium,
        paddingHorizontal: 2,
    },
    viewAllGrid: {
        borderWidth: 1,
        borderColor: Colors.border.light,
        borderStyle: 'dashed',
    },
    subGridFull: {
        padding: Spacing.sm,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    subItemFull: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    subImageCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F8F9FA',
        marginBottom: 8,
    },
    emptyContent: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.text.secondary,
        fontSize: FontSize.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandsSection: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.sm,
    },
    brandsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 4,
    },
    brandCard: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    brandImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: Colors.background.surface,
        borderWidth: 1,
        borderColor: Colors.border.light,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        ...Shadows.sm,
    },
    brandImage: {
        width: '100%',
        height: '100%',
    },
    brandName: {
        fontSize: FontSize.xs,
        color: Colors.text.primary,
        textAlign: 'center',
        fontWeight: FontWeight.medium,
        width: '90%',
    },
});
