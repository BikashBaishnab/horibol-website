/**
 * HoribolApp Design System - Spacing
 * 
 * Consistent spacing scale based on 4px base unit.
 * Use these values for margins, padding, and gaps.
 */

export const Spacing = {
    /** 4px - Minimal spacing */
    xs: 4,
    /** 8px - Tight spacing */
    sm: 8,
    /** 12px - Standard spacing */
    md: 12,
    /** 16px - Comfortable spacing */
    lg: 16,
    /** 20px - Generous spacing */
    xl: 20,
    /** 24px - Section spacing */
    xxl: 24,
    /** 32px - Large section spacing */
    xxxl: 32,
    /** 40px - Extra large spacing */
    huge: 40,
} as const;

// Border Radii
export const BorderRadius = {
    /** 4px - Subtle rounding */
    xs: 4,
    /** 6px - Small rounding */
    sm: 6,
    /** 8px - Standard cards/buttons */
    md: 8,
    /** 12px - Larger cards */
    lg: 12,
    /** 16px - Modal corners */
    xl: 16,
    /** 25px - Pill buttons/avatars */
    round: 25,
    /** 50% - Circular elements */
    full: 9999,
} as const;

// Shadow/Elevation presets
export const Shadows = {
    none: {
        elevation: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    sm: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    md: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    lg: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    xl: {
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
} as const;

// Common component dimensions
export const Dimensions = {
    // Button heights
    buttonHeight: {
        sm: 32,
        md: 40,
        lg: 48,
    },
    // Input heights
    inputHeight: 40,
    // Tab bar
    tabBarHeight: 60,
    // Header
    headerHeight: 56,
    // Thumbnail sizes
    thumbnail: {
        xs: 40,
        sm: 48,
        md: 60,
        lg: 80,
    },
    // Avatar sizes
    avatar: {
        sm: 32,
        md: 50,
        lg: 80,
    },
    /** Max width for content on web platform */
    webMaxWidth: 768,
} as const;
