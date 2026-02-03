/**
 * Search Results Page
 * 
 * Displays search results in a grid with filtering and sorting capabilities.
 * Similar to product listing pages in top e-commerce apps.
 */

import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StatusBar as RNStatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '../../components/common';
import FilterModal from '../../components/search/FilterModal';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getBrands, searchProductsWithFilters } from '../../services/product.service';
import { addToWishlist, isInWishlist, removeFromWishlist } from '../../services/wishlist.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';
import { PRICE_RANGES, PriceRange, SearchResultProduct, SORT_OPTIONS, SortOption } from '../../types/search.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;
const FALLBACK_IMAGE = require('../../assets/images/horibol_logo.png');

export default function SearchResultsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { cartCount } = useCart();
    const params = useLocalSearchParams<{ query: string }>();
    const searchQuery = params.query || '';

    // States
    const [results, setResults] = useState<SearchResultProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Filter states
    const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const { user } = useAuth();
    const { showToast } = useToast();

    // Load brands on mount
    useEffect(() => {
        loadBrands();
    }, []);

    // Fetch results when query or filters change
    useEffect(() => {
        fetchResults();
    }, [searchQuery, selectedPriceRange, selectedBrands, sortBy]);

    const loadBrands = async () => {
        const brandList = await getBrands();
        setBrands(brandList);
    };

    const fetchResults = async () => {
        setLoading(true);
        const data = await searchProductsWithFilters(searchQuery, {
            priceRange: selectedPriceRange,
            brands: selectedBrands.length > 0 ? selectedBrands : undefined,
            sortBy
        });
        setResults(data);
        setLoading(false);
        // Check wishlist status for all products
        if (user?.id && data.length > 0) {
            const wishlistStatus: Set<string> = new Set();
            await Promise.all(
                data.map(async (p) => {
                    const variantId = (p as any).variant_id || 0; // Assuming variant_id might be present
                    if (await isInWishlist(user.id, p.product_id, variantId)) {
                        wishlistStatus.add(`${p.product_id}-${variantId}`);
                    }
                })
            );
            setWishlistIds(wishlistStatus);
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
    };

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedPriceRange) count++;
        if (selectedBrands.length > 0) count += selectedBrands.length;
        return count;
    }, [selectedPriceRange, selectedBrands]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setSelectedPriceRange(null);
        setSelectedBrands([]);
        setSortBy('relevance');
    }, []);

    // Apply filters from modal
    const handleApplyFilters = useCallback((priceRange: PriceRange | null, brands: string[]) => {
        setSelectedPriceRange(priceRange);
        setSelectedBrands(brands);
        setShowFilters(false);
    }, []);

    // Render header
    const renderHeader = () => (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.searchContainer}
                onPress={() => router.push('/search')}
                activeOpacity={0.9}
            >
                <Feather name="search" size={18} color={Colors.text.placeholder} style={styles.searchIcon} />
                <Text style={styles.searchText} numberOfLines={1}>
                    {searchQuery || 'Search for products...'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => router.push('/(tabs)/cart')}>
                <Ionicons name="cart-outline" size={24} color={Colors.text.primary} />
                {cartCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    // Render filter bar
    const renderFilterBar = () => (
        <View style={styles.filterBar}>
            <TouchableOpacity
                style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
                onPress={() => setShowFilters(true)}
            >
                <Ionicons name="filter" size={18} color={activeFilterCount > 0 ? Colors.primary : Colors.text.secondary} />
                <Text style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}>
                    Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setShowSortMenu(!showSortMenu)}
            >
                <MaterialIcons name="sort" size={18} color={Colors.text.secondary} />
                <Text style={styles.sortButtonText}>
                    {SORT_OPTIONS.find(s => s.value === sortBy)?.label || 'Sort'}
                </Text>
                <MaterialIcons name={showSortMenu ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
        </View>
    );

    // Render sort dropdown
    const renderSortDropdown = () => {
        if (!showSortMenu) return null;

        return (
            <View style={styles.sortDropdown}>
                {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
                        onPress={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                        }}
                    >
                        <Text style={[styles.sortOptionText, sortBy === option.value && styles.sortOptionTextActive]}>
                            {option.label}
                        </Text>
                        {sortBy === option.value && (
                            <Ionicons name="checkmark" size={18} color={Colors.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // Render active filter chips
    const renderFilterChips = () => {
        if (activeFilterCount === 0) return null;

        return (
            <View style={styles.chipsContainer}>
                {selectedPriceRange && (
                    <TouchableOpacity
                        style={styles.chip}
                        onPress={() => setSelectedPriceRange(null)}
                    >
                        <Text style={styles.chipText}>{selectedPriceRange.label}</Text>
                        <Ionicons name="close" size={14} color={Colors.text.secondary} />
                    </TouchableOpacity>
                )}
                {selectedBrands.map((brand) => (
                    <TouchableOpacity
                        key={brand}
                        style={styles.chip}
                        onPress={() => setSelectedBrands(prev => prev.filter(b => b !== brand))}
                    >
                        <Text style={styles.chipText}>{brand}</Text>
                        <Ionicons name="close" size={14} color={Colors.text.secondary} />
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.clearChip} onPress={clearAllFilters}>
                    <Text style={styles.clearChipText}>Clear All</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render product card
    const renderProductCard = ({ item }: { item: SearchResultProduct }) => (
        <ProductCard
            product={item as any}
            isWishlisted={wishlistIds.has(`${item.product_id}-${(item as any).variant_id || 0}`)}
            onWishlistPress={handleWishlistToggle}
        />
    );

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
                {activeFilterCount > 0
                    ? 'Try adjusting your filters'
                    : `No results for "${searchQuery}"`}
            </Text>
            {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
            <RNStatusBar barStyle="dark-content" backgroundColor={Colors.background.surface} />
            <Stack.Screen options={{ headerShown: false }} />

            {renderHeader()}
            {renderFilterBar()}
            {renderSortDropdown()}
            {renderFilterChips()}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={results}
                    numColumns={2}
                    keyExtractor={(item, index) => `${item.product_id}-${item.attributes ? JSON.stringify(item.attributes) : ''}-${index}`}

                    renderItem={renderProductCard}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    ListHeaderComponent={
                        results.length > 0 ? (
                            <Text style={styles.resultsCount}>{results.length} products found</Text>
                        ) : null
                    }
                />
            )}

            <FilterModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={handleApplyFilters}
                priceRanges={PRICE_RANGES}
                brands={brands}
                selectedPriceRange={selectedPriceRange}
                selectedBrands={selectedBrands}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    headerIconButton: {
        padding: Spacing.sm,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.md,
        height: 40,
        marginHorizontal: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchText: {
        flex: 1,
        color: Colors.text.primary,
        fontSize: FontSize.md,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: Colors.semantic.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: Colors.text.inverse,
        fontSize: 10,
        fontWeight: FontWeight.bold,
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.surface,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    filterButtonActive: {
        borderColor: Colors.primary,
        backgroundColor: '#FFFDF5',
    },
    filterButtonText: {
        marginLeft: Spacing.xs,
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    filterButtonTextActive: {
        color: Colors.primary,
        fontWeight: FontWeight.semibold,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: Colors.border.default,
        marginHorizontal: Spacing.md,
    },
    sortButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortButtonText: {
        flex: 1,
        marginLeft: Spacing.xs,
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    sortDropdown: {
        position: 'absolute',
        top: 160,
        right: Spacing.md,
        left: Spacing.md * 6,
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        ...Shadows.md,
        zIndex: 100,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    sortOptionActive: {
        backgroundColor: '#FFFDF5',
    },
    sortOptionText: {
        fontSize: FontSize.md,
        color: Colors.text.primary,
    },
    sortOptionTextActive: {
        color: Colors.primary,
        fontWeight: FontWeight.semibold,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background.surface,
        gap: Spacing.xs,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.round,
        gap: Spacing.xs,
    },
    chipText: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    clearChip: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    clearChipText: {
        fontSize: FontSize.xs,
        color: Colors.semantic.error,
        fontWeight: FontWeight.semibold,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    columnWrapper: {
        paddingHorizontal: Spacing.md,
        justifyContent: 'space-between',
    },
    resultsCount: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    outOfStock: {
        fontSize: FontSize.xs,
        color: Colors.semantic.error,
        marginTop: Spacing.xs,
    },
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
        textAlign: 'center',
    },
    clearFiltersButton: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },
    clearFiltersText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
});
