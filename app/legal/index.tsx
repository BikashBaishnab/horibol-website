import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

const LEGAL_LINKS = [
    {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: 'shield-check-outline',
        route: '/privacy-policy',
        description: 'How we handle your data'
    },
    {
        id: 'terms',
        title: 'Terms & Conditions',
        icon: 'file-document-outline',
        route: '/terms-and-conditions',
        description: 'Rules for using our service'
    },
    {
        id: 'refund',
        title: 'Refund & Return Policy',
        icon: 'cash-refund',
        route: '/refund-and-return-policy',
        description: 'Policies on returns and refunds'
    },
    {
        id: 'shipping',
        title: 'Shipping & Delivery',
        icon: 'truck-delivery-outline',
        route: '/shipping-and-delivery-policy',
        description: 'Delivery timelines and charges'
    },
    {
        id: 'cancellation',
        title: 'Cancellation & Replacement',
        icon: 'close-circle-outline',
        route: '/cancellation-and-replacement-policy',
        description: 'Cancelling orders and replacements'
    },
    {
        id: 'contact',
        title: 'Contact Us',
        icon: 'headset',
        url: 'https://www.horibol.com/contact',
        description: 'Get in touch with support'
    }
];

export default function LegalScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handlePress = async (link: typeof LEGAL_LINKS[0]) => {
        if ('route' in link) {
            router.push(link.route as any);
        } else if ('url' in link) {
            try {
                await WebBrowser.openBrowserAsync(link.url, {
                    toolbarColor: Colors.primary,
                    enableBarCollapsing: true,
                    showTitle: true,
                });
            } catch (error) {
                console.error('Error opening legal link:', error);
            }
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal & Policies</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        Legal compliance and transparency are important to us. Here you can find all our official policies.
                    </Text>
                </View>

                <View style={styles.menuGroup}>
                    {LEGAL_LINKS.map((link, index) => (
                        <TouchableOpacity
                            key={link.id}
                            style={[
                                styles.menuItem,
                                index === LEGAL_LINKS.length - 1 && styles.lastItem
                            ]}
                            onPress={() => handlePress(link)}
                            activeOpacity={0.6}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name={link.icon as any} size={22} color={Colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.menuLabel}>{link.title}</Text>
                                    <Text style={styles.menuDescription}>{link.description}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.footerText}>
                    Last updated: February 2026
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    backButton: {
        padding: Spacing.xs,
        marginRight: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.huge,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFBE6', // Light yellow for info
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#FFE58F',
    },
    infoText: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: FontSize.sm,
        color: '#856404',
        lineHeight: 18,
    },
    menuGroup: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF8E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },
    menuDescription: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
        marginTop: 2,
    },
    footerText: {
        textAlign: 'center',
        fontSize: FontSize.xs,
        color: Colors.text.disabled,
        marginTop: Spacing.xl,
    }
});
