/**
 * HoribolApp Design System - Typography
 * 
 * Consistent text styles across the app.
 * Use these presets instead of hardcoding font sizes.
 */

import { Platform, TextStyle } from 'react-native';

// Font Families
export const FontFamily = Platform.select({
    ios: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    android: {
        regular: 'Roboto',
        medium: 'Roboto-Medium',
        bold: 'Roboto-Bold',
    },
    default: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
});

// Font Sizes
export const FontSize = {
    xs: 10,      // Small labels, badges
    sm: 12,      // Secondary text, captions
    md: 14,      // Body text
    lg: 16,      // Large body, buttons
    xl: 18,      // Section titles
    xxl: 20,     // Page headers
    xxxl: 24,    // Large headers
} as const;

// Line Heights
export const LineHeight = {
    tight: 16,
    normal: 20,
    relaxed: 22,
    loose: 24,
} as const;

// Font Weights
export const FontWeight = {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extraBold: '800' as TextStyle['fontWeight'],
} as const;

// Pre-built Text Styles
export const TextStyles = {
    // Headers
    h1: {
        fontSize: FontSize.xxxl,
        fontWeight: FontWeight.bold,
        lineHeight: LineHeight.loose,
    } as TextStyle,

    h2: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        lineHeight: LineHeight.relaxed,
    } as TextStyle,

    h3: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        lineHeight: LineHeight.relaxed,
    } as TextStyle,

    // Body
    body: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.regular,
        lineHeight: LineHeight.normal,
    } as TextStyle,

    bodyLarge: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.regular,
        lineHeight: LineHeight.relaxed,
    } as TextStyle,

    // Labels & Captions
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        lineHeight: LineHeight.tight,
    } as TextStyle,

    caption: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.regular,
        lineHeight: LineHeight.tight,
    } as TextStyle,

    // Buttons
    button: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        lineHeight: LineHeight.normal,
    } as TextStyle,

    buttonSmall: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        lineHeight: LineHeight.tight,
    } as TextStyle,

    // Price Display
    price: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    } as TextStyle,

    priceLarge: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
    } as TextStyle,

    mrp: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.regular,
        textDecorationLine: 'line-through',
    } as TextStyle,

    discount: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    } as TextStyle,
} as const;
