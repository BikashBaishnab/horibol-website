import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUserLocation } from '../../context/UserLocationContext';
import { checkServiceability } from '../../services/shipping.service';

interface Props {
    weight?: number;
    length?: number;
    breadth?: number;
    height?: number;
    isCod?: boolean;
    onServiceableChange?: (isServiceable: boolean) => void;
}

export default function DeliveryCheck({ weight, length, breadth, height, isCod, onServiceableChange }: Props) {
    const { pincode, setPincode } = useUserLocation();

    const [loading, setLoading] = useState(false);
    const [eddData, setEddData] = useState<any>(null);

    // Modal State
    const [isModalVisible, setModalVisible] = useState(false);
    const [tempPin, setTempPin] = useState('');

    const fetchEdd = useCallback(async () => {
        if (!pincode || pincode.length !== 6) return;

        setLoading(true);

        const safePin = parseInt(pincode) || 0;
        let safeWeight = weight ? Number(weight) : 0.5;
        if (safeWeight <= 0 || isNaN(safeWeight)) safeWeight = 0.5;

        const safeL = length || 10;
        const safeB = breadth || 10;
        const safeH = height || 10;

        try {
            const data = await checkServiceability(safePin, safeWeight, safeL, safeB, safeH);
            setEddData(data);
            if (onServiceableChange) {
                onServiceableChange(data?.serviceable ?? false);
            }
        } catch (_e) {
            console.error("Fetch Failed:", _e);
            if (onServiceableChange) onServiceableChange(false);
        } finally {
            setLoading(false);
        }
    }, [pincode, weight, length, breadth, height, onServiceableChange]);

    useEffect(() => {
        if (pincode && pincode.length === 6) {
            fetchEdd();
        } else {
            if (onServiceableChange) onServiceableChange(false);
        }
    }, [pincode, fetchEdd, onServiceableChange]);

    const handleSavePincode = () => {
        if (tempPin.length === 6) {
            setPincode(tempPin);
            setModalVisible(false);
            Keyboard.dismiss();
        }
    };

    const shippingFee = eddData?.shipping_fee ? Number(eddData.shipping_fee) : 0;

    return (
        <View style={styles.cardContainer}>
            {/* Header with Icon and Title */}
            <View style={styles.headerSection}>
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={['#4A90A4', '#357ABD']}
                        style={styles.iconGradient}
                    >
                        <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#fff" />
                    </LinearGradient>
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.sectionTitle}>Delivery</Text>
                    <Text style={styles.sectionSubtitle}>Check availability at your location</Text>
                </View>
            </View>

            {/* Pincode Selection Row */}
            <TouchableOpacity
                style={styles.pincodeRow}
                onPress={() => { setTempPin(pincode); setModalVisible(true); }}
                activeOpacity={0.7}
            >
                <View style={styles.pincodeInfo}>
                    <Ionicons name="location-outline" size={18} color="#666" />
                    <Text style={styles.deliverToText}>Deliver to</Text>
                    {pincode ? (
                        <View style={styles.pincodeBadge}>
                            <Text style={styles.pincodeValue}>{pincode}</Text>
                        </View>
                    ) : (
                        <Text style={styles.enterPinText}>Enter Pincode</Text>
                    )}
                </View>
                <View style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>{pincode ? 'CHANGE' : 'ADD'}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#4A90A4" />
                </View>
            </TouchableOpacity>

            {/* Delivery Status Section */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <View style={styles.shimmerBar} />
                    <View style={[styles.shimmerBar, { width: '60%', marginTop: 8 }]} />
                </View>
            ) : eddData ? (
                <View style={styles.resultSection}>
                    {eddData.serviceable ? (
                        <>
                            {/* Delivery Date */}
                            <View style={styles.deliveryDateRow}>
                                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                                <Text style={styles.deliveryDateText}>
                                    Get it by <Text style={styles.dateHighlight}>{eddData.display_date}</Text>
                                </Text>
                            </View>

                            {/* Feature Pills */}
                            <View style={styles.pillsContainer}>
                                <View style={[styles.featurePill, (isCod && eddData.cod_possible) ? styles.codAvailable : styles.prepaidOnly]}>
                                    <Ionicons
                                        name={(isCod && eddData.cod_possible) ? "cash-outline" : "card-outline"}
                                        size={14}
                                        color={(isCod && eddData.cod_possible) ? "#15803d" : "#7c3aed"}
                                    />
                                    <Text style={[
                                        styles.pillText,
                                        (isCod && eddData.cod_possible) ? styles.codText : styles.prepaidText
                                    ]}>
                                        {(isCod && eddData.cod_possible) ? "Cash on Delivery" : "Prepaid Only"}
                                    </Text>
                                </View>

                                <View style={[styles.featurePill, shippingFee === 0 ? styles.freeShipping : styles.paidShipping]}>
                                    <MaterialCommunityIcons
                                        name="truck-fast-outline"
                                        size={14}
                                        color={shippingFee === 0 ? "#16a34a" : "#ea580c"}
                                    />
                                    <Text style={[
                                        styles.pillText,
                                        shippingFee === 0 ? styles.freeText : styles.paidText
                                    ]}>
                                        {shippingFee === 0 ? "Free Delivery" : `₹${shippingFee} Delivery`}
                                    </Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.notServiceableContainer}>
                            <View style={styles.notServiceableIcon}>
                                <Ionicons name="close-circle" size={20} color="#dc2626" />
                            </View>
                            <View style={styles.notServiceableTextContainer}>
                                <Text style={styles.notServiceableTitle}>Not deliverable</Text>
                                <Text style={styles.notServiceableSubtitle}>
                                    Sorry, we do not deliver to {pincode} yet
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="location-outline" size={24} color="#9ca3af" />
                    <Text style={styles.emptyStateText}>
                        Enter your pincode to check delivery availability
                    </Text>
                </View>
            )}

            {/* Modal */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={() => { }}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Enter Delivery Pincode</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Check if we deliver to your area
                        </Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="location" size={20} color="#4A90A4" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 788001"
                                placeholderTextColor="#9ca3af"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={tempPin}
                                onChangeText={setTempPin}
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.applyButton, tempPin.length !== 6 && styles.applyButtonDisabled]}
                                onPress={handleSavePincode}
                                disabled={tempPin.length !== 6}
                            >
                                <Text style={[styles.applyText, tempPin.length !== 6 && styles.applyTextDisabled]}>
                                    Check Availability
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },

    // Header Section
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    iconGradient: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },

    // Pincode Row
    pincodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    pincodeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deliverToText: {
        fontSize: 14,
        color: '#64748b',
    },
    pincodeBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pincodeValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0369a1',
        letterSpacing: 1,
    },
    enterPinText: {
        fontSize: 14,
        color: '#4A90A4',
        fontWeight: '600',
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    changeButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A90A4',
        letterSpacing: 0.5,
    },

    // Loading State
    loadingContainer: {
        paddingVertical: 12,
    },
    shimmerBar: {
        height: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        width: '80%',
    },

    // Results Section
    resultSection: {
        marginTop: 4,
    },
    deliveryDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    deliveryDateText: {
        fontSize: 15,
        color: '#374151',
    },
    dateHighlight: {
        fontWeight: '700',
        color: '#16a34a',
    },

    // Feature Pills
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    codAvailable: {
        backgroundColor: '#dcfce7',
    },
    prepaidOnly: {
        backgroundColor: '#f3e8ff',
    },
    freeShipping: {
        backgroundColor: '#dcfce7',
    },
    paidShipping: {
        backgroundColor: '#ffedd5',
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    codText: {
        color: '#15803d',
    },
    prepaidText: {
        color: '#7c3aed',
    },
    freeText: {
        color: '#16a34a',
    },
    paidText: {
        color: '#ea580c',
    },

    // Not Serviceable
    notServiceableContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    notServiceableIcon: {
        marginRight: 12,
    },
    notServiceableTextContainer: {
        flex: 1,
    },
    notServiceableTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
    },
    notServiceableSubtitle: {
        fontSize: 12,
        color: '#b91c1c',
        marginTop: 2,
    },

    // Empty State
    emptyStateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    emptyStateText: {
        flex: 1,
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 360,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        marginBottom: 24,
    },
    inputIcon: {
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        paddingVertical: 16,
        paddingHorizontal: 12,
        color: '#1f2937',
        letterSpacing: 4,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#FFD700',
        alignItems: 'center',
    },
    applyButtonDisabled: {
        backgroundColor: '#e5e7eb',
    },
    applyText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
    applyTextDisabled: {
        color: '#9ca3af',
    },
});