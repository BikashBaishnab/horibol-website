/**
 * Profile Screen
 * 
 * Premium profile design with clean menu sections.
 * Refactored to match top e-commerce apps.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme & Components
import { Button } from '../../components/common';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

// Context & Services
import { useAuth } from '../../context/AuthContext';
import { hasAddresses } from '../../services/address.service';
import { signOut } from '../../services/auth.service';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, loading: authLoading } = useAuth();
    const [loadingAction, setLoadingAction] = useState(false);

    // Smart Address Navigation
    const handleManageAddress = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        setLoadingAction(true);
        const exists = await hasAddresses();
        setLoadingAction(false);

        if (exists) router.push('/address/manage');
        else router.push('/address/add');
    };

    // Protected Route Handler
    const handleProtectedAction = (route: any) => {
        if (!user) {
            router.push('/auth/login');
        } else {
            router.push(route);
        }
    };

    // Guest View
    if (!authLoading && !user) {
        return (
            <View style={[styles.guestContainer, { paddingTop: insets.top + 60 }]}>
                <Image
                    source={require('../../assets/images/horibol_logo.png')}
                    style={styles.guestLogo}
                    resizeMode="contain"
                />
                <Text style={styles.guestTitle}>Welcome to Horibol</Text>
                <Text style={styles.guestSubtitle}>
                    Log in to view your orders, wishlist, and saved addresses.
                </Text>
                <Button
                    title="Login / Sign Up"
                    onPress={() => router.push('/auth/login')}
                    variant="primary"
                    size="lg"
                    fullWidth
                    style={styles.loginButton}
                />
                <Text style={styles.versionTextGuest}>App Version 1.0.0</Text>
            </View>
        );
    }

    // Logged In User
    const displayName = user?.phone?.replace('+91', '') || 'User';
    const displayPhone = user?.phone || '';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.headerTitle}>Account</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {displayName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.profileDetails}>
                        <Text style={styles.userName}>{displayName}</Text>
                        {displayPhone && (
                            <Text style={styles.userPhone}>{displayPhone}</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.editIcon}>
                        <Ionicons name="chevron-forward" size={22} color={Colors.text.tertiary} />
                    </TouchableOpacity>
                </View>

                {/* My Orders Full Width CTA */}
                <TouchableOpacity
                    style={styles.ordersCta}
                    onPress={() => handleProtectedAction('/orders')}
                    activeOpacity={0.7}
                >
                    <View style={styles.ordersCtaLeft}>
                        <View style={styles.ordersIconContainer}>
                            <MaterialCommunityIcons name="package-variant" size={24} color={Colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.ordersCtaTitle}>My Orders</Text>
                            <Text style={styles.ordersCtaSubtitle}>Track, return, or buy again</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color={Colors.text.tertiary} />
                </TouchableOpacity>

                {/* Section: Account Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="map-marker-outline"
                            label="Saved Addresses"
                            onPress={handleManageAddress}
                            loading={loadingAction}
                        />
                        <MenuItem
                            icon="heart-outline"
                            label="My Wishlist"
                            onPress={() => handleProtectedAction('/wishlist')}
                        />
                        <MenuItem
                            icon="bell-outline"
                            label="Notifications"
                            onPress={() => router.push('/notifications')}
                        />
                    </View>
                </View>

                {/* Section: Help & Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>HELP & SUPPORT</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="headset"
                            label="Help Center"
                            onPress={() => { }}
                        />
                        <MenuItem
                            icon="chat-outline"
                            label="Chat with Us"
                            onPress={() => { }}
                        />
                        <MenuItem
                            icon="file-document-outline"
                            label="Terms & Policies"
                            onPress={() => router.push('/legal')}
                        />
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                    <MaterialCommunityIcons name="logout" size={20} color={Colors.semantic.error} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>App Version 1.0.0</Text>
            </ScrollView>
        </View>
    );
}

// Menu Item Component
const MenuItem = ({ icon, label, onPress, loading }: {
    icon: string;
    label: string;
    onPress: () => void;
    loading?: boolean
}) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
        <View style={styles.menuItemLeft}>
            <MaterialCommunityIcons name={icon as any} size={22} color={Colors.text.secondary} />
            <Text style={styles.menuText}>{label}</Text>
        </View>
        {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    // Guest Styles
    guestContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: Spacing.xxxl,
        backgroundColor: Colors.background.surface
    },
    guestLogo: {
        width: 150,
        height: 60,
        marginBottom: Spacing.xl
    },
    guestTitle: {
        fontSize: FontSize.xxxl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.sm
    },
    guestSubtitle: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing.huge,
        lineHeight: 22
    },
    loginButton: {
        borderRadius: BorderRadius.md,
    },
    versionTextGuest: {
        position: 'absolute',
        bottom: 30,
        color: Colors.text.disabled,
        fontSize: FontSize.sm
    },

    // Main Container
    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary
    },

    // Header
    header: {
        backgroundColor: Colors.background.surface,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    headerTitle: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Profile Card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.surface,
        padding: Spacing.lg,
        marginTop: Spacing.md,
        marginHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF2CD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.primary
    },
    profileDetails: {
        flex: 1,
    },
    userName: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    userPhone: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    editIcon: {
        padding: Spacing.xs,
    },

    // Orders CTA
    ordersCta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background.surface,
        padding: Spacing.lg,
        marginTop: Spacing.md,
        marginHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    ordersCtaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ordersIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF8E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    ordersCtaTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },
    ordersCtaSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
        marginTop: 2,
    },

    // Section
    section: {
        marginTop: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.text.tertiary,
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginHorizontal: Spacing.lg,
    },
    menuGroup: {
        backgroundColor: Colors.background.surface,
        marginHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
        overflow: 'hidden',
    },

    // Menu Item
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    menuText: {
        fontSize: FontSize.md,
        color: Colors.text.primary,
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.xl,
        marginHorizontal: Spacing.md,
        backgroundColor: Colors.background.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border.light,
    },
    logoutText: {
        color: Colors.semantic.error,
        fontWeight: FontWeight.semibold,
        fontSize: FontSize.md,
    },
    versionText: {
        textAlign: 'center',
        color: Colors.text.disabled,
        fontSize: FontSize.xs,
        marginTop: Spacing.lg,
        marginBottom: Spacing.xl,
    }
});