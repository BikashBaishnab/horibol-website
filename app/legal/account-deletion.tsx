import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/common';
import { LegalLayout, LegalSection } from '../../components/legal';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../../theme';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

type ScreenState = 'INPUT' | 'VERIFY' | 'SUCCESS';

export default function AccountDeletionScreen() {
    const router = useRouter();
    const [state, setState] = useState<ScreenState>('INPUT');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cleanedIdentifier, setCleanedIdentifier] = useState('');

    // Call the delete-account edge function
    const callEdgeFunction = async (body: Record<string, string | null>) => {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong. Please try again.');
        }
        return data;
    };

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        if (!identifier.trim()) {
            setError('Please enter your email or phone number.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await callEdgeFunction({
                action: 'send-otp',
                identifier: identifier.trim(),
                reason: reason.trim() || null,
            });

            setCleanedIdentifier(result.identifier || identifier.trim());
            setState('VERIFY');
        } catch (err: any) {
            console.error('Send OTP error:', err);
            setError(err.message || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and delete account
    const handleVerifyAndDelete = async () => {
        if (!otp.trim() || otp.length < 6) {
            setError('Please enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await callEdgeFunction({
                action: 'verify-otp',
                identifier: cleanedIdentifier,
                otp: otp.trim(),
            });

            setState('SUCCESS');
        } catch (err: any) {
            console.error('Verify OTP error:', err);
            setError(err.message || 'Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (state === 'SUCCESS') {
        return (
            <LegalLayout title="Account Deleted">
                <View style={styles.successContainer}>
                    <MaterialCommunityIcons name="shield-check-outline" size={80} color={Colors.semantic.success} />
                    <Text style={styles.successTitle}>Account Deleted</Text>
                    <Text style={styles.successText}>
                        Your account and all associated personal data have been permanently deleted. This action cannot be undone.
                    </Text>
                    <Button
                        title="Back to Horibol"
                        onPress={() => router.replace('/')}
                        variant="primary"
                        style={styles.doneButton}
                    />
                </View>
            </LegalLayout>
        );
    }

    return (
        <LegalLayout title="Delete Account">
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, state === 'VERIFY' ? { width: '66%' } : { width: '33%' }]} />
            </View>

            {state === 'INPUT' ? (
                <>
                    <LegalSection
                        content="Enter your registered email or phone number to initiate secure account deletion. We will send you a verification code via WhatsApp or email."
                    />

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email or Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. user@example.com or 9876543210"
                                value={identifier}
                                onChangeText={(text) => {
                                    setIdentifier(text);
                                    if (error) setError(null);
                                }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            {error && <Text style={styles.errorText}>{error}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Reason for leaving (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell us how we can improve..."
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.warningBox}>
                            <MaterialCommunityIcons name="alert-outline" size={20} color="#856404" />
                            <Text style={styles.warningText}>
                                Warning: This action is permanent and irreversible. All your data including profile, orders, addresses, and wishlist will be permanently deleted.
                            </Text>
                        </View>

                        <Button
                            title="Send Verification Code"
                            onPress={handleSendOtp}
                            loading={loading}
                            variant="primary"
                            style={styles.submitButton}
                        />
                    </View>
                </>
            ) : (
                <>
                    <LegalSection
                        title="Verify your identity"
                        content={`We've sent a 6-digit verification code to ${identifier}. Please enter it below to confirm the deletion of your account.`}
                    />

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Verification Code</Text>
                            <TextInput
                                style={[styles.input, styles.otpInput]}
                                placeholder="0 0 0 0 0 0"
                                value={otp}
                                onChangeText={(text) => {
                                    setOtp(text.replace(/[^0-9]/g, ''));
                                    if (error) setError(null);
                                }}
                                maxLength={6}
                                keyboardType="number-pad"
                            />
                            {error && <Text style={styles.errorText}>{error}</Text>}
                        </View>

                        <Button
                            title="Verify & Delete Account"
                            onPress={handleVerifyAndDelete}
                            loading={loading}
                            variant="primary"
                            style={styles.submitButton}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                setState('INPUT');
                                setOtp('');
                                setError(null);
                            }}
                            style={styles.backLink}
                            disabled={loading}
                        >
                            <Text style={styles.backLinkText}>Change Email or Phone</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <LegalSection
                title="Google Play Compliance"
                items={[
                    "You do not need to be logged in or have the app installed.",
                    "Your identity is verified using a one-time code sent to your WhatsApp or email.",
                    "All personal data is permanently deleted upon verification.",
                    "This process is compliant with Google Play data safety requirements."
                ]}
            />
        </LegalLayout>
    );
}

const styles = StyleSheet.create({
    form: {
        backgroundColor: Colors.background.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border.light,
        marginBottom: Spacing.xl,
    },
    progressContainer: {
        height: 4,
        backgroundColor: Colors.background.secondary,
        borderRadius: 2,
        marginBottom: Spacing.xl,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text.primary,
        borderWidth: 1,
        borderColor: Colors.border.light,
    },
    otpInput: {
        textAlign: 'center',
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        letterSpacing: 8,
        paddingVertical: Spacing.lg,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: Colors.semantic.error,
        fontSize: FontSize.xs,
        marginTop: 4,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFBE6',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: '#FFE58F',
        gap: Spacing.sm,
    },
    warningText: {
        flex: 1,
        fontSize: FontSize.xs,
        color: '#856404',
        lineHeight: 18,
    },
    submitButton: {
        marginTop: Spacing.sm,
    },
    backLink: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    backLinkText: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.huge,
    },
    successTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.text.primary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    successText: {
        fontSize: FontSize.md,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.xxxl,
    },
    doneButton: {
        width: '100%',
        maxWidth: 200,
    },
});
