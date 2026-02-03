/**
 * Filter Modal Component
 * 
 * Bottom sheet modal for filtering search results by price and brand.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../../theme';
import { PriceRange } from '../../types/search.types';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (priceRange: PriceRange | null, brands: string[]) => void;
    priceRanges: PriceRange[];
    brands: string[];
    selectedPriceRange: PriceRange | null;
    selectedBrands: string[];
}

export default function FilterModal({
    visible,
    onClose,
    onApply,
    priceRanges,
    brands,
    selectedPriceRange,
    selectedBrands,
}: FilterModalProps) {
    const insets = useSafeAreaInsets();

    // Local state for filter selections
    const [localPriceRange, setLocalPriceRange] = useState<PriceRange | null>(selectedPriceRange);
    const [localBrands, setLocalBrands] = useState<string[]>(selectedBrands);

    // Sync local state when modal opens
    useEffect(() => {
        if (visible) {
            setLocalPriceRange(selectedPriceRange);
            setLocalBrands([...selectedBrands]);
        }
    }, [visible, selectedPriceRange, selectedBrands]);

    const handlePriceRangeSelect = (range: PriceRange) => {
        if (localPriceRange?.label === range.label) {
            setLocalPriceRange(null);
        } else {
            setLocalPriceRange(range);
        }
    };

    const handleBrandToggle = (brand: string) => {
        if (localBrands.includes(brand)) {
            setLocalBrands(localBrands.filter(b => b !== brand));
        } else {
            setLocalBrands([...localBrands, brand]);
        }
    };

    const handleClearAll = () => {
        setLocalPriceRange(null);
        setLocalBrands([]);
    };

    const handleApply = () => {
        onApply(localPriceRange, localBrands);
    };

    const hasFilters = localPriceRange !== null || localBrands.length > 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.dismissArea} onPress={onClose} />

                <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.md }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Filters</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Price Range Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Price Range</Text>
                            <View style={styles.optionsGrid}>
                                {priceRanges.map((range) => (
                                    <TouchableOpacity
                                        key={range.label}
                                        style={[
                                            styles.optionChip,
                                            localPriceRange?.label === range.label && styles.optionChipActive
                                        ]}
                                        onPress={() => handlePriceRangeSelect(range)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            localPriceRange?.label === range.label && styles.optionTextActive
                                        ]}>
                                            {range.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Brand Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Brands</Text>
                            <View style={styles.brandList}>
                                {brands.map((brand) => (
                                    <TouchableOpacity
                                        key={brand}
                                        style={styles.brandItem}
                                        onPress={() => handleBrandToggle(brand)}
                                    >
                                        <View style={[
                                            styles.checkbox,
                                            localBrands.includes(brand) && styles.checkboxActive
                                        ]}>
                                            {localBrands.includes(brand) && (
                                                <Ionicons name="checkmark" size={14} color={Colors.background.surface} />
                                            )}
                                        </View>
                                        <Text style={styles.brandName}>{brand}</Text>
                                    </TouchableOpacity>
                                ))}
                                {brands.length === 0 && (
                                    <Text style={styles.emptyText}>No brands available</Text>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.footerButton, styles.clearButton]}
                            onPress={handleClearAll}
                            disabled={!hasFilters}
                        >
                            <Text style={[styles.clearButtonText, !hasFilters && styles.disabledText]}>
                                Clear All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.footerButton, styles.applyButton]}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: Colors.background.modal,
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    container: {
        backgroundColor: Colors.background.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    content: {
        paddingHorizontal: Spacing.lg,
    },
    section: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    optionChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.round,
        borderWidth: 1,
        borderColor: Colors.border.default,
        backgroundColor: Colors.background.surface,
    },
    optionChipActive: {
        borderColor: Colors.primary,
        backgroundColor: '#FFFDF5',
    },
    optionText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    optionTextActive: {
        color: Colors.primary,
        fontWeight: FontWeight.semibold,
    },
    brandList: {
        gap: Spacing.xs,
    },
    brandItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: BorderRadius.xs,
        borderWidth: 2,
        borderColor: Colors.border.medium,
        marginRight: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    brandName: {
        fontSize: FontSize.md,
        color: Colors.text.primary,
    },
    emptyText: {
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
    },
    footerButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButton: {
        backgroundColor: Colors.background.secondary,
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    clearButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text.secondary,
    },
    disabledText: {
        color: Colors.text.disabled,
    },
    applyButton: {
        backgroundColor: Colors.primary,
    },
    applyButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
});
