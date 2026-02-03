/**
 * Address Bottom Sheet Component
 * 
 * Modal for selecting delivery address.
 * Refactored to use new services and theme.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

// Theme & Services
import { getUserAddresses } from '../../services/address.service';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../theme';
import type { Address } from '../../types';

type AddressBottomSheetProps = {
    visible: boolean;
    onClose: () => void;
    onSelect: (address: Address) => void;
};

export default function AddressBottomSheet({ visible, onClose, onSelect }: AddressBottomSheetProps) {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            fetchAddresses();
        }
    }, [visible]);

    const fetchAddresses = async () => {
        setLoading(true);
        const data = await getUserAddresses();
        setAddresses(data || []);
        setLoading(false);
    };

    const handleSelect = (addr: Address) => {
        onSelect(addr);
        onClose();
    };

    const handleAddNew = () => {
        onClose();
        router.push('/address/manage');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Delivery Address</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="small" color={Colors.accent} />
                    </View>
                ) : (
                    <ScrollView style={{ maxHeight: 400 }}>
                        {addresses.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No addresses found.</Text>
                            </View>
                        ) : (
                            addresses.map((addr) => (
                                <TouchableOpacity
                                    key={addr.id}
                                    style={styles.addressItem}
                                    onPress={() => handleSelect(addr)}
                                >
                                    <View style={styles.row}>
                                        <Ionicons
                                            name="location-outline"
                                            size={24}
                                            color={Colors.text.secondary}
                                            style={styles.locationIcon}
                                        />
                                        <View style={styles.addressDetails}>
                                            <Text style={styles.name}>
                                                {addr.name} <Text style={styles.pin}>({addr.pincode})</Text>
                                            </Text>
                                            <Text style={styles.details} numberOfLines={2}>
                                                {addr.address_line1}, {addr.city}, {addr.state}
                                            </Text>
                                        </View>
                                        {addr.is_default && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultText}>Default</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}

                        <TouchableOpacity style={styles.addNewBtn} onPress={handleAddNew}>
                            <Ionicons name="add-circle" size={24} color={Colors.accent} />
                            <Text style={styles.addNewText}>Add New Address</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.background.modal
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.xl,
        ...Shadows.xl,
        maxHeight: '70%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
        paddingBottom: Spacing.md
    },
    modalTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary
    },
    center: {
        padding: Spacing.xl,
        alignItems: 'center'
    },
    emptyContainer: {
        padding: Spacing.xl,
        alignItems: 'center'
    },
    emptyText: {
        color: Colors.text.secondary,
        marginBottom: Spacing.sm
    },
    addressItem: {
        padding: Spacing.lg,
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border.light
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    locationIcon: {
        marginRight: Spacing.sm
    },
    addressDetails: {
        flex: 1
    },
    name: {
        fontWeight: FontWeight.bold,
        fontSize: FontSize.md,
        marginBottom: 2,
        color: Colors.text.primary
    },
    pin: {
        fontWeight: FontWeight.regular,
        color: Colors.text.secondary
    },
    details: {
        fontSize: FontSize.sm,
        color: Colors.text.secondary,
        lineHeight: 16
    },
    defaultBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.xs,
        marginLeft: Spacing.sm
    },
    defaultText: {
        fontSize: FontSize.xs,
        color: Colors.accent,
        fontWeight: FontWeight.bold
    },
    addNewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.sm,
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.border.light
    },
    addNewText: {
        color: Colors.accent,
        fontWeight: FontWeight.bold,
        marginLeft: Spacing.sm,
        fontSize: FontSize.lg
    }
});