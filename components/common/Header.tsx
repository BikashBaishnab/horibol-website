/**
 * Header Component
 * 
 * Reusable header with search and navigation.
 */

import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../theme';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    showSearch?: boolean;
    showCart?: boolean;
    cartCount?: number;
    backgroundColor?: string;
    style?: ViewStyle;
    onSearchPress?: () => void;
}

export default function Header({
    title,
    showBack = false,
    showSearch = false,
    showCart = false,
    cartCount = 0,
    backgroundColor = Colors.background.surface,
    style,
    onSearchPress,
}: HeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleSearchPress = () => {
        if (onSearchPress) {
            onSearchPress();
        } else {
            router.push('/search');
        }
    };

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top + Spacing.sm, backgroundColor },
                style
            ]}
        >
            <View style={styles.row}>
                {/* Back Button */}
                {showBack && (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.iconButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                )}

                {/* Title or Search */}
                {title && !showSearch ? (
                    <Text style={styles.title}>{title}</Text>
                ) : showSearch ? (
                    <TouchableOpacity
                        style={styles.searchContainer}
                        onPress={handleSearchPress}
                        activeOpacity={0.9}
                    >
                        <Feather
                            name="search"
                            size={18}
                            color={Colors.text.placeholder}
                            style={styles.searchIcon}
                        />
                        <Text style={styles.searchText}>Search for products...</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.spacer} />
                )}

                {/* Cart Button */}
                {showCart && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/(tabs)/cart')}
                    >
                        <Ionicons name="cart-outline" size={24} color={Colors.text.primary} />
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {cartCount > 99 ? '99+' : cartCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
        ...Shadows.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: Spacing.sm,
        position: 'relative',
    },
    title: {
        flex: 1,
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginLeft: Spacing.sm,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.md,
        height: 40,
        marginHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchText: {
        color: Colors.text.placeholder,
        fontSize: FontSize.md,
    },
    spacer: {
        flex: 1,
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
        fontWeight: 'bold',
    },
});
