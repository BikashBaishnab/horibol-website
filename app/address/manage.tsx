/**
 * Address Management Screen
 * 
 * List, edit, delete, and set default addresses.
 * Premium UI with swipe actions and confirmation dialogs.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { deleteAddress, getUserAddresses, setDefaultAddress } from '../../services/address.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';
import type { Address } from '../../types';

export default function ManageAddressScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            loadAddresses();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadAddresses = async () => {
        setLoading(true);
        const data = await getUserAddresses();
        setAddresses(data);
        setLoading(false);
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAddresses();
        setRefreshing(false);
    }, []);

    const handleSetDefault = async (address: Address) => {
        if (address.is_default) return;

        Alert.alert(
            'Set as Default',
            `Set this address as your default delivery address?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Set Default',
                    onPress: async () => {
                        setProcessingId(address.id);
                        try {
                            await setDefaultAddress(address.id);
                            await loadAddresses();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to set default address');
                        }
                        setProcessingId(null);
                    }
                }
            ]
        );
    };

    const handleDelete = async (address: Address) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessingId(address.id);
                        try {
                            await deleteAddress(address.id);
                            setAddresses(prev => prev.filter(a => a.id !== address.id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete address');
                        }
                        setProcessingId(null);
                    }
                }
            ]
        );
    };

    const handleEdit = (address: Address) => {
        // Navigate to add address screen with edit mode
        router.push({
            pathname: '/address/add',
            params: { editId: address.id.toString() }
        });
    };

    // Render header
    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Addresses</Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/address/add')}
            >
                <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
        </View>
    );

    // Render address card
    const renderAddressCard = ({ item, index }: { item: Address; index: number }) => {
        const isProcessing = processingId === item.id;

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 50).duration(400)}
                exiting={FadeOutLeft.duration(300)}
            >
                <View style={[styles.card, item.is_default && styles.cardDefault]}>
                    {/* Default Badge */}
                    {item.is_default && (
                        <View style={styles.defaultBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={Colors.semantic.success} />
                            <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                    )}

                    {/* Address Content */}
                    <TouchableOpacity
                        style={styles.cardContent}
                        onPress={() => handleSetDefault(item)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="location"
                                size={24}
                                color={item.is_default ? Colors.primary : Colors.text.tertiary}
                            />
                        </View>
                        <View style={styles.addressDetails}>
                            <Text style={styles.addressName}>{item.name}</Text>
                            <Text style={styles.addressPhone}>{item.phone}</Text>
                            <Text style={styles.addressLine} numberOfLines={2}>
                                {item.address_line1}
                                {item.address_line2 && `, ${item.address_line2}`}
                            </Text>
                            <Text style={styles.addressLine}>
                                {item.city}, {item.state} - {item.pincode}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        {!item.is_default && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleSetDefault(item)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                ) : (
                                    <>
                                        <Ionicons name="star-outline" size={16} color={Colors.primary} />
                                        <Text style={styles.actionButtonText}>Set Default</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleEdit(item)}
                        >
                            <Ionicons name="pencil-outline" size={16} color={Colors.text.secondary} />
                            <Text style={[styles.actionButtonText, { color: Colors.text.secondary }]}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(item)}
                            disabled={isProcessing}
                        >
                            <Ionicons name="trash-outline" size={16} color={Colors.semantic.error} />
                            <Text style={[styles.actionButtonText, { color: Colors.semantic.error }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-plus-outline" size={80} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
            <Text style={styles.emptySubtitle}>
                Add your first delivery address to get started
            </Text>
            <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => router.push('/address/add')}
            >
                <Ionicons name="add" size={20} color={Colors.text.primary} />
                <Text style={styles.addAddressButtonText}>Add New Address</Text>
            </TouchableOpacity>
        </View>
    );

    // Render login prompt
    const renderLoginPrompt = () => (
        <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={80} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Please Login</Text>
            <Text style={styles.emptySubtitle}>
                Login to manage your delivery addresses
            </Text>
            <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => router.push('/auth/login')}
            >
                <Text style={styles.addAddressButtonText}>Login</Text>
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
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            ) : !user ? (
                renderLoginPrompt()
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAddressCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={
                        addresses.length > 0 ? (
                            <TouchableOpacity
                                style={styles.addNewButton}
                                onPress={() => router.push('/address/add')}
                            >
                                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                                <Text style={styles.addNewButtonText}>Add New Address</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                />
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
    addButton: {
        padding: Spacing.sm,
        marginRight: -Spacing.sm,
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
    card: {
        backgroundColor: Colors.background.surface,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    cardDefault: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${Colors.semantic.success}15`,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
    },
    defaultBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.semantic.success,
        marginLeft: 4,
    },
    cardContent: {
        flexDirection: 'row',
        padding: Spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressDetails: {
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
        marginTop: 4,
        lineHeight: 20,
    },
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.border.light,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRightWidth: 1,
        borderRightColor: Colors.border.light,
    },
    actionButtonText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: Colors.primary,
        marginLeft: 4,
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
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
    },
    addAddressButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginLeft: Spacing.xs,
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        marginTop: Spacing.sm,
    },
    addNewButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.primary,
        marginLeft: Spacing.xs,
    },
});