import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // Added Stack import
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert,
    Keyboard,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addUserAddress } from '../../services/address.service';

export default function AddAddressScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        name: '',
        phone: '',
        pincode: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        is_default: false
    });

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSave = async () => {
        // Basic Validation
        if (!form.name || !form.phone || !form.pincode || !form.address_line1 || !form.city || !form.state) {
            Alert.alert('Missing Details', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await addUserAddress(form);
            Alert.alert('Success', 'Address saved successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* 1. HIDE DEFAULT HEADER */}
                <Stack.Screen options={{ headerShown: false }} />

                {/* 2. CUSTOM PROFESSIONAL HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Address</Text>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.formContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        <Text style={styles.sectionLabel}>Contact Details</Text>
                        <TextInput
                            placeholder="Full Name (Required)*"
                            style={styles.input}
                            value={form.name}
                            onChangeText={(t) => handleChange('name', t)}
                        />
                        <TextInput
                            placeholder="Phone Number (Required)*"
                            style={styles.input}
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={form.phone}
                            onChangeText={(t) => handleChange('phone', t)}
                        />

                        <Text style={styles.sectionLabel}>Address Details</Text>
                        <View style={styles.row}>
                            <TextInput
                                placeholder="Pincode*"
                                style={[styles.input, styles.halfInput]}
                                keyboardType="number-pad"
                                maxLength={6}
                                value={form.pincode}
                                onChangeText={(t) => handleChange('pincode', t)}
                            />
                            <TextInput
                                placeholder="City*"
                                style={[styles.input, styles.halfInput]}
                                value={form.city}
                                onChangeText={(t) => handleChange('city', t)}
                            />
                        </View>

                        <TextInput
                            placeholder="State (Required)*"
                            style={styles.input}
                            value={form.state}
                            onChangeText={(t) => handleChange('state', t)}
                        />

                        <TextInput
                            placeholder="House No., Building Name (Required)*"
                            style={styles.input}
                            value={form.address_line1}
                            onChangeText={(t) => handleChange('address_line1', t)}
                        />

                        <TextInput
                            placeholder="Road Name, Area, Colony (Optional)"
                            style={styles.input}
                            value={form.address_line2}
                            onChangeText={(t) => handleChange('address_line2', t)}
                        />

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* 3. STICKY FOOTER */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Address</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff'
    },
    backButton: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },

    formContainer: { padding: 20, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12, marginTop: 8
    },

    input: {
        borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
        paddingVertical: 14, paddingHorizontal: 16, fontSize: 16,
        marginBottom: 16, backgroundColor: '#fff', color: '#000'
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInput: { width: '48%' },

    footer: {
        padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0',
        backgroundColor: '#fff', elevation: 5 // Shadow for Android
    },
    saveButton: {
        backgroundColor: '#FFD700', borderRadius: 8, paddingVertical: 16, alignItems: 'center'
    },
    saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' }
});