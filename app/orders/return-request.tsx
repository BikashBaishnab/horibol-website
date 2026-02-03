/**
 * Return Request Screen
 * 
 * Allows users to submit a return request for an order item.
 * Features:
 * - Reason selection
 * - Detailed comment input
 * - Validation
 * - Submission handling
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '../../lib/supabase';
import { createReturnRequest, RETURN_REASONS } from '../../services/return.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';

export default function ReturnRequestScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ itemId: string }>();
    const itemId = parseInt(params.itemId || '0', 10);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [item, setItem] = useState<any>(null);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [comments, setComments] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (itemId) {
            loadItemDetails();
        }
    }, [itemId]);

    const loadItemDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // We need to fetch the item details to show what's being returned
            // We can reuse the order_items query pattern
            const { data, error } = await supabase
                .from('order_items')
                .select(`
                    *,
                    orders (
                        order_number
                    )
                `)
                .eq('id', itemId)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Item not found');

            setItem(data);
        } catch (err) {
            console.error('Error fetching item:', err);
            setError('Failed to load item details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedReason) {
            Alert.alert('Select Reason', 'Please select a reason for returning this item.');
            return;
        }

        try {
            setSubmitting(true);
            Keyboard.dismiss();

            const result = await createReturnRequest({
                order_item_id: itemId,
                reason: selectedReason,
                reason_details: comments,
            });

            if (result.success) {
                Alert.alert(
                    'Return Requested',
                    'Your return request has been submitted successfully. We will update you shortly.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.navigate('/orders'), // Go back to orders list or detail
                        },
                    ]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to submit return request');
            }
        } catch (err) {
            console.error('Error submitting return:', err);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Request Return</Text>
            </View>
            <View style={styles.headerRight} />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                {renderHeader()}
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    if (error || !item) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                {renderHeader()}
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.semantic.error} />
                    <Text style={styles.errorText}>{error || 'Item not found'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadItemDetails}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Stack.Screen options={{ headerShown: false }} />
                    {renderHeader()}

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Item Summary */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Item to Return</Text>
                            <View style={styles.itemCard}>
                                <Image
                                    source={item.product_image_url ? { uri: item.product_image_url } : require('../../assets/images/horibol_logo.png')}
                                    style={styles.itemImage}
                                    contentFit="contain"
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                                    {item.variant_name && (
                                        <Text style={styles.itemVariant}>{item.variant_name}</Text>
                                    )}
                                    <View style={styles.orderInfo}>
                                        <Text style={styles.orderId}>Order #{item.orders?.order_number || item.order_id}</Text>
                                        <Text style={styles.itemPrice}>₹{item.price_at_purchase}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Reason Selection */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Why are you returning this?</Text>
                            <View style={styles.reasonsContainer}>
                                {RETURN_REASONS.map((reason) => (
                                    <TouchableOpacity
                                        key={reason.id}
                                        style={[
                                            styles.reasonOption,
                                            selectedReason === reason.id && styles.reasonOptionSelected
                                        ]}
                                        onPress={() => setSelectedReason(reason.id)}
                                    >
                                        <View style={[
                                            styles.radioCircle,
                                            selectedReason === reason.id && styles.radioCircleSelected
                                        ]}>
                                            {selectedReason === reason.id && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={[
                                            styles.reasonText,
                                            selectedReason === reason.id && styles.reasonTextSelected
                                        ]}>
                                            {reason.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Comments */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Please provide more details about the issue..."
                                placeholderTextColor={Colors.text.tertiary}
                                multiline
                                numberOfLines={4}
                                value={comments}
                                onChangeText={setComments}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedReason || submitting) && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedReason || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={Colors.text.inverse} />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Return Request</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    headerRight: {
        width: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    // Item Card
    itemCard: {
        flexDirection: 'row',
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Shadows.sm,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.background.secondary,
    },
    itemInfo: {
        flex: 1,
        marginLeft: Spacing.md,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    itemVariant: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        marginBottom: 4,
    },
    orderInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontSize: FontSize.xs,
        color: Colors.text.tertiary,
    },
    itemPrice: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
    },
    // Reason Selection
    reasonsContainer: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        ...Shadows.sm,
        overflow: 'hidden',
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    reasonOptionSelected: {
        backgroundColor: `${Colors.primary}05`,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.text.tertiary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    radioCircleSelected: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    reasonText: {
        fontSize: FontSize.md,
        color: Colors.text.primary,
    },
    reasonTextSelected: {
        fontWeight: FontWeight.semibold,
        color: Colors.primary,
    },
    // Input
    commentInput: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        height: 120,
        textAlignVertical: 'top',
        fontSize: FontSize.md,
        color: Colors.text.primary,
        ...Shadows.sm,
    },
    // Submit
    submitButton: {
        marginHorizontal: Spacing.md,
        marginTop: Spacing.xl,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        ...Shadows.md,
    },
    submitButtonDisabled: {
        backgroundColor: Colors.text.disabled,
        elevation: 0,
        opacity: 0.7,
    },
    submitButtonText: {
        color: Colors.text.inverse,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    errorText: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        marginVertical: Spacing.md,
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border.dark,
    },
    retryButtonText: {
        fontSize: FontSize.md,
        color: Colors.text.primary,
        fontWeight: FontWeight.medium,
    },
});
