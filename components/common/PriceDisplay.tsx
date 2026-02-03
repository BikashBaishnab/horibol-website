/**
 * PriceDisplay Component
 * 
 * Consistent price formatting with MRP and discount display.
 * Used in ProductCard, Cart, Product Detail screens.
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSize, FontWeight } from '../../theme';

interface PriceDisplayProps {
    price: number;
    mrp?: number;
    discountPercentage?: number;
    size?: 'sm' | 'md' | 'lg';
    showDiscount?: boolean;
    style?: ViewStyle;
    currencySymbol?: string;
}

export default function PriceDisplay({
    price,
    mrp,
    discountPercentage,
    size = 'md',
    showDiscount = true,
    style,
    currencySymbol = '₹',
}: PriceDisplayProps) {
    const hasDiscount = mrp && price < mrp;
    const calculatedDiscount = discountPercentage ||
        (hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0);

    return (
        <View style={[styles.container, style]}>
            {/* Selling Price */}
            <Text style={[styles.price, styles[`price_${size}`]]}>
                {currencySymbol}{price.toLocaleString('en-IN')}
            </Text>

            {/* MRP (strikethrough) */}
            {hasDiscount && (
                <Text style={[styles.mrp, styles[`mrp_${size}`]]}>
                    {currencySymbol}{mrp.toLocaleString('en-IN')}
                </Text>
            )}

            {/* Discount Percentage */}
            {hasDiscount && showDiscount && calculatedDiscount > 0 && (
                <Text style={[styles.discount, styles[`discount_${size}`]]}>
                    {calculatedDiscount}% off
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    // Selling Price
    price: {
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginRight: 6,
    },
    price_sm: {
        fontSize: FontSize.lg,
    },
    price_md: {
        fontSize: FontSize.xl,
    },
    price_lg: {
        fontSize: FontSize.xxl,
    },

    // MRP (strikethrough)
    mrp: {
        textDecorationLine: 'line-through',
        color: Colors.text.tertiary,
        marginRight: 6,
    },
    mrp_sm: {
        fontSize: FontSize.sm,
    },
    mrp_md: {
        fontSize: FontSize.md,
    },
    mrp_lg: {
        fontSize: FontSize.lg,
    },

    // Discount
    discount: {
        fontWeight: FontWeight.bold,
        color: Colors.semantic.success,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.round, // Pill shape
        overflow: 'hidden',
    },
    discount_sm: {
        fontSize: FontSize.xs,
    },
    discount_md: {
        fontSize: FontSize.sm - 1,
    },
    discount_lg: {
        fontSize: FontSize.sm,
    },
});
