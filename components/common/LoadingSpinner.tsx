/**
 * LoadingSpinner Component
 * 
 * Consistent loading indicator with theme colors.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize, Spacing } from '../../theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    message?: string;
    fullScreen?: boolean;
    style?: ViewStyle;
}

export default function LoadingSpinner({
    size = 'large',
    color = Colors.primary,
    message,
    fullScreen = false,
    style,
}: LoadingSpinnerProps) {
    const content = (
        <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );

    return content;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    message: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
});
