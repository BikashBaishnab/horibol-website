/**
 * PaymentMethodCard Component
 * 
 * Simple payment method selection with only two options:
 * 1. Online Payment (opens Razorpay standard checkout)
 * 2. Cash on Delivery (with ₹19 convenience fee)
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
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

export type PaymentMethod = 'ONLINE' | 'COD';

export const COD_CONVENIENCE_FEE = 19;

interface PaymentMethodCardProps {
    selectedMethod: PaymentMethod | null;
    onSelectMethod: (method: PaymentMethod) => void;
    isCodAvailable: boolean;
    codReason?: string;
    totalAmount: number;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
    selectedMethod,
    onSelectMethod,
    isCodAvailable,
    codReason,
    totalAmount,
}) => {
    const [expandedSection, setExpandedSection] = useState<PaymentMethod | null>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (selectedMethod) {
            setExpandedSection(selectedMethod);
        }
    }, [selectedMethod]);

    const handleMethodSelect = (method: PaymentMethod) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // Pulse animation
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        onSelectMethod(method);
        setExpandedSection(method);
    };

    const renderRadioButton = (isSelected: boolean) => (
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected && <View style={styles.radioInner} />}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <MaterialCommunityIcons name="shield-check" size={20} color={Colors.semantic.success} />
                <Text style={styles.headerText}>100% Secure Payments</Text>
            </View>

            {/* Online Payment Section */}
            <Animated.View style={[styles.section, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity
                    style={[
                        styles.sectionHeader,
                        selectedMethod === 'ONLINE' && styles.sectionHeaderSelected,
                    ]}
                    onPress={() => handleMethodSelect('ONLINE')}
                    activeOpacity={0.7}
                >
                    <View style={styles.sectionLeft}>
                        {renderRadioButton(selectedMethod === 'ONLINE')}
                        <View style={[styles.iconContainer, selectedMethod === 'ONLINE' && styles.iconContainerSelected]}>
                            <Ionicons
                                name="card-outline"
                                size={20}
                                color={selectedMethod === 'ONLINE' ? Colors.primary : Colors.text.secondary}
                            />
                        </View>
                        <View style={styles.sectionText}>
                            <Text style={styles.sectionTitle}>Online Payment</Text>
                            <Text style={styles.sectionSubtitle}>
                                UPI, Cards, Net Banking & more
                            </Text>
                        </View>
                    </View>
                    <View style={styles.sectionRight}>
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>Recommended</Text>
                        </View>
                        <Ionicons
                            name={expandedSection === 'ONLINE' ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={Colors.text.tertiary}
                        />
                    </View>
                </TouchableOpacity>
                {expandedSection === 'ONLINE' && selectedMethod === 'ONLINE' && (
                    <View style={styles.expandedContent}>
                        <View style={styles.onlineInfo}>
                            <View style={styles.paymentMethods}>
                                <View style={styles.paymentMethod}>
                                    <Ionicons name="phone-portrait-outline" size={16} color={Colors.text.secondary} />
                                    <Text style={styles.paymentMethodText}>UPI</Text>
                                </View>
                                <View style={styles.paymentMethod}>
                                    <Ionicons name="card-outline" size={16} color={Colors.text.secondary} />
                                    <Text style={styles.paymentMethodText}>Cards</Text>
                                </View>
                                <View style={styles.paymentMethod}>
                                    <Ionicons name="business-outline" size={16} color={Colors.text.secondary} />
                                    <Text style={styles.paymentMethodText}>Net Banking</Text>
                                </View>
                                <View style={styles.paymentMethod}>
                                    <Ionicons name="wallet-outline" size={16} color={Colors.text.secondary} />
                                    <Text style={styles.paymentMethodText}>Wallets</Text>
                                </View>
                            </View>
                            <View style={styles.secureNote}>
                                <Ionicons name="lock-closed" size={14} color={Colors.semantic.success} />
                                <Text style={styles.secureNoteText}>
                                    Secured by Razorpay with bank-grade encryption
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* Cash on Delivery Section */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={[
                        styles.sectionHeader,
                        selectedMethod === 'COD' && styles.sectionHeaderSelected,
                        !isCodAvailable && styles.sectionHeaderDisabled,
                    ]}
                    onPress={() => isCodAvailable && handleMethodSelect('COD')}
                    disabled={!isCodAvailable}
                    activeOpacity={0.7}
                >
                    <View style={styles.sectionLeft}>
                        {renderRadioButton(selectedMethod === 'COD')}
                        <View style={[styles.iconContainer, selectedMethod === 'COD' && styles.iconContainerSelected]}>
                            <Ionicons
                                name="cash-outline"
                                size={20}
                                color={selectedMethod === 'COD' ? Colors.primary : Colors.text.secondary}
                            />
                        </View>
                        <View style={styles.sectionText}>
                            <Text style={[styles.sectionTitle, !isCodAvailable && styles.textDisabled]}>
                                Cash on Delivery
                            </Text>
                            <Text style={[styles.sectionSubtitle, !isCodAvailable && styles.textDisabled]}>
                                {isCodAvailable
                                    ? `Pay when you receive (+₹${COD_CONVENIENCE_FEE} convenience fee)`
                                    : 'Not available'}
                            </Text>
                            {!isCodAvailable && codReason && (
                                <Text style={styles.unavailableText}>{codReason}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.sectionRight}>
                        {isCodAvailable && (
                            <View style={styles.codFeeBadge}>
                                <Text style={styles.codFeeText}>+₹{COD_CONVENIENCE_FEE}</Text>
                            </View>
                        )}
                        <Ionicons
                            name={expandedSection === 'COD' ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={Colors.text.tertiary}
                        />
                    </View>
                </TouchableOpacity>
                {expandedSection === 'COD' && selectedMethod === 'COD' && isCodAvailable && (
                    <View style={styles.expandedContent}>
                        <View style={styles.codInfo}>
                            <View style={styles.codInfoRow}>
                                <Ionicons name="information-circle" size={18} color={Colors.accent} />
                                <Text style={styles.codInfoText}>
                                    Pay ₹{totalAmount + COD_CONVENIENCE_FEE} at the time of delivery
                                </Text>
                            </View>
                            <View style={styles.codBreakdown}>
                                <View style={styles.codRow}>
                                    <Text style={styles.codLabel}>Order Total</Text>
                                    <Text style={styles.codValue}>₹{totalAmount}</Text>
                                </View>
                                <View style={styles.codRow}>
                                    <Text style={styles.codLabel}>COD Convenience Fee</Text>
                                    <Text style={styles.codValue}>₹{COD_CONVENIENCE_FEE}</Text>
                                </View>
                                <View style={styles.codDivider} />
                                <View style={styles.codRow}>
                                    <Text style={styles.codTotalLabel}>Amount Payable</Text>
                                    <Text style={styles.codTotalValue}>₹{totalAmount + COD_CONVENIENCE_FEE}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Trust Badges */}
            <View style={styles.trustSection}>
                <View style={styles.trustBadge}>
                    <Ionicons name="shield-checkmark" size={16} color={Colors.semantic.success} />
                    <Text style={styles.trustText}>Secure</Text>
                </View>
                <View style={styles.trustBadge}>
                    <Ionicons name="lock-closed" size={16} color={Colors.semantic.success} />
                    <Text style={styles.trustText}>Encrypted</Text>
                </View>
                <View style={styles.trustBadge}>
                    <MaterialCommunityIcons name="certificate" size={16} color={Colors.semantic.success} />
                    <Text style={styles.trustText}>PCI DSS</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.semantic.success + '10',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    headerText: {
        marginLeft: Spacing.sm,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.semantic.success,
    },
    section: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        backgroundColor: Colors.background.surface,
    },
    sectionHeaderSelected: {
        backgroundColor: Colors.primary + '08',
    },
    sectionHeaderDisabled: {
        opacity: 0.5,
    },
    sectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.border.medium,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    radioOuterSelected: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    iconContainerSelected: {
        backgroundColor: Colors.primary + '20',
    },
    sectionText: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },
    sectionSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    textDisabled: {
        color: Colors.text.disabled,
    },
    unavailableText: {
        fontSize: FontSize.xs,
        color: Colors.semantic.error,
        marginTop: 4,
    },
    sectionRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    recommendedBadge: {
        backgroundColor: Colors.semantic.success + '15',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    recommendedText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.semantic.success,
    },
    codFeeBadge: {
        backgroundColor: Colors.accent + '15',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    codFeeText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.accent,
    },
    expandedContent: {
        padding: Spacing.lg,
        paddingTop: 0,
        backgroundColor: Colors.primary + '05',
    },
    onlineInfo: {
        gap: Spacing.md,
    },
    paymentMethods: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: Colors.background.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    paymentMethod: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    paymentMethodText: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    secureNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        justifyContent: 'center',
    },
    secureNoteText: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    codInfo: {
        gap: Spacing.md,
    },
    codInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.accent + '10',
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    codInfoText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.text.primary,
    },
    codBreakdown: {
        backgroundColor: Colors.background.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    codRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    codLabel: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    codValue: {
        fontSize: FontSize.sm,
        color: Colors.text.primary,
    },
    codDivider: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginVertical: Spacing.xs,
    },
    codTotalLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    codTotalValue: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    trustSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xl,
        paddingVertical: Spacing.lg,
        backgroundColor: Colors.background.secondary,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    trustText: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
        fontWeight: FontWeight.medium,
    },
});

export default PaymentMethodCard;
