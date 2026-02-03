/**
 * My Orders Screen
 * 
 * Displays user's order history with status and tracking.
 * Premium UI similar to Flipkart/Amazon order listing.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { getStatusColor, getStatusLabel, getUserOrders, OrderListItem } from '../../services/order.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

const FALLBACK_IMAGE = require('../../assets/images/horibol_logo.png');

export default function OrdersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');

    const STATUS_TABS = [
        { key: 'all', label: 'All' },
        { key: 'processing', label: 'Processing' },
        { key: 'shipped', label: 'Shipped' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    useEffect(() => {
        if (user?.id) {
            loadOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadOrders = async () => {
        if (!user?.id) return;
        setLoading(true);
        const data = await getUserOrders(user.id);

        // Group by order_id to avoid duplicates
        const uniqueOrders = data.reduce((acc: OrderListItem[], order) => {
            const exists = acc.find(o => o.order_id === order.order_id && o.item_id === order.item_id);
            if (!exists) {
                acc.push(order);
            }
            return acc;
        }, []);

        setOrders(uniqueOrders);
        setLoading(false);
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    }, [user]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getImageSource = (imageUrl: string | null) => {
        if (imageUrl && imageUrl.trim() !== '') {
            return { uri: imageUrl };
        }
        return FALLBACK_IMAGE;
    };

    // Filter orders by selected tab
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        const status = (order.item_status || order.master_order_status || '').toLowerCase();
        if (activeTab === 'processing') {
            return status.includes('placed') || status.includes('confirmed') || status.includes('processing');
        }
        if (activeTab === 'shipped') {
            return status.includes('shipped') || status.includes('transit') || status.includes('out_for_delivery');
        }
        if (activeTab === 'delivered') {
            return status.includes('delivered');
        }
        if (activeTab === 'cancelled') {
            return status.includes('cancel') || status.includes('returned');
        }
        return true;
    });

    // Render status tabs
    const renderStatusTabs = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
            bounces={true}
        >
            {STATUS_TABS.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.tabButton,
                        activeTab === tab.key && styles.tabButtonActive
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === tab.key && styles.tabTextActive
                    ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    // Render header
    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.headerRight} />
        </View>
    );

    // Render order card
    const renderOrderCard = ({ item, index }: { item: OrderListItem; index: number }) => {
        const rawStatus = item.item_status || item.master_order_status;
        const statusColor = getStatusColor(rawStatus);
        const statusLabel = getStatusLabel(rawStatus);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                <TouchableOpacity
                    style={styles.orderCard}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/orders/${item.order_id}`)}
                >
                    <View style={styles.orderContent}>
                        {/* Product Info */}
                        <View style={styles.productRow}>
                            <Image
                                source={getImageSource(item.product_image_url)}
                                style={styles.productImage}
                                contentFit="contain"
                                transition={200}
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.brandName} numberOfLines={1}>
                                    {item.brand_name || 'Generic'}
                                </Text>
                                <Text style={styles.productName} numberOfLines={2}>
                                    {item.product_name}
                                </Text>
                                <Text style={styles.variantName}>
                                    {item.attributes ?
                                        Object.entries(item.attributes)
                                            .filter(([k]) => k !== 'id')
                                            .map(([_, v]) => String(v))
                                            .join(' | ')
                                        : item.variant_name || 'Standard'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Order Details Grid */}
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>ORDER ID</Text>
                                <Text style={styles.detailValue}>#{item.order_id}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>DATE</Text>
                                <Text style={styles.detailValue}>{formatDate(item.order_date)}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>AMOUNT</Text>
                                <Text style={styles.detailValueBold}>₹{item.total_amount}</Text>
                            </View>
                        </View>

                        {/* Status + Action */}
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                <Text style={[styles.statusText, { color: statusColor }]}>
                                    {statusLabel}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.trackButton}
                                onPress={() => router.push(`/orders/${item.order_id}`)}
                            >
                                <Text style={styles.trackButtonText}>Track Order</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant" size={80} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
                Your order history will appear here once you make a purchase
            </Text>
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/')}
            >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    // Render login prompt
    const renderLoginPrompt = () => (
        <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={80} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Please Login</Text>
            <Text style={styles.emptySubtitle}>
                Login to view your order history
            </Text>
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/auth/login')}
            >
                <Text style={styles.shopButtonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : !user ? (
                renderLoginPrompt()
            ) : (
                <>
                    {renderStatusTabs()}
                    <FlatList
                        data={filteredOrders}
                        keyExtractor={(item) => `${item.order_id}-${item.item_id}`}
                        renderItem={renderOrderCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[Colors.primary]}
                                tintColor={Colors.primary}
                            />
                        }
                    />
                </>
            )}
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
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
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
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    statusBar: {
        height: 4,
        width: '100%',
    },
    orderContent: {
        padding: Spacing.md,
    },
    productRow: {
        flexDirection: 'row',
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.background.secondary,
    },
    productInfo: {
        flex: 1,
        marginLeft: Spacing.md,
        justifyContent: 'center',
    },
    brandName: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.text.tertiary,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
        marginTop: 2,
        lineHeight: 20,
    },
    variantName: {
        fontSize: 13,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginVertical: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.text.tertiary,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 14,
        color: Colors.text.primary,
        marginTop: 2,
    },
    detailValueBold: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text.primary,
        marginTop: 2,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.round,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.xs,
    },
    statusText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trackButtonText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.primary,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
    },
    deliveryText: {
        fontSize: FontSize.sm,
        color: Colors.text.tertiary,
        marginLeft: Spacing.xs,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontSize: FontSize.md,
        color: Colors.text.tertiary,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    shopButton: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },
    shopButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    tabsContainer: {
        backgroundColor: Colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
        height: 56, // Fixed height to prevent stretching
    },
    tabsContent: {
        paddingHorizontal: Spacing.md,
        alignItems: 'center', // Centers tabs vertically
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 16,
        height: 36, // Fixed button height
        borderRadius: 18,
        backgroundColor: Colors.background.secondary,
        borderWidth: 1,
        borderColor: Colors.border.light,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80, // Ensures text is visible
    },
    tabButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text.secondary,
    },
    tabTextActive: {
        color: Colors.text.primary,
        fontWeight: FontWeight.bold,
    },
});