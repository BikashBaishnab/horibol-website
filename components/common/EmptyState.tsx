/**
 * EmptyState Component
 * 
 * Reusable empty state for Cart, Wishlist, Orders etc.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../../theme';
import Button from './Button';

type IconName = keyof typeof Ionicons.glyphMap;

interface EmptyStateProps {
    icon?: IconName;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export default function EmptyState({
    icon = 'cube-outline',
    title,
    subtitle,
    actionLabel,
    onAction,
    style,
}: EmptyStateProps) {
    return (
        <View style={[styles.container, style]}>
            <Ionicons
                name={icon}
                size={80}
                color={Colors.border.dark}
                style={styles.icon}
            />
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    size="md"
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxxl,
        backgroundColor: Colors.background.surface,
    },
    icon: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    button: {
        marginTop: Spacing.md,
        minWidth: 200,
        borderRadius: BorderRadius.round,
    },
});
