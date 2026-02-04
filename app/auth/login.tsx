import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithPhone } from '../../services/auth.service';

export default function LoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleOpenPolicy = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error('Error opening policy:', error);
        }
    };

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number.");
            return;
        }

        setLoading(true);
        try {
            const result = await signInWithPhone(phone);
            // Navigate to OTP screen and pass the formatted phone number
            router.push({
                pathname: '/auth/otp',
                params: { phone: result.phone }
            });
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>

                    {/* Logo / Branding */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.brandTitle}>Horibol</Text>
                        <Text style={styles.subtitle}>Log In / Sign Up to continue</Text>
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Enter your phone number</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.prefix}>+91</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="9876543210"
                                keyboardType="number-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={setPhone}
                                autoFocus
                            />
                        </View>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.buttonText}>Login using WhatsApp OTP</Text>
                        )}
                    </TouchableOpacity>

                    {/* Footer Terms */}
                    <Text style={styles.termsText}>
                        By continuing, you confirm that you are above 18 years of age and agree to Horibol&apos;s{' '}
                        <Text
                            style={styles.link}
                            onPress={() => handleOpenPolicy('https://www.horibol.com/terms-and-conditions')}
                        >
                            Terms
                        </Text>
                        {' '}and{' '}
                        <Text
                            style={styles.link}
                            onPress={() => handleOpenPolicy('https://www.horibol.com/privacy-policy')}
                        >
                            Privacy Policy
                        </Text>.
                    </Text>

                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, padding: 24, justifyContent: 'center' },

    logoContainer: { marginBottom: 40 },
    brandTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666' },

    inputWrapper: { marginBottom: 30 },
    label: { fontSize: 14, color: '#333', marginBottom: 12 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 16, height: 50, backgroundColor: '#f9f9f9'
    },
    prefix: { fontSize: 16, fontWeight: 'bold', color: '#000', marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#000', height: '100%' },

    button: {
        backgroundColor: '#FFD700', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },

    termsText: { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },
    link: { color: '#FFD700', fontWeight: 'bold' } // Using Yellow for links as generic color
});