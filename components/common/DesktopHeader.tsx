import { Feather, Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { BorderRadius, Colors, Dimensions, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

export default function DesktopHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { cartCount } = useCart();

    const navItems = [
        { name: 'Home', path: '/', icon: 'home' },
        { name: 'Cart', path: '/cart', icon: 'cart' },
        { name: 'Profile', path: '/profile', icon: 'person' },
    ];

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/' || pathname === '/(tabs)/';
        return pathname.includes(path);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* Logo */}
                <TouchableOpacity
                    onPress={() => router.push('/')}
                    style={styles.logoContainer}
                >
                    <Text style={styles.logoText}>HORIBOL</Text>
                </TouchableOpacity>

                {/* Search Bar */}
                <TouchableOpacity
                    style={styles.searchContainer}
                    onPress={() => router.push('/search')}
                >
                    <Feather name="search" size={18} color={Colors.text.placeholder} />
                    <Text style={styles.searchPlaceholder}>Search for products, brands and more</Text>
                </TouchableOpacity>

                {/* Nav Items */}
                <View style={styles.navRow}>
                    {navItems.map((item) => (
                        <TouchableOpacity
                            key={item.name}
                            style={styles.navItem}
                            onPress={() => router.push(item.path as any)}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={isActive(item.path) ? (item.icon as any) : (`${item.icon}-outline` as any)}
                                    size={22}
                                    color={isActive(item.path) ? Colors.primaryDark : Colors.text.primary}
                                />
                                {item.name === 'Cart' && cartCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{cartCount}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[
                                styles.navText,
                                isActive(item.path) && styles.activeNavText
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => router.push('/notifications')}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
                            <View style={styles.dot} />
                        </View>
                        <Text style={styles.navText}>Alerts</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
        ...Shadows.md,
        zIndex: 1000,
    },
    content: {
        maxWidth: Dimensions.webMaxWidth,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        paddingHorizontal: Spacing.xl,
    },
    logoContainer: {
        marginRight: Spacing.xl,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.primaryDark,
        letterSpacing: 2,
    },
    searchContainer: {
        flex: 1,
        maxWidth: 500,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.md,
        height: 44,
        marginHorizontal: Spacing.xl,
    },
    searchPlaceholder: {
        marginLeft: Spacing.sm,
        color: Colors.text.placeholder,
        fontSize: FontSize.md,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    navItem: {
        alignItems: 'center',
        minWidth: 60,
    },
    iconContainer: {
        position: 'relative',
        height: 24,
        justifyContent: 'center',
    },
    navText: {
        fontSize: 12,
        marginTop: 4,
        color: Colors.text.primary,
        fontWeight: FontWeight.medium,
    },
    activeNavText: {
        color: Colors.primaryDark,
        fontWeight: FontWeight.bold,
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: Colors.semantic.error,
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.semantic.error,
        borderWidth: 1,
        borderColor: '#fff',
    }
});
