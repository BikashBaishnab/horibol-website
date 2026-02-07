/**
 * HoribolApp Design System - Colors
 * 
 * Centralized color palette for consistent styling across the app.
 * Import from '@/theme' instead of using hardcoded hex values.
 */

export const Colors = {
    // Primary Brand Colors
    primary: '#FFD700',        // Gold - main brand color
    primaryDark: '#E6C200',    // Dark Gold - instead of Orange
    primaryLight: '#FFF9E1',   // Very pale yellow for subtle backgrounds

    // Accent Colors
    accent: '#007AFF',         // iOS Blue - links, actions

    // Backgrounds
    background: {
        primary: '#F8FAFC',      // Softer main background
        secondary: '#FFFFFF',    // Pure white for cards
        surface: '#ffffff',      // White surfaces
        modal: 'rgba(0,0,0,0.5)', // Modal overlay
        subtle: '#F1F5F9',       // Very subtle dividers or input bgs
    },

    // Text Colors
    text: {
        primary: '#212121',      // Main text
        secondary: '#666666',    // Subtitles, labels
        tertiary: '#878787',     // Muted text
        disabled: '#999999',     // Disabled state
        inverse: '#ffffff',      // Text on dark backgrounds
        placeholder: '#7f8c8d',  // Input placeholders
    },

    // Semantic Colors
    semantic: {
        success: '#388E3C',      // Green - discounts, success
        error: '#d32f2f',        // Red - errors, out of stock
        warning: '#FF9800',      // Orange - warnings
        info: '#007AFF',         // Blue - info, links
    },

    // Border Colors
    border: {
        light: '#f0f0f0',        // Very subtle borders
        default: '#e0e0e0',      // Standard borders
        medium: '#ddd',          // More visible borders
        dark: '#ccc',            // Prominent borders
    },

    // Component-specific
    icon: {
        default: '#687076',
        active: '#FFD700',
        muted: '#999',
    },

    // Tab Bar
    tab: {
        active: '#FFD700',
        inactive: '#687076',
    },
} as const;

export type ColorKeys = keyof typeof Colors;
