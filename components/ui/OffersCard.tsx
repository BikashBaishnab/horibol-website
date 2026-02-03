/**
 * OffersCard Component
 * 
 * Premium display of payment benefits and offers
 * Similar to Flipkart/Myntra offers section
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';

import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Offer {
    id: string;
    icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
    iconFamily: 'ionicons' | 'material-community';
    title: string;
    subtitle: string;
    badge?: string;
    badgeColor?: string;
}

interface OffersCardProps {
    productPrice?: number;
    showEMI?: boolean;
    showPayLater?: boolean;
    showUPI?: boolean;
    showCards?: boolean;
    compact?: boolean;
}

// Static offers data
const PAYMENT_OFFERS: Offer[] = [
    {
        id: 'emi',
        icon: 'calendar-outline',
        iconFamily: 'ionicons',
        title: 'No Cost EMI',
        subtitle: 'Starting from ₹833/month',
        badge: 'POPULAR',
        badgeColor: Colors.semantic.success,
    },
    {
        id: 'paylater',
        icon: 'wallet-outline',
        iconFamily: 'ionicons',
        title: 'Pay Later',
        subtitle: 'Simpl, ZestMoney, LazyPay',
        badge: 'NEW',
        badgeColor: Colors.accent,
    },
    {
        id: 'upi',
        icon: 'qr-code-outline',
        iconFamily: 'ionicons',
        title: 'UPI Payments',
        subtitle: 'GPay, PhonePe, Paytm & more',
    },
    {
        id: 'cards',
        icon: 'card-outline',
        iconFamily: 'ionicons',
        title: 'All Cards Accepted',
        subtitle: 'Visa, Mastercard, RuPay, AMEX',
    },
    {
        id: 'cod',
        icon: 'cash-outline',
        iconFamily: 'ionicons',
        title: 'Cash on Delivery',
        subtitle: 'Available for orders under ₹5,000',
    },
];

export default function OffersCard({
    productPrice = 0,
    showEMI = true,
    showPayLater = true,
    showUPI = true,
    showCards = true,
    compact = false,
}: OffersCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Filter offers based on props
    const filteredOffers = PAYMENT_OFFERS.filter(offer => {
        if (offer.id === 'emi' && !showEMI) return false;
        if (offer.id === 'paylater' && !showPayLater) return false;
        if (offer.id === 'upi' && !showUPI) return false;
        if (offer.id === 'cards' && !showCards) return false;
        return true;
    });

    // Calculate EMI (if product price > ₹3000)
    const emiAmount = productPrice > 3000 ? Math.round(productPrice / 12) : null;
    if (emiAmount) {
        const emiOffer = filteredOffers.find(o => o.id === 'emi');
        if (emiOffer) {
            emiOffer.subtitle = `Starting from ₹${emiAmount}/month`;
        }
    }

    // Show only first 2 offers in compact mode
    const visibleOffers = compact && !expanded
        ? filteredOffers.slice(0, 2)
        : filteredOffers;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const renderIcon = (offer: Offer) => {
        if (offer.iconFamily === 'material-community') {
            return (
                <MaterialCommunityIcons
                    name={offer.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={20}
                    color={Colors.primary}
                />
            );
        }
        return (
            <Ionicons
                name={offer.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={Colors.primary}
            />
        );
    };

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="tag-multiple" size={18} color={Colors.primary} />
                    <Text style={styles.headerTitle}>Available Offers</Text>
                </View>
                <View style={styles.secureBadge}>
                    <Ionicons name="shield-checkmark" size={12} color={Colors.semantic.success} />
                    <Text style={styles.secureText}>Secure</Text>
                </View>
            </View>

            {/* Offers List */}
            <View style={styles.offersList}>
                {visibleOffers.map((offer, index) => (
                    <View
                        key={offer.id}
                        style={[
                            styles.offerItem,
                            index < visibleOffers.length - 1 && styles.offerItemBorder
                        ]}
                    >
                        <View style={styles.offerIconContainer}>
                            {renderIcon(offer)}
                        </View>
                        <View style={styles.offerContent}>
                            <View style={styles.offerTitleRow}>
                                <Text style={styles.offerTitle}>{offer.title}</Text>
                                {offer.badge && (
                                    <View style={[styles.badge, { backgroundColor: offer.badgeColor + '20' }]}>
                                        <Text style={[styles.badgeText, { color: offer.badgeColor }]}>
                                            {offer.badge}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
                    </View>
                ))}
            </View>

            {/* View More Button (compact mode only) */}
            {compact && filteredOffers.length > 2 && (
                <TouchableOpacity
                    style={styles.viewMoreBtn}
                    onPress={toggleExpand}
                    activeOpacity={0.7}
                >
                    <Text style={styles.viewMoreText}>
                        {expanded ? 'Show Less' : `View All ${filteredOffers.length} Offers`}
                    </Text>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={Colors.accent}
                    />
                </TouchableOpacity>
            )}

            {/* Trust Footer */}
            <View style={styles.trustFooter}>
                <LinearGradient
                    colors={[Colors.primary + '10', Colors.primaryDark + '10']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.trustGradient}
                >
                    <View style={styles.trustItem}>
                        <Ionicons name="lock-closed" size={14} color={Colors.text.secondary} />
                        <Text style={styles.trustText}>100% Secure</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <Ionicons name="shield-checkmark" size={14} color={Colors.text.secondary} />
                        <Text style={styles.trustText}>PCI DSS</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <Ionicons name="card" size={14} color={Colors.text.secondary} />
                        <Text style={styles.trustText}>256-bit SSL</Text>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
    containerCompact: {
        padding: Spacing.md,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.semantic.success + '15',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    secureText: {
        fontSize: FontSize.xs,
        color: Colors.semantic.success,
        fontWeight: FontWeight.semibold,
    },

    // Offers List
    offersList: {
        marginBottom: Spacing.sm,
    },
    offerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    offerItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    offerIconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    offerContent: {
        flex: 1,
    },
    offerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    offerTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },
    offerSubtitle: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: FontWeight.bold,
    },

    // View More
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        marginTop: Spacing.xs,
    },
    viewMoreText: {
        fontSize: FontSize.sm,
        color: Colors.accent,
        fontWeight: FontWeight.semibold,
    },

    // Trust Footer
    trustFooter: {
        marginTop: Spacing.sm,
    },
    trustGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trustText: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    trustDivider: {
        width: 1,
        height: 12,
        backgroundColor: Colors.border.default,
        marginHorizontal: Spacing.md,
    },
});
