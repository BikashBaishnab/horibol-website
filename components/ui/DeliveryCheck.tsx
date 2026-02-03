import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

    useEffect(() => {
        if (pincode && pincode.length === 6) {
            fetchEdd();
        } else {
            if (onServiceableChange) onServiceableChange(false);
        }
    }, [pincode]);

    const fetchEdd = async () => {
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
        } catch (e) {
            console.error("Fetch Failed:", e);
            if (onServiceableChange) onServiceableChange(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePincode = () => {
        if (tempPin.length === 6) {
            setPincode(tempPin);
            setModalVisible(false);
            Keyboard.dismiss();
        }
    };

    // FIX: Calculate shipping fee safely to avoid "₹undefined"
    const shippingFee = eddData?.shipping_fee ? Number(eddData.shipping_fee) : 0;

    return (
        <View style={styles.cardContainer}>
            {/* Header Section - ORIGINAL LAYOUT RESTORED */}
            <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color="#333" />
                    <Text style={styles.title}>Delivery to</Text>
                </View>

                <TouchableOpacity
                    style={styles.changeBtn}
                    onPress={() => { setTempPin(pincode); setModalVisible(true); }}
                >
                    <Text style={styles.pincodeText}>{pincode || "Enter Pincode"}</Text>
                    <Text style={styles.changeText}>CHANGE</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Status Section */}
            {loading ? (
                <View style={styles.statusRow}>
                    <ActivityIndicator size="small" color="#FFD700" />
                    <Text style={styles.loadingText}>Checking delivery dates...</Text>
                </View>
            ) : eddData ? (
                <View style={styles.resultContainer}>
                    {eddData.serviceable ? (
                        <View style={styles.successBlock}>
                            <Text style={styles.deliveryDate}>
                                Get it by <Text style={styles.boldDate}>{eddData.display_date}</Text>
                            </Text>
                            <View style={styles.badgesRow}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {(isCod && eddData.cod_possible) ? "Cash on Delivery" : "Prepaid Only"}
                                    </Text>
                                </View>
                                {/* FIX: Show Free or Price correctly */}
                                <View style={[styles.badge, { backgroundColor: shippingFee === 0 ? '#e8f5e9' : '#fff3e0' }]}>
                                    <Text style={[styles.badgeText, { color: shippingFee === 0 ? 'green' : '#e65100' }]}>
                                        {shippingFee === 0 ? "Free Delivery" : `Delivery: ₹${shippingFee}`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.errorRow}>
                            <Ionicons name="alert-circle" size={20} color="#d32f2f" />
                            <Text style={styles.errorText}>Not deliverable to {pincode}</Text>
                        </View>
                    )}
                </View>
            ) : (
                <Text style={styles.hintText}>Enter pincode to see delivery options</Text>
            )}

            {/* Modal */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Delivery Pincode</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 788001"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={tempPin}
                            onChangeText={setTempPin}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 20 }}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={handleSavePincode}>
                                <Text style={styles.applyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 14, color: '#666', marginLeft: 8, fontWeight: '500' },
    changeBtn: { flexDirection: 'row', alignItems: 'center' },
    pincodeText: { fontSize: 14, fontWeight: 'bold', color: '#000', marginRight: 8 },
    changeText: { fontSize: 12, color: '#007AFF', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 12 },

    statusRow: { flexDirection: 'row', alignItems: 'center' },
    loadingText: { marginLeft: 10, color: '#666', fontSize: 13 },

    resultContainer: {},
    successBlock: {},
    deliveryDate: { fontSize: 15, color: '#333', marginBottom: 8 },
    boldDate: { fontWeight: 'bold', color: '#000' },

    badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    badge: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeText: { fontSize: 11, color: '#555', fontWeight: '600' },

    errorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', padding: 8, borderRadius: 6 },
    errorText: { color: '#d32f2f', marginLeft: 6, fontWeight: '600', fontSize: 13 },
    hintText: { color: '#999', fontSize: 13, fontStyle: 'italic' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 24, textAlign: 'center', letterSpacing: 2 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
    cancelText: { color: '#666', fontWeight: '600', fontSize: 16 },
    applyBtn: { backgroundColor: '#FFD700', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 8 },
    applyText: { fontWeight: 'bold', color: '#000', fontSize: 16 }
});