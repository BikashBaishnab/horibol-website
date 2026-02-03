/**
 * Cart Screen
 * 
 * Shopping cart with items, quantity management, and checkout.
 * Refactored to use centralized theme, services, and components.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Theme & Components
import { Button, EmptyState, LoadingSpinner, PriceDisplay } from '../../components/common';
import AddressBottomSheet from '../../components/ui/AddressBottomSheet';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

// Context & Services
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getDefaultAddress } from '../../services/address.service';
import {
    getCartItems,
    updateCartQuantity
} from '../../services/cart.service';
import { checkServiceability } from '../../services/shipping.service';
import type { Address, CartItem } from '../../types';

export default function CartScreen() {
    const router = useRouter();
    const { refreshCartCount, removeFromCart } = useCart();
    const { user, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [address, setAddress] = useState<Address | null>(null);
    const [isAddressSheetVisible, setAddressSheetVisible] = useState(false);
    const [deliveryDates, setDeliveryDates] = useState<{ [key: number]: string }>({});

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchData();
            } else {
                setLoading(false);
            }
        }, [user])
    );

    useEffect(() => {
        if (address?.pincode && cartItems.length > 0) {
            calculateDeliveryDates();
        }
    }, [address, cartItems.length]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [items, defAddr] = await Promise.all([
                getCartItems(),
                getDefaultAddress()
            ]);
            const validatedItems = await validateStock(items || []);
            setCartItems(validatedItems);
            setAddress(defAddr);
            refreshCartCount();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const validateStock = async (items: CartItem[]) => {
        const updatedItems = [...items];
        let changed = false;
        for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];
            const stock = item.stock || 0;
            if (item.quantity > stock && stock > 0) {
                await updateCartQuantity(item.cart_id, stock);
                updatedItems[i].quantity = stock;
                changed = true;
            }
        }
        if (changed) refreshCartCount();
        return updatedItems;
    };

    const calculateDeliveryDates = async () => {
        if (!address?.pincode) return;
        const dates: { [key: number]: string } = {};
        await Promise.all(cartItems.map(async (item) => {
            if ((item.stock || 0) === 0) return;
            const weight = item.weight_kg || 0.5;
            const length = item.length_cm || 10;
            const breadth = item.breadth_cm || 10;
            const height = item.height_cm || 10;
            try {
                const data = await checkServiceability(
                    parseInt(address.pincode),
                    weight,
                    length,
                    breadth,
                    height
                );
                if (data && data.serviceable) {
                    dates[item.cart_id] = data.display_date || 'Check date';
                } else {
                    dates[item.cart_id] = "Not Deliverable";
                }
            } catch (e) {
                dates[item.cart_id] = "Check Pincode";
            }
        }));
        setDeliveryDates(dates);
    };

    const handleAddressSelect = (selectedAddr: Address) => {
        setAddress(selectedAddr);
        setAddressSheetVisible(false);
    };

    const handleQuantity = async (id: number, currentQty: number, change: number, stock: number) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;
        if (newQty > stock) {
            Alert.alert("Limit Reached", `Only ${stock} units available in stock.`);
            return;
        }
        setCartItems(prev => prev.map(item =>
            item.cart_id === id ? { ...item, quantity: newQty } : item
        ));
        try {
            await updateCartQuantity(id, newQty);
            refreshCartCount();
        } catch (e) {
            fetchData();
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert("Remove Item", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove", style: "destructive", onPress: async () => {
                    const item = cartItems.find(i => i.cart_id === id);
                    if (item) {
                        await removeFromCart(id, item.product_id);
                        fetchData();
                    }
                }
            }
        ]);
    };

    // Guest User View
    if (!authLoading && !user) {
        return (
            <SafeAreaView style={styles.container}>
                <EmptyState
                    icon="cart-outline"
                    title="Your Cart is Empty"
                    subtitle="Log in to see items you may have added previously."
                    actionLabel="Login Now"
                    onAction={() => router.push('/auth/login')}
                />
            </SafeAreaView>
        );
    }

    // Calculate totals
    const validItems = cartItems.filter(item => (item.stock || 0) > 0);
    const totalMRP = validItems.reduce((sum, item) => sum + (item.unit_mrp * item.quantity), 0);
    const totalSellingPrice = validItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const totalDiscount = totalMRP - totalSellingPrice;
    const deliveryFee = 0;
    const finalAmount = totalSellingPrice + deliveryFee;
    const hasOOSItems = cartItems.some(item => (item.stock || 0) === 0);

    if (loading && cartItems.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart</Text>
            </View>

            {/* Address Strip */}
            <TouchableOpacity style={styles.addressStrip} onPress={() => setAddressSheetVisible(true)}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.deliverToLabel}>Deliver to:</Text>
                    {address ? (
                        <View>
                            <Text style={styles.addressName}>{address.name}, {address.pincode}</Text>
                            <Text style={styles.addressText} numberOfLines={1}>{address.address_line1}, {address.city}</Text>
                        </View>
                    ) : (
                        <Text style={styles.addAddressText}>+ Add Delivery Address</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.changeBtn} onPress={() => setAddressSheetVisible(true)}>
                    <Text style={styles.changeBtnText}>CHANGE</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {cartItems.length === 0 ? (
                <EmptyState
                    icon="cart-outline"
                    title="Your cart is empty!"
                    actionLabel="Shop Now"
                    onAction={() => router.push('/(tabs)')}
                />
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.cart_id.toString()}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item }) => {
                            const stock = item.stock || 0;
                            const isOOS = stock === 0;

                            return (
                                <View style={[styles.cartItem, isOOS && { opacity: 0.6 }]}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.itemImage}
                                        contentFit="contain"
                                        cachePolicy="disk"
                                        transition={300}
                                    />
                                    <View style={styles.itemInfo}>
                                        {item.brand_name && (
                                            <Text style={styles.brandName}>{item.brand_name}</Text>
                                        )}
                                        <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                                        {item.attributes ? (
                                            <Text style={styles.variantText}>
                                                {Object.entries(item.attributes)
                                                    .filter(([key]) => key !== 'id' && key !== 'variant_name')
                                                    .map(([_, val]) => String(val))
                                                    .join(' | ')}
                                            </Text>
                                        ) : null}

                                        <PriceDisplay
                                            price={item.unit_price}
                                            mrp={item.unit_mrp}
                                            discountPercentage={item.discount_percentage}
                                            size="sm"
                                            style={styles.priceRow}
                                        />
                                        {isOOS ? (
                                            <Text style={styles.oosText}>Currently Out of Stock</Text>
                                        ) : (
                                            <Text style={styles.eddText}>
                                                {address
                                                    ? (deliveryDates[item.cart_id]
                                                        ? `Get it by ${deliveryDates[item.cart_id]}`
                                                        : 'Checking delivery date...')
                                                    : 'Add address to check delivery date'}
                                            </Text>
                                        )}
                                        <View style={styles.actionsRow}>
                                            <View style={styles.qtyContainer}>
                                                <TouchableOpacity
                                                    style={[styles.qtyBtn, isOOS && { borderColor: Colors.border.light }]}
                                                    disabled={isOOS}
                                                    onPress={() => handleQuantity(item.cart_id, item.quantity, -1, stock)}
                                                >
                                                    <Text style={[styles.qtyBtnText, isOOS && { color: Colors.border.dark }]}>-</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                                <TouchableOpacity
                                                    style={[styles.qtyBtn, isOOS && { borderColor: Colors.border.light }]}
                                                    disabled={isOOS || item.quantity >= stock}
                                                    onPress={() => handleQuantity(item.cart_id, item.quantity, 1, stock)}
                                                >
                                                    <Text style={[styles.qtyBtnText, (isOOS || item.quantity >= stock) && { color: Colors.border.dark }]}>+</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.cart_id)}>
                                                <Ionicons name="trash-outline" size={20} color={Colors.text.secondary} />
                                                <Text style={styles.deleteText}>Remove</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                        ListFooterComponent={() => (
                            <View style={styles.billDetails}>
                                <Text style={styles.billTitle}>Price Details</Text>
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Price ({validItems.length} items)</Text>
                                    <Text style={styles.billValue}>₹{totalMRP}</Text>
                                </View>
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Discount</Text>
                                    <Text style={[styles.billValue, { color: Colors.semantic.success }]}>-₹{totalDiscount}</Text>
                                </View>
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Delivery Charges</Text>
                                    <Text style={[styles.billValue, { color: Colors.semantic.success }]}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
                                </View>
                                <View style={[styles.billRow, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Total Amount</Text>
                                    <Text style={styles.totalValue}>₹{finalAmount}</Text>
                                </View>
                                <Text style={styles.savingsText}>You will save ₹{totalDiscount} on this order</Text>
                            </View>
                        )}
                    />

                    {/* Bottom Bar */}
                    <View style={styles.bottomBar}>
                        <View>
                            <Text style={styles.bottomTotal}>₹{finalAmount}</Text>
                            <Text style={styles.viewDetailsText}>View price details</Text>
                        </View>
                        <Button
                            title={hasOOSItems ? 'Items OOS' : 'Place Order'}
                            onPress={() => {
                                if (hasOOSItems) {
                                    Alert.alert("Out of Stock", "Please remove out of stock items to proceed.");
                                } else {
                                    router.push('/order-summary');
                                }
                            }}
                            disabled={hasOOSItems}
                            style={styles.placeOrderBtn}
                        />
                    </View>
                </>
            )}
            <AddressBottomSheet
                visible={isAddressSheetVisible}
                onClose={() => setAddressSheetVisible(false)}
                onSelect={handleAddressSelect}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.background.surface,
        ...Shadows.sm
    },
    headerTitle: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary
    },
    addressStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.surface,
        padding: Spacing.lg,
        marginTop: 1,
        marginBottom: Spacing.sm
    },
    deliverToLabel: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginBottom: 2
    },
    addressName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary
    },
    addressText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary
    },
    addAddressText: {
        fontSize: FontSize.md,
        color: Colors.accent,
        fontWeight: FontWeight.bold
    },
    changeBtn: {
        padding: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border.medium,
        borderRadius: BorderRadius.xs
    },
    changeBtnText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.accent
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: Colors.background.surface,
        padding: Spacing.md,
        marginBottom: Spacing.sm
    },
    itemImage: {
        width: 80,
        height: 80,
        marginRight: Spacing.md
    },
    itemInfo: {
        flex: 1
    },
    brandName: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginBottom: 2,
        fontWeight: FontWeight.semibold
    },
    itemName: {
        fontSize: FontSize.md,
        color: Colors.text.primary,
        marginBottom: Spacing.xs
    },
    variantText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginBottom: Spacing.sm
    },
    priceRow: {
        marginBottom: Spacing.sm
    },
    eddText: {
        fontSize: FontSize.sm,
        color: Colors.accent,
        marginBottom: Spacing.md,
        fontWeight: FontWeight.medium
    },
    oosText: {
        fontSize: FontSize.sm,
        color: Colors.semantic.error,
        marginBottom: Spacing.md,
        fontWeight: FontWeight.bold
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border.dark,
        justifyContent: 'center',
        alignItems: 'center'
    },
    qtyBtnText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary
    },
    qtyText: {
        marginHorizontal: Spacing.md,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    deleteText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginLeft: Spacing.xs,
        fontWeight: FontWeight.medium
    },
    billDetails: {
        backgroundColor: Colors.background.surface,
        padding: Spacing.lg,
        marginBottom: Spacing.xl
    },
    billTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.md,
        color: Colors.text.secondary
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm
    },
    billLabel: {
        fontSize: FontSize.md,
        color: Colors.text.primary
    },
    billValue: {
        fontSize: FontSize.md,
        color: Colors.text.primary
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
        paddingTop: Spacing.md,
        marginTop: Spacing.xs
    },
    totalLabel: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold
    },
    totalValue: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold
    },
    savingsText: {
        fontSize: FontSize.sm,
        color: Colors.semantic.success,
        marginTop: Spacing.sm,
        fontWeight: FontWeight.bold
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background.surface,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.border.medium,
        ...Shadows.lg
    },
    bottomTotal: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary
    },
    viewDetailsText: {
        fontSize: FontSize.sm,
        color: Colors.accent
    },
    placeOrderBtn: {
        flex: 1,
        marginLeft: Spacing.xl
    },
});