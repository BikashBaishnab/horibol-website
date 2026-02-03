/**
 * Order Confirmation Screen
 * 
 * Premium success screen with animation after order placement.
 * Shows order details, next steps, and navigation options.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

const { width } = Dimensions.get('window');

export default function OrderConfirmationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const orderId = params.orderId as string;
    const paymentMethod = params.paymentMethod as string;
    const amount = params.amount as string;

    // Animations
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const confettiOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Success animation sequence
        Animated.sequence([
            // Pop in the checkmark
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 100,
                useNativeDriver: true,
            }),
            // Checkmark tick animation
            Animated.timing(checkmarkScale, {
                toValue: 1,
                duration: 300,
                easing: Easing.elastic(1.5),
                useNativeDriver: true,
            }),
        ]).start();

        // Fade in content
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: 400,
                useNativeDriver: true,
            }),
            // Confetti sparkle
            Animated.sequence([
                Animated.delay(300),
                Animated.timing(confettiOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.delay(1000),
                Animated.timing(confettiOpacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const formatDate = () => {
        const today = new Date();
        const deliveryDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
        return deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Confetti decoration */}
            <Animated.View style={[styles.confettiContainer, { opacity: confettiOpacity }]}>
                {[...Array(12)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.confettiDot,
                            {
                                left: `${10 + (i * 7)}%`,
                                top: `${15 + (i % 3) * 10}%`,
                                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7'][i % 4],
                                transform: [{ rotate: `${i * 30}deg` }]
                            }
                        ]}
                    />
                ))}
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Animation */}
                <Animated.View
                    style={[
                        styles.successCircle,
                        { transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    <LinearGradient
                        colors={[Colors.semantic.success, '#27ae60']}
                        style={styles.successGradient}
                    >
                        <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
                            <Ionicons name="checkmark" size={64} color="#fff" />
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>

                {/* Main Content */}
                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.successTitle}>Order Placed!</Text>
                    <Text style={styles.successSubtitle}>
                        Thank you for shopping with us
                    </Text>

                    {/* Order Info Card */}
                    <View style={styles.orderCard}>
                        <View style={styles.orderIdRow}>
                            <Text style={styles.orderIdLabel}>Order ID</Text>
                            <Text style={styles.orderIdValue}>#{orderId || '—'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderDetailRow}>
                            <View style={styles.orderDetailItem}>
                                <MaterialCommunityIcons
                                    name={paymentMethod === 'COD' ? 'cash' : 'credit-card-check-outline'}
                                    size={24}
                                    color={Colors.primary}
                                />
                                <Text style={styles.detailLabel}>Payment</Text>
                                <Text style={styles.detailValue}>
                                    {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                                </Text>
                            </View>

                            <View style={styles.detailDivider} />

                            <View style={styles.orderDetailItem}>
                                <MaterialCommunityIcons
                                    name="currency-inr"
                                    size={24}
                                    color={Colors.primary}
                                />
                                <Text style={styles.detailLabel}>Amount</Text>
                                <Text style={styles.detailValue}>₹{amount || '—'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Delivery Info */}
                    <View style={styles.deliveryCard}>
                        <View style={styles.deliveryIcon}>
                            <MaterialCommunityIcons name="truck-fast-outline" size={28} color={Colors.accent} />
                        </View>
                        <View style={styles.deliveryInfo}>
                            <Text style={styles.deliveryTitle}>Estimated Delivery</Text>
                            <Text style={styles.deliveryDate}>{formatDate()}</Text>
                        </View>
                    </View>

                    {/* Next Steps */}
                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>What's Next?</Text>

                        <View style={styles.stepItem}>
                            <View style={styles.stepIcon}>
                                <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                            </View>
                            <Text style={styles.stepText}>
                                You'll receive order updates via email & SMS
                            </Text>
                        </View>

                        <View style={styles.stepItem}>
                            <View style={styles.stepIcon}>
                                <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
                            </View>
                            <Text style={styles.stepText}>
                                Track your order status in 'My Orders'
                            </Text>
                        </View>

                        {paymentMethod === 'COD' && (
                            <View style={styles.stepItem}>
                                <View style={styles.stepIcon}>
                                    <MaterialCommunityIcons name="cash" size={18} color={Colors.primary} />
                                </View>
                                <Text style={styles.stepText}>
                                    Keep ₹{amount} ready for cash payment
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => router.replace(`/orders/${orderId}`)}
                >
                    <MaterialCommunityIcons name="package-variant" size={20} color={Colors.primary} />
                    <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => router.replace('/(tabs)')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.continueGradient}
                    >
                        <Text style={styles.continueButtonText}>Continue Shopping</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl,
    },

    // Confetti
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        pointerEvents: 'none',
    },
    confettiDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    // Success Circle
    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: Spacing.xl,
        ...Shadows.lg,
    },
    successGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Content
    contentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    successSubtitle: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        marginBottom: Spacing.xl,
    },

    // Order Card
    orderCard: {
        width: '100%',
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
        marginBottom: Spacing.md,
    },
    orderIdRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    orderIdLabel: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    orderIdValue: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginBottom: Spacing.md,
    },
    orderDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderDetailItem: {
        flex: 1,
        alignItems: 'center',
    },
    detailDivider: {
        width: 1,
        height: 50,
        backgroundColor: Colors.border.light,
    },
    detailLabel: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
        marginTop: Spacing.xs,
    },
    detailValue: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
        marginTop: 2,
    },

    // Delivery Card
    deliveryCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    deliveryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    deliveryInfo: {
        flex: 1,
    },
    deliveryTitle: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    deliveryDate: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.accent,
    },

    // Steps
    stepsContainer: {
        width: '100%',
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
    stepsTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${Colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    stepText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        lineHeight: 20,
    },

    // Bottom Actions
    bottomActions: {
        flexDirection: 'row',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        backgroundColor: Colors.background.surface,
        ...Shadows.lg,
    },
    trackButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    trackButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.primary,
    },
    continueButton: {
        flex: 1.5,
    },
    continueGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    continueButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: '#fff',
    },
});
