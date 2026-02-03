/**
 * Button Component
 * 
 * Reusable button with multiple variants.
 * Uses centralized theme for consistent styling.
 */

import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Spacing, TextStyles } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    leftIcon,
    rightIcon,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.base,
                styles[variant],
                styles[`size_${size}`],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' ? Colors.text.primary : Colors.primary}
                />
            ) : (
                <>
                    {leftIcon}
                    <Text
                        style={[
                            styles.text,
                            styles[`text_${variant}`],
                            styles[`textSize_${size}`],
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {rightIcon}
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },

    // Variants
    primary: {
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    secondary: {
        backgroundColor: Colors.background.surface,
        borderWidth: 1,
        borderColor: Colors.border.medium,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },

    // Sizes
    size_sm: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        minHeight: 32,
    },
    size_md: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        minHeight: 44,
    },
    size_lg: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        minHeight: 52,
    },

    // States
    disabled: {
        backgroundColor: Colors.border.dark,
        borderColor: Colors.border.dark,
        opacity: 0.6,
    },
    fullWidth: {
        width: '100%',
    },

    // Text base
    text: {
        ...TextStyles.button,
        textAlign: 'center',
    },

    // Text variants
    text_primary: {
        color: Colors.text.primary,
    },
    text_secondary: {
        color: Colors.text.primary,
    },
    text_outline: {
        color: Colors.primary,
    },
    text_ghost: {
        color: Colors.primary,
    },

    // Text sizes
    textSize_sm: {
        fontSize: 12,
    },
    textSize_md: {
        fontSize: 14,
    },
    textSize_lg: {
        fontSize: 16,
    },
});
