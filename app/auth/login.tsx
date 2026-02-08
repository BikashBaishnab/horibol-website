import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithGoogle, signInWithPhone } from '../../services/auth.service';

export default function LoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

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

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            router.replace('/(tabs)');
        } catch (error: any) {
            if (error.code !== 'ASYNC_OP_IN_PROGRESS') {
                Alert.alert("Google Sign-In Error", error.message || "Failed to sign in with Google.");
            }
        } finally {
            setGoogleLoading(false);
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
                            />
                        </View>
                    </View>

                    {/* WhatsApp OTP Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSendOtp}
                        disabled={loading || googleLoading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <View style={styles.row}>
                                <Ionicons name="logo-whatsapp" size={20} color="#000" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Login using WhatsApp OTP</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Separator */}
                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>OR</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    {/* Social Buttons */}
                    <View style={styles.socialContainer}>
                        {/* Google Button */}
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleGoogleSignIn}
                            disabled={loading || googleLoading}
                        >
                            {googleLoading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <View style={styles.row}>
                                    <Image
                                        source={require('../../assets/images/google_logo.png')}
                                        style={styles.socialIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

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

    logoContainer: { marginBottom: 30 },
    brandTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666' },

    inputWrapper: { marginBottom: 20 },
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

    row: { flexDirection: 'row', alignItems: 'center' },

    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#eee',
    },
    separatorText: {
        marginHorizontal: 10,
        color: '#999',
        fontSize: 14,
        fontWeight: '500'
    },

    socialContainer: {
        gap: 12,
        marginBottom: 30
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff'
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333'
    },

    termsText: { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },
    link: { color: '#FFD700', fontWeight: 'bold' }
});