import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator, Alert,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithPhone, verifyOtp } from '../../services/auth.service';

export default function OtpVerificationScreen() {
    const router = useRouter();
    const { phone } = useLocalSearchParams(); // Get phone passed from previous screen

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    // Refs to manage focus jumping
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        // If all filled, verify automatically? Optional.
    };

    const handleBackspace = (text: string, index: number) => {
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            Alert.alert("Invalid Code", "Please enter the full 6-digit code.");
            return;
        }

        setLoading(true);
        try {
            await verifyOtp(phone as string, code);

            // SUCCESS! Go back to Cart or Home
            // 'router.dismissAll()' or 'router.replace' clears history
            router.dismissAll();
            router.replace('/(tabs)/cart');
        } catch (error: any) {
            Alert.alert("Verification Failed", "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await signInWithPhone(phone as string);
            Alert.alert("Sent", "OTP has been resent to your WhatsApp.");
        } catch (e) {
            Alert.alert("Error", "Could not resend OTP.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>OTP Verification</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.instructions}>
                    We have sent a verification code to your WhatsApp
                </Text>
                <Text style={styles.phoneNumber}>{phone}</Text>

                {/* OTP Inputs */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            // FIX: Added curly braces { } to satisfy TypeScript
                            ref={(ref) => { inputs.current[index] = ref; }}
                            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    handleBackspace(digit, index);
                                }
                            }}
                        />
                    ))}
                </View>

                <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendText}>Didn&apos;t get OTP? <Text style={styles.resendLink}>Resend SMS</Text></Text>
                </TouchableOpacity>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.buttonText}>Verify & Proceed</Text>
                    )}
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16 },

    content: { padding: 24, alignItems: 'center', marginTop: 20 },
    instructions: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 8 },
    phoneNumber: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 40 },

    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
    otpInput: {
        width: 45, height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        textAlign: 'center', fontSize: 20, backgroundColor: '#f9f9f9', color: '#000'
    },
    otpInputFilled: { borderColor: '#FFD700', backgroundColor: '#fff' },

    resendText: { color: '#666', marginBottom: 30 },
    resendLink: { color: 'red', fontWeight: 'bold' },

    button: {
        backgroundColor: '#FFD700', paddingVertical: 16, borderRadius: 8, alignItems: 'center', width: '100%'
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});