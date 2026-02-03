/**
 * Order Detail Screen
 * 
 * Shows complete order details with items, shipping info, and tracking timeline.
 * Premium UI with visual timeline and order breakdown.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getOrderDetail, getStatusColor, getStatusLabel, OrderDetail } from '../../services/order.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

const FALLBACK_IMAGE = require('../../assets/images/horibol_logo.png');

export default function OrderDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id: string }>();
    const orderId = parseInt(params.id || '0', 10);

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (orderId) {
            loadOrderDetail();
        }
    }, [orderId]);

    const loadOrderDetail = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        const data = await getOrderDetail(orderId);
        setOrder(data);
        setLoading(false);
        setRefreshing(false);
    };

    const handleRefresh = () => {
        loadOrderDetail(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };

    const getImageSource = (imageUrl: string | null) => {
        if (imageUrl && imageUrl.trim() !== '') {
            return { uri: imageUrl };
        }
        return FALLBACK_IMAGE;
    };

    // Render header
    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Order Details</Text>
                <Text style={styles.headerSubtitle}>#{orderId}</Text>
            </View>
            <View style={styles.headerRight} />
        </View>
    );

    // Render tracking timeline
    const renderTimeline = () => {
        if (!order?.timeline || order.timeline.length === 0) {
            return (
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Tracking</Text>
                    <View style={styles.noTrackingContainer}>
                        <MaterialCommunityIcons name="truck-outline" size={40} color={Colors.text.tertiary} />
                        <Text style={styles.noTrackingText}>Tracking updates will appear here</Text>
                    </View>
                </Animated.View>
            );
        }

        return (
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Order Tracking</Text>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        disabled={refreshing}
                        style={styles.refreshButton}
                    >
                        {refreshing ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                            <Ionicons name="refresh" size={20} color={Colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Estimated Delivery */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <View style={styles.estimatedDelivery}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color={Colors.accent} />
                        <View style={styles.estimatedDeliveryInfo}>
                            <Text style={styles.estimatedDeliveryLabel}>Estimated Delivery</Text>
                            <Text style={styles.estimatedDeliveryDate}>
                                {formatShortDate(new Date(new Date(order.order_date).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString())}
                            </Text>
                        </View>
                    </View>
                )}

                {/* AWB Info */}
                {order.awb_code && (
                    <View style={styles.awbContainer}>
                        <View style={styles.awbRow}>
                            <MaterialCommunityIcons name="barcode" size={20} color={Colors.text.secondary} />
                            <Text style={styles.awbLabel}>AWB Number:</Text>
                            <Text style={styles.awbValue}>{order.awb_code}</Text>
                        </View>
                        {order.timeline[0]?.courier_name && (
                            <View style={styles.awbRow}>
                                <MaterialCommunityIcons name="truck-delivery" size={20} color={Colors.text.secondary} />
                                <Text style={styles.awbLabel}>Courier:</Text>
                                <Text style={styles.awbValue}>{order.timeline[0].courier_name}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Timeline */}
                <View style={styles.timeline}>
                    {order.timeline.map((event, index) => {
                        const isLast = index === order.timeline.length - 1;
                        const isFirst = index === 0;

                        return (
                            <Animated.View
                                key={event.id}
                                entering={FadeInRight.delay(index * 100).duration(300)}
                                style={styles.timelineItem}
                            >
                                {/* Line */}
                                {!isLast && <View style={styles.timelineLine} />}

                                {/* Dot */}
                                <View style={[
                                    styles.timelineDot,
                                    isFirst && styles.timelineDotActive
                                ]}>
                                    {isFirst && (
                                        <Ionicons name="checkmark" size={12} color={Colors.text.inverse} />
                                    )}
                                </View>

                                {/* Content */}
                                <View style={styles.timelineContent}>
                                    <Text style={[
                                        styles.timelineTitle,
                                        isFirst && styles.timelineTitleActive
                                    ]}>
                                        {event.status_title}
                                    </Text>
                                    {event.status_description && (
                                        <Text style={styles.timelineDesc}>{event.status_description}</Text>
                                    )}
                                    <View style={styles.timelineMeta}>
                                        <Ionicons name="time-outline" size={12} color={Colors.text.tertiary} />
                                        <Text style={styles.timelineDate}>
                                            {formatDate(event.created_at)}
                                        </Text>
                                        {event.location && (
                                            <>
                                                <Text style={styles.timelineSeparator}>•</Text>
                                                <Ionicons name="location-outline" size={12} color={Colors.text.tertiary} />
                                                <Text style={styles.timelineLocation}>{event.location}</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>
            </Animated.View>
        );
    };

    // Render order items
    const renderOrderItems = () => (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items ({order?.items.length || 0})</Text>

            {order?.items.map((item, index) => {
                const isDelivered = item.status === 'delivered';
                const isReturnable = isDelivered && item.delivery_date && (
                    (Date.now() - new Date(item.delivery_date).getTime()) / (1000 * 60 * 60 * 24) <= 7
                );
                const isReturnRequested = item.status === 'return_requested';
                const isReturned = item.status === 'returned';

                return (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.itemCard}
                        onPress={() => router.push(`/product/${item.product_id}`)}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={getImageSource(item.product_image_url)}
                            style={styles.itemImage}
                            contentFit="contain"
                            transition={200}
                        />
                        <View style={styles.itemInfo}>
                            {item.brand_name && (
                                <Text style={styles.itemBrand}>{item.brand_name}</Text>
                            )}
                            <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                            {item.attributes ? (
                                <Text style={styles.itemVariant}>
                                    {Object.entries(item.attributes)
                                        .filter(([key]) => key !== 'id')
                                        .map(([_, val]) => String(val))
                                        .join(' | ')}
                                </Text>
                            ) : item.variant_name ? (
                                <Text style={styles.itemVariant}>{item.variant_name}</Text>
                            ) : null}

                            <View style={styles.itemPriceRow}>
                                <Text style={styles.itemPrice}>₹{item.price_at_purchase}</Text>
                                <Text style={styles.itemQty}>× {item.quantity}</Text>
                                <Text style={styles.itemTotal}>₹{item.total_item_price}</Text>
                            </View>

                            {/* Item Status */}
                            <View style={[
                                styles.itemStatusBadge,
                                { backgroundColor: `${getStatusColor(item.status)}20` }
                            ]}>
                                <View style={[
                                    styles.itemStatusDot,
                                    { backgroundColor: getStatusColor(item.status) }
                                ]} />
                                <Text style={[
                                    styles.itemStatusText,
                                    { color: getStatusColor(item.status) }
                                ]}>
                                    {getStatusLabel(item.status)}
                                </Text>
                            </View>

                            {/* Return & Review Buttons */}
                            {isDelivered && (
                                <View style={styles.actionButtonsRow}>
                                    {isReturnable && (
                                        <TouchableOpacity
                                            style={styles.returnButton}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                router.push({
                                                    pathname: '/orders/return-request',
                                                    params: { itemId: item.id.toString() }
                                                });
                                            }}
                                        >
                                            <Text style={styles.returnButtonText}>Return</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={styles.reviewButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            router.push({
                                                pathname: '/write-review',
                                                params: {
                                                    productId: item.product_id.toString(),
                                                    productName: item.product_name
                                                }
                                            });
                                        }}
                                    >
                                        <Text style={styles.reviewButtonText}>Write Review</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Return Status Message */}
                            {isReturnRequested && (
                                <Text style={styles.returnStatusText}>Return Requested</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </Animated.View>
    );

    // Render shipping address
    const renderShippingAddress = () => {
        if (!order?.shipping_address_snapshot) return null;

        const address = order.shipping_address_snapshot;
        return (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <View style={styles.addressCard}>
                    <View style={styles.addressIcon}>
                        <Ionicons name="location" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.addressContent}>
                        <Text style={styles.addressName}>{address.name}</Text>
                        <Text style={styles.addressPhone}>{address.phone}</Text>
                        <Text style={styles.addressLine}>
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                        </Text>
                        <Text style={styles.addressLine}>
                            {address.city}, {address.state} - {address.pincode}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        );
    };

    // Render order summary
    const renderOrderSummary = () => (
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Order Date</Text>
                    <Text style={styles.summaryValue}>{order ? formatDate(order.order_date) : '-'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Payment Method</Text>
                    <Text style={styles.summaryValue}>
                        {order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Payment Status</Text>
                    <Text style={[
                        styles.summaryValue,
                        { color: order?.payment_status === 'paid' ? Colors.semantic.success : Colors.semantic.warning }
                    ]}>
                        {order?.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₹{(order?.total_amount || 0) - (order?.shipping_fee || 0)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping</Text>
                    <Text style={styles.summaryValue}>
                        {order?.shipping_fee === 0 ? 'FREE' : `₹${order?.shipping_fee}`}
                    </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{order?.total_amount || 0}</Text>
                </View>
            </View>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading order details...</Text>
                </View>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                {renderHeader()}
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={64} color={Colors.text.tertiary} />
                    <Text style={styles.errorTitle}>Order Not Found</Text>
                    <Text style={styles.errorSubtitle}>We couldn't find this order</Text>
                    <TouchableOpacity style={styles.backToOrdersButton} onPress={() => router.back()}>
                        <Text style={styles.backToOrdersText}>Back to Orders</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Order Status Banner */}
                <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={[styles.statusBanner, { backgroundColor: getStatusColor(order.status) }]}
                >
                    <MaterialCommunityIcons name="package-variant-closed" size={24} color={Colors.text.inverse} />
                    <View style={styles.statusBannerContent}>
                        <Text style={styles.statusBannerTitle}>{getStatusLabel(order.status)}</Text>
                        <Text style={styles.statusBannerSubtitle}>Order placed on {formatShortDate(order.order_date)}</Text>
                    </View>
                </Animated.View>

                {renderTimeline()}
                {renderOrderItems()}
                {renderShippingAddress()}
                {renderOrderSummary()}

                {/* Reorder Button */}
                <TouchableOpacity style={styles.reorderButton}>
                    <MaterialCommunityIcons name="refresh" size={20} color={Colors.text.primary} />
                    <Text style={styles.reorderButtonText}>Reorder</Text>
                </TouchableOpacity>

                {/* Need Help */}
                <TouchableOpacity style={styles.helpButton}>
                    <Ionicons name="help-circle-outline" size={20} color={Colors.text.secondary} />
                    <Text style={styles.helpButtonText}>Need help with this order?</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    backButton: {
        padding: Spacing.sm,
        marginLeft: -Spacing.sm,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    headerSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
    },
    headerRight: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginTop: Spacing.md,
    },
    errorSubtitle: {
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
        marginTop: Spacing.xs,
    },
    backToOrdersButton: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },
    backToOrdersText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    // Status Banner
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    statusBannerContent: {
        marginLeft: Spacing.md,
    },
    statusBannerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.inverse,
    },
    statusBannerSubtitle: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    // Section
    section: {
        marginTop: Spacing.lg,
        marginHorizontal: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    refreshButton: {
        padding: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: `${Colors.primary}15`,
    },
    estimatedDelivery: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E7',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: '#FFE4B5',
    },
    estimatedDeliveryInfo: {
        marginLeft: Spacing.sm,
    },
    estimatedDeliveryLabel: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    estimatedDeliveryDate: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.accent,
    },
    // Timeline
    noTrackingContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
    },
    noTrackingText: {
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
        marginTop: Spacing.sm,
    },
    awbContainer: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    awbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    awbLabel: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginLeft: Spacing.sm,
    },
    awbValue: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
        marginLeft: Spacing.xs,
    },
    timeline: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    timelineItem: {
        flexDirection: 'row',
        paddingLeft: Spacing.xs,
        paddingBottom: Spacing.md,
    },
    timelineLine: {
        position: 'absolute',
        left: Spacing.xs + 8,
        top: 24,
        bottom: 0,
        width: 2,
        backgroundColor: Colors.border.light,
    },
    timelineDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.border.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    timelineDotActive: {
        backgroundColor: Colors.semantic.success,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.text.secondary,
    },
    timelineTitleActive: {
        color: Colors.text.primary,
        fontWeight: FontWeight.semibold,
    },
    timelineDesc: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
        marginTop: 2,
    },
    timelineMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    timelineDate: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
        marginLeft: 4,
    },
    timelineSeparator: {
        marginHorizontal: Spacing.xs,
        color: Colors.text.tertiary,
    },
    timelineLocation: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
        marginLeft: 4,
    },
    // Order Items
    itemCard: {
        flexDirection: 'row',
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.background.secondary,
    },
    itemInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    itemBrand: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.text.tertiary,
        textTransform: 'uppercase',
    },
    itemName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.text.primary,
        marginTop: 2,
    },
    itemVariant: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    itemPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    itemPrice: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    itemQty: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
        marginHorizontal: Spacing.xs,
    },
    itemTotal: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    itemStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 2,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.round,
        marginTop: Spacing.xs,
    },
    itemStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    itemStatusText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
    },
    // Address
    addressCard: {
        flexDirection: 'row',
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    addressIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${Colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressContent: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    addressName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
    },
    addressPhone: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    addressLine: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    // Summary
    summaryCard: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    summaryLabel: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
    },
    summaryValue: {
        fontSize: FontSize.md,
        color: Colors.text.primary,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginVertical: Spacing.sm,
    },
    totalLabel: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    totalValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    // Buttons
    reorderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        marginHorizontal: Spacing.md,
        marginTop: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    reorderButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginLeft: Spacing.xs,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        paddingVertical: Spacing.md,
    },
    helpButtonText: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        marginLeft: Spacing.xs,
    },
    returnButton: {
        marginTop: Spacing.sm,
        paddingVertical: 6,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.border.dark,
        alignSelf: 'flex-start',
    },
    returnButtonText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
        color: Colors.text.primary,
    },
    returnStatusText: {
        fontSize: FontSize.xs,
        color: Colors.semantic.warning,
        marginTop: Spacing.xs,
        fontWeight: FontWeight.medium,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginTop: Spacing.sm,
    },
    reviewButton: {
        paddingVertical: 6,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: `${Colors.primary}10`,
        alignSelf: 'flex-start',
    },
    reviewButtonText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
        color: Colors.primary,
    },
});
