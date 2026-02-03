/**
 * Checkout Screen - Final Payment Flow
 * 
 * Premium checkout experience with:
 * - Two payment options: Online Payment & COD
 * - COD with ₹19 convenience fee
 * - COD available only if product is_cod AND shiprocket COD is true
 * - Razorpay Standard Checkout for online payments
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

// Components
import PaymentMethodCard, { COD_CONVENIENCE_FEE, PaymentMethod } from '../../components/checkout/PaymentMethodCard';
import AddressBottomSheet from '../../components/ui/AddressBottomSheet';

// Services
import { TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import { getDefaultAddress } from '../../services/address.service';
import { checkPaymentAvailability, clearCart, getCartItems } from '../../services/cart.service';
import { recordCouponUsage, validateCoupon } from '../../services/coupon.service';
import { RazorpayService } from '../../services/razorpay.service';
import { checkServiceability } from '../../services/shipping.service';
import type { Coupon } from '../../types';

export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const posthog = usePostHog();

    // State
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [address, setAddress] = useState<any>(null);
    const [isAddressSheetVisible, setAddressSheetVisible] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

    // COD availability state
    const [isCodAvailable, setIsCodAvailable] = useState(false);
    const [codReason, setCodReason] = useState<string | undefined>(undefined);

    // Bill State
    const [bill, setBill] = useState({
        totalMRP: 0,
        totalDiscount: 0,
        deliveryFee: 0,
        codFee: 0,
        finalAmount: 0,
        itemCount: 0
    });

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Animation
    const fadeAnim = useState(new Animated.Value(0))[0];

    const isBuyNow = params.isBuyNow === 'true';

    useEffect(() => {
        loadData();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    // Recalculate bill when payment method changes
    useEffect(() => {
        if (items.length > 0) {
            calculateBill(items, selectedPaymentMethod);
        }
    }, [selectedPaymentMethod]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Address
            const userAddress = await getDefaultAddress();
            setAddress(userAddress);

            // 2. Fetch Items based on flow
            let orderItems: any[] = [];

            if (isBuyNow) {
                const { variantId, qty } = params;
                const { data, error } = await supabase
                    .from('product_detail_view')
                    .select('*, attributes')
                    .eq('variant_id', variantId)

                    .single();

                if (error || !data) throw new Error("Product not found");

                orderItems = [{
                    cart_id: 'buy_now_temp',
                    product_id: data.product_id,
                    variant_id: data.variant_id,
                    brand_name: data.brand_name,
                    product_name: data.product_name,
                    image: data.main_image || data.image_url,
                    unit_price: data.price,
                    unit_mrp: data.mrp,
                    quantity: Number(qty) || 1,
                    discount_percentage: data.discount_percentage,
                    attributes: data.attributes,
                    is_cod: data.is_cod // Include is_cod flag

                }];

                if (!userAddress) {
                    setTimeout(() => setAddressSheetVisible(true), 600);
                }
            } else {
                orderItems = await getCartItems();
                if (!orderItems) orderItems = [];
            }

            setItems(orderItems);
            calculateBill(orderItems, null);

            // 3. Check COD availability
            if (userAddress?.pincode) {
                await checkCodAvailability(userAddress.pincode, orderItems);
            }

        } catch (error) {
            console.error("Checkout Error:", error);
            Alert.alert("Error", "Could not load checkout details.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (index: number, change: number) => {
        if (!isBuyNow) return;

        const newItems = [...items];
        const item = newItems[index];
        const newQty = item.quantity + change;

        if (newQty < 1) return;

        // Note: For Buy Now, we trust the UI/state for updates.
        newItems[index] = { ...item, quantity: newQty };
        setItems(newItems);
        calculateBill(newItems, selectedPaymentMethod);
    };

    const checkCodAvailability = async (pincode: string, orderItems: any[]) => {
        try {
            // 1. Check Shiprocket serviceability for COD
            const serviceability = await checkServiceability(Number(pincode));
            const shiprocketCodAvailable = serviceability?.cod ?? false;

            // 2. Check product-level COD + shiprocket COD
            const { codAllowed, reason } = await checkPaymentAvailability(
                pincode,
                orderItems,
                shiprocketCodAvailable
            );

            setIsCodAvailable(codAllowed);
            setCodReason(reason || undefined);
        } catch (error) {
            console.error("COD check error:", error);
            setIsCodAvailable(false);
            setCodReason('Could not verify COD availability');
        }
    };

    const calculateBill = (orderItems: any[], paymentMethod: PaymentMethod | null, coupon: Coupon | null = appliedCoupon) => {
        const totalMRP = orderItems.reduce((sum, item) => sum + (item.unit_mrp * item.quantity), 0);
        const totalSelling = orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        const itemDiscount = totalMRP - totalSelling;

        let couponDiscount = 0;
        if (coupon) {
            if (coupon.discount_type === 'percentage') {
                couponDiscount = (totalSelling * coupon.discount_value) / 100;
                if (coupon.max_discount_amount) {
                    couponDiscount = Math.min(couponDiscount, coupon.max_discount_amount);
                }
            } else {
                couponDiscount = coupon.discount_value;
            }
            // Ensure discount doesn't exceed total
            couponDiscount = Math.min(couponDiscount, totalSelling);
        }

        const delivery = (totalSelling - couponDiscount) > 500 ? 0 : 40;
        const codFee = paymentMethod === 'COD' ? COD_CONVENIENCE_FEE : 0;
        const finalAmount = totalSelling - couponDiscount + delivery + codFee;

        setBill({
            totalMRP,
            totalDiscount: itemDiscount + couponDiscount,
            deliveryFee: delivery,
            codFee,
            finalAmount,
            itemCount: orderItems.length
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setValidatingCoupon(true);
        setCouponError(null);

        try {
            // Calculate current total for validation
            const currentTotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

            const result = await validateCoupon(couponCode, currentTotal);

            if (result.valid && result.coupon) {
                setAppliedCoupon(result.coupon);
                setCouponCode(''); // Clear input
                calculateBill(items, selectedPaymentMethod, result.coupon);
                Alert.alert('Success', `Coupon ${result.coupon.code} applied successfully!`);
            } else {
                setCouponError(result.error || 'Invalid coupon');
                setAppliedCoupon(null);
                calculateBill(items, selectedPaymentMethod, null);
            }
        } catch (error) {
            setCouponError('Failed to validate coupon');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError(null);
        calculateBill(items, selectedPaymentMethod, null);
    };

    const handleAddressSelect = async (selectedAddr: any) => {
        setAddress(selectedAddr);
        setAddressSheetVisible(false);

        // Re-check COD availability for the new address
        if (selectedAddr?.pincode) {
            await checkCodAvailability(selectedAddr.pincode, items);
        }
    };

    const handlePayment = async () => {
        if (!address) {
            Alert.alert("Address Required", "Please select a delivery address.");
            setAddressSheetVisible(true);
            return;
        }

        if (!selectedPaymentMethod) {
            Alert.alert("Payment Method", "Please select a payment method.");
            return;
        }

        // Track Checkout Started
        posthog.capture('Checkout Started', {
            amount: bill.finalAmount,
            item_count: bill.itemCount,
            payment_method: selectedPaymentMethod
        });

        setPaymentLoading(true);

        try {
            if (selectedPaymentMethod === 'COD') {
                // Cash on Delivery - Create order directly
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Please log in to continue");

                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        user_id: user.id,
                        final_amount: bill.finalAmount,
                        shipping_fee: bill.deliveryFee,
                        payment_method: 'COD',
                        payment_status: 'pending',
                        status: 'placed',
                        shipping_address_snapshot: {
                            name: address.name,
                            phone: address.phone,
                            address_line1: address.address_line1,
                            address_line2: address.address_line2,
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode
                        }
                    })
                    .select('id')
                    .single();

                if (orderError) throw orderError;

                // Insert order items
                const orderItems = items.map(item => ({
                    order_id: orderData.id,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    product_name: item.product_name,
                    variant_name: item.attributes ? Object.entries(item.attributes).filter(([k]) => k !== 'id' && k !== 'variant_name').map(([_, v]) => v).join(' | ') : '',
                    product_image_url: item.image,
                    quantity: item.quantity,
                    price_at_purchase: item.unit_price,
                    total_item_price: item.unit_price * item.quantity,
                    status: 'placed',
                    brand_name: item.brand_name,
                    attributes: item.attributes
                }));

                await supabase.from('order_items').insert(orderItems);

                // Clear cart if not Buy Now flow
                if (!isBuyNow) {
                    await clearCart();
                }

                // Record Coupon Usage
                if (appliedCoupon) {
                    await recordCouponUsage(
                        appliedCoupon.id,
                        orderData.id,
                        bill.totalDiscount - (items.reduce((sum, item) => sum + (item.unit_mrp - item.unit_price) * item.quantity, 0)) // Calculate just coupon discount
                    );
                }

                // Track Success
                posthog.capture('Order Completed', {
                    revenue: bill.finalAmount,
                    currency: 'INR',
                    payment_method: 'COD',
                    order_id: orderData.id
                });

                setPaymentLoading(false);

                // Navigate to confirmation screen
                router.replace({
                    pathname: '/order-confirmation',
                    params: {
                        orderId: orderData.id.toString(),
                        paymentMethod: 'COD',
                        amount: bill.finalAmount.toString()
                    }
                });
                return;
            }

            // Online Payment - Razorpay Standard Checkout
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please log in to continue");

            const userEmail = user?.email || user?.user_metadata?.email || '';
            const userPhone = address.phone || user?.user_metadata?.phone || user?.phone || '';
            const userName = address.name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Valued Customer';

            // Pre-flight Validation for Razorpay SDK
            if (!userPhone && !userEmail) {
                setPaymentLoading(false);
                Alert.alert(
                    "Contact Info Required",
                    "Please update your profile with a phone number or email to proceed with online payment."
                );
                return;
            }

            // Amount for online payment (no COD fee)
            const onlineAmount = bill.finalAmount - bill.codFee;

            // 1. Create order in Supabase first (Status: 'PENDING')
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    final_amount: onlineAmount,
                    shipping_fee: bill.deliveryFee,
                    payment_method: 'ONLINE',
                    payment_status: 'pending',
                    status: 'pending', // Pending until payment success or webhook
                    shipping_address_snapshot: {
                        name: address.name,
                        phone: address.phone,
                        address_line1: address.address_line1,
                        address_line2: address.address_line2,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode
                    }
                })
                .select('id')
                .single();

            if (orderError) throw orderError;

            // 2. Insert order items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                product_name: item.product_name,
                variant_name: item.attributes ? Object.entries(item.attributes).filter(([k]) => k !== 'id' && k !== 'variant_name').map(([_, v]) => v).join(' | ') : '',
                product_image_url: item.image,
                quantity: item.quantity,
                price_at_purchase: item.unit_price,
                total_item_price: item.unit_price * item.quantity,
                status: 'pending',
                brand_name: item.brand_name,
                attributes: item.attributes
            }));

            await supabase.from('order_items').insert(orderItems);

            // Generate unique receipt ID (using our DB order ID)
            const receiptId = `order_${orderData.id}`;

            // 3. Start Razorpay Payment Flow
            const { data: { session } } = await supabase.auth.getSession();
            const authHeader = `Bearer ${session?.access_token}`;

            // 4. Start Razorpay payment
            await RazorpayService.startPayment(
                onlineAmount,
                receiptId,
                {
                    name: userName,
                    email: userEmail,
                    phone: userPhone,
                },
                async (response, razorpayOrderId) => {
                    // Payment successful on client
                    setIsVerifyingPayment(true);
                    setPaymentLoading(false);

                    // Verify payment via Edge Function
                    const verified = await RazorpayService.verifyPayment(
                        response.razorpay_payment_id,
                        response.razorpay_order_id,
                        response.razorpay_signature,
                        authHeader,
                        orderData.id.toString()
                    );

                    if (!verified) {
                        setIsVerifyingPayment(false);
                        Alert.alert(
                            "Verification Failed",
                            "Payment verification failed. If money was deducted, your order will update shortly. Please contact support if needed."
                        );
                        return;
                    }

                    // On Success...

                    // Clear cart if not Buy Now flow
                    if (!isBuyNow) {
                        await clearCart();
                    }

                    // Record Coupon Usage
                    if (appliedCoupon) {
                        await recordCouponUsage(
                            appliedCoupon.id,
                            orderData.id,
                            bill.totalDiscount - (items.reduce((sum, item) => sum + (item.unit_mrp - item.unit_price) * item.quantity, 0))
                        );
                    }

                    // Navigate to confirmation screen
                    router.replace({
                        pathname: '/order-confirmation',
                        params: {
                            orderId: orderData.id.toString(),
                            paymentMethod: 'ONLINE',
                            amount: onlineAmount.toString(),
                            razorpayPaymentId: response.razorpay_payment_id
                        }
                    });

                    setIsVerifyingPayment(false);

                    // Track Success
                    posthog.capture('Order Completed', {
                        revenue: onlineAmount,
                        currency: 'INR',
                        payment_method: 'ONLINE',
                        order_id: orderData.id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id
                    });
                },
                (error) => {
                    // Payment failed or cancelled
                    setPaymentLoading(false);

                    if (error?.code !== 'CANCELLED' && error?.code !== 'PAYMENT_CANCELLED') {
                        Alert.alert(
                            "Payment Failed",
                            error?.message || error?.description || "Please try again."
                        );

                        // Track Failure
                        posthog.capture('Payment Failed', {
                            error_code: error?.code,
                            error_description: error?.description || error?.message,
                            amount: onlineAmount,
                            order_id: orderData.id
                        });
                    }
                },
                authHeader,
                orderData.id.toString() // Pass supabase_order_id
            );
        } catch (error: any) {
            setPaymentLoading(false);
            Alert.alert("Error", error?.message || "Failed to process payment");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Reviewing order details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Review Order</Text>
                        <Text style={styles.headerSubtitle}>{bill.itemCount} item{bill.itemCount > 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <MaterialCommunityIcons name="shield-check" size={22} color={Colors.semantic.success} />
                    </View>
                </View>
            </SafeAreaView>

            <Animated.ScrollView
                style={[styles.scrollView, { opacity: fadeAnim }]}
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressStep}>
                        <View style={[styles.progressDot, styles.progressDotComplete]}>
                            <Ionicons name="checkmark" size={12} color={Colors.text.inverse} />
                        </View>
                        <Text style={styles.progressLabel}>Cart</Text>
                    </View>
                    <View style={[styles.progressLine, styles.progressLineComplete]} />
                    <View style={styles.progressStep}>
                        <View style={[styles.progressDot, styles.progressDotActive]}>
                            <Text style={styles.progressNumber}>2</Text>
                        </View>
                        <Text style={[styles.progressLabel, styles.progressLabelActive]}>Review</Text>
                    </View>
                    <View style={styles.progressLine} />
                    <View style={styles.progressStep}>
                        <View style={styles.progressDot}>
                            <Text style={styles.progressNumber}>3</Text>
                        </View>
                        <Text style={styles.progressLabel}>Checkout</Text>
                    </View>
                </View>

                {/* Delivery Address Card */}
                <View style={styles.sectionCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Ionicons name="location" size={18} color={Colors.primary} />
                            <Text style={styles.cardTitle}>Deliver to</Text>
                        </View>
                        <TouchableOpacity onPress={() => setAddressSheetVisible(true)}>
                            <Text style={styles.changeBtn}>CHANGE</Text>
                        </TouchableOpacity>
                    </View>

                    {address ? (
                        <View style={styles.addressContent}>
                            <View style={styles.addressBadge}>
                                <Text style={styles.addressBadgeText}>
                                    {address.address_type?.toUpperCase() || 'HOME'}
                                </Text>
                            </View>
                            <Text style={styles.addressName}>{address.name}</Text>
                            <Text style={styles.addressText} numberOfLines={2}>
                                {address.address_line1}, {address.city}, {address.state} - {address.pincode}
                            </Text>
                            <Text style={styles.addressPhone}>+91 {address.phone}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addAddressBtn}
                            onPress={() => setAddressSheetVisible(true)}
                        >
                            <Ionicons name="add-circle-outline" size={22} color={Colors.accent} />
                            <Text style={styles.addAddressText}>Add Delivery Address</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Order Items Card */}
                <View style={styles.sectionCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Ionicons name="bag-handle" size={18} color={Colors.primary} />
                            <Text style={styles.cardTitle}>Order Summary</Text>
                        </View>
                        <Text style={styles.itemCount}>{bill.itemCount} item{bill.itemCount > 1 ? 's' : ''}</Text>
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.itemImage}
                                contentFit="contain"
                                cachePolicy="disk"
                            />
                            <View style={styles.itemDetails}>
                                {item.brand_name && (
                                    <Text style={styles.itemBrand}>{item.brand_name}</Text>
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

                                <View style={styles.itemPriceRow}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.itemPrice}>₹{item.unit_price * item.quantity}</Text>
                                            {item.unit_mrp > item.unit_price && (
                                                <Text style={styles.itemMrp}>₹{item.unit_mrp * item.quantity}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {isBuyNow ? (
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={styles.quantityBtn}
                                                onPress={() => handleQuantityChange(index, -1)}
                                            >
                                                <Ionicons name="remove" size={16} color={Colors.text.primary} />
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={styles.quantityBtn}
                                                onPress={() => handleQuantityChange(index, 1)}
                                            >
                                                <Ionicons name="add" size={16} color={Colors.text.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Coupon Section */}
                    <View style={styles.couponSection}>
                        {appliedCoupon ? (
                            <View style={styles.appliedCouponContainer}>
                                <View style={styles.couponLeft}>
                                    <Ionicons name="pricetag" size={20} color={Colors.semantic.success} />
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                                        <Text style={styles.appliedCouponText}>
                                            Coupon applied successfully
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={removeCoupon}>
                                    <Text style={styles.removeCouponText}>REMOVE</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.couponInputContainer}>
                                    <Ionicons name="pricetag-outline" size={20} color={Colors.text.tertiary} style={styles.couponIcon} />
                                    <TextInput
                                        style={styles.couponInput}
                                        placeholder="Enter Coupon Code"
                                        placeholderTextColor={Colors.text.tertiary}
                                        value={couponCode}
                                        onChangeText={(text) => {
                                            setCouponCode(text);
                                            if (couponError) setCouponError(null);
                                        }}
                                        autoCapitalize="characters"
                                    />
                                    {couponCode.length > 0 && (
                                        <TouchableOpacity
                                            onPress={handleApplyCoupon}
                                            disabled={validatingCoupon}
                                            style={styles.applyButton}
                                        >
                                            {validatingCoupon ? (
                                                <ActivityIndicator size="small" color={Colors.primary} />
                                            ) : (
                                                <Text style={styles.applyButtonText}>APPLY</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {couponError && (
                                    <Text style={styles.couponErrorText}>{couponError}</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Bill Breakdown */}
                    <View style={styles.billBreakdown}>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Total MRP</Text>
                            <Text style={styles.billValue}>₹{bill.totalMRP}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Discount</Text>
                            <Text style={[styles.billValue, styles.discountValue]}>-₹{bill.totalDiscount}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Delivery Fee</Text>
                            <Text style={[styles.billValue, bill.deliveryFee === 0 && styles.freeValue]}>
                                {bill.deliveryFee === 0 ? 'FREE' : `₹${bill.deliveryFee}`}
                            </Text>
                        </View>
                        {bill.codFee > 0 && (
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>COD Convenience Fee</Text>
                                <Text style={styles.billValue}>₹{bill.codFee}</Text>
                            </View>
                        )}
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Payable</Text>
                            <Text style={styles.totalValue}>₹{bill.finalAmount}</Text>
                        </View>
                        {bill.totalDiscount > 0 && (
                            <View style={styles.savingsBadge}>
                                <Ionicons name="pricetag" size={14} color={Colors.semantic.success} />
                                <Text style={styles.savingsText}>You save ₹{bill.totalDiscount} on this order</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Simple Offers Info */}
                <View style={styles.offersSection}>
                    <View style={{
                        backgroundColor: '#FFF8E1',
                        borderRadius: 8,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                    }}>
                        <Ionicons name="pricetag" size={18} color="#F59E0B" />
                        <Text style={{ color: '#92400E', fontSize: 13, flex: 1 }}>
                            No-cost EMI & other offers available on online payment
                        </Text>
                    </View>
                </View>

                {/* Payment Method Selection */}
                <View style={styles.paymentSection}>
                    <Text style={styles.paymentSectionTitle}>Select Payment Method</Text>
                    <PaymentMethodCard
                        selectedMethod={selectedPaymentMethod}
                        onSelectMethod={setSelectedPaymentMethod}
                        isCodAvailable={isCodAvailable}
                        codReason={codReason}
                        totalAmount={bill.finalAmount - bill.codFee}
                    />
                </View>
            </Animated.ScrollView >

            {/* Premium Bottom Bar */}
            < View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]} >
                <View style={styles.bottomLeft}>
                    <Text style={styles.bottomLabel}>Total</Text>
                    <Text style={styles.bottomTotal}>₹{bill.finalAmount}</Text>
                    {selectedPaymentMethod === 'COD' && (
                        <Text style={styles.codNote}>incl. ₹{COD_CONVENIENCE_FEE} COD fee</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        (!selectedPaymentMethod || paymentLoading) && styles.payButtonDisabled
                    ]}
                    onPress={handlePayment}
                    disabled={!selectedPaymentMethod || paymentLoading}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={selectedPaymentMethod && !paymentLoading
                            ? [Colors.primary, Colors.primaryDark]
                            : ['#CCC', '#BBB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.payButtonGradient}
                    >
                        {paymentLoading ? (
                            <ActivityIndicator color={Colors.text.primary} size="small" />
                        ) : (
                            <>
                                <Text style={styles.payButtonText}>
                                    {selectedPaymentMethod === 'COD' ? 'Place Order' : 'Proceed to Pay'}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View >

            <AddressBottomSheet
                visible={isAddressSheetVisible}
                onClose={() => setAddressSheetVisible(false)}
                onSelect={handleAddressSelect}
            />

            {/* Verifying Payment Overlay */}
            {isVerifyingPayment && (
                <View style={styles.verifyingOverlay}>
                    <View style={styles.verifyingContent}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.verifyingTitle}>Verifying Payment</Text>
                        <Text style={styles.verifyingSubtitle}>Please do not close the app or go back</Text>
                    </View>
                </View>
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.surface,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text.secondary,
    },

    // Header
    headerSafeArea: {
        backgroundColor: Colors.background.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background.surface,
        ...Shadows.sm,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerCenter: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    headerSubtitle: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    headerRight: {},

    scrollView: {
        flex: 1,
    },

    // Progress Indicator
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        backgroundColor: Colors.background.surface,
        marginBottom: Spacing.sm,
    },
    progressStep: {
        alignItems: 'center',
    },
    progressDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    progressDotComplete: {
        backgroundColor: Colors.semantic.success,
    },
    progressDotActive: {
        backgroundColor: Colors.primary,
    },
    progressNumber: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.text.inverse,
    },
    progressLabel: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
    },
    progressLabelActive: {
        color: Colors.text.primary,
        fontWeight: FontWeight.semibold,
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: Colors.border.default,
        marginHorizontal: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    progressLineComplete: {
        backgroundColor: Colors.semantic.success,
    },

    // Cards
    sectionCard: {
        backgroundColor: Colors.background.surface,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    cardTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    changeBtn: {
        fontSize: FontSize.xs,
        color: Colors.accent,
        fontWeight: FontWeight.bold,
    },

    // Address
    addressContent: {
        paddingTop: Spacing.xs,
    },
    addressBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.background.secondary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
        marginBottom: Spacing.xs,
    },
    addressBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.text.secondary,
    },
    addressName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    addressText: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        lineHeight: 20,
        marginBottom: 4,
    },
    addressPhone: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    addAddressBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
    },
    addAddressText: {
        fontSize: FontSize.md,
        color: Colors.accent,
        fontWeight: FontWeight.semibold,
    },

    // Items
    itemCount: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
    },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.background.secondary,
        marginRight: Spacing.md,
    },
    itemDetails: {
        flex: 1,
    },
    itemBrand: {
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '700',
        marginBottom: 2,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 4,
        lineHeight: 20,
    },
    variantText: {
        fontSize: 13,
        color: Colors.text.secondary,
        marginBottom: 6,
    },
    itemPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    itemMrp: {
        fontSize: 13,
        color: Colors.text.tertiary,
        textDecorationLine: 'line-through',
        marginLeft: Spacing.sm,
    },
    itemQty: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
        backgroundColor: Colors.background.secondary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.xs,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.sm,
        padding: 2,
    },
    quantityBtn: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginHorizontal: Spacing.sm,
        minWidth: 16,
        textAlign: 'center',
    },

    // Bill Breakdown
    billBreakdown: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    billLabel: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    billValue: {
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '500',
    },
    discountValue: {
        color: Colors.semantic.success,
    },
    freeValue: {
        color: Colors.semantic.success,
        fontWeight: FontWeight.semibold,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginVertical: Spacing.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    totalValue: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    savingsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.md,
        backgroundColor: Colors.semantic.success + '15',
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    savingsText: {
        fontSize: FontSize.xs,
        color: Colors.semantic.success,
        fontWeight: FontWeight.semibold,
    },

    // Offers Section
    offersSection: {
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },

    // Payment Section
    paymentSection: {
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    paymentSectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        backgroundColor: Colors.background.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
        ...Shadows.lg,
    },
    bottomLeft: {
        flex: 1,
    },
    bottomLabel: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    bottomTotal: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    codNote: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
    },
    payButton: {
        flex: 1.2,
        marginLeft: Spacing.lg,
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    payButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },

    // Coupon Styles
    couponSection: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
        marginBottom: Spacing.md,
    },
    couponInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border.default,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        backgroundColor: Colors.background.primary,
        height: 44,
    },
    couponIcon: {
        marginRight: Spacing.xs,
    },
    couponInput: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.text.primary,
        height: '100%',
        paddingRight: Spacing.sm,
    },
    applyButton: {
        paddingHorizontal: Spacing.sm,
    },
    applyButtonText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    couponErrorText: {
        fontSize: FontSize.xs,
        color: Colors.semantic.error,
        marginTop: 4,
        marginLeft: 4,
    },
    appliedCouponContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: `${Colors.semantic.success}10`,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: `${Colors.semantic.success}30`,
    },
    couponLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appliedCouponCode: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.semantic.success,
    },
    appliedCouponText: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
    },
    removeCouponText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.semantic.error,
    },

    // Verifying Overlay
    verifyingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    verifyingContent: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    verifyingTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.xs,
    },
    verifyingSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
});