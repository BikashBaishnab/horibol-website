import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

/**
 * Sanitizes and formats phone number to E.164 format with +91 prefix
 */
const sanitizePhone = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-()]/g, '');

    if (cleaned.startsWith('+91')) {
        // Already formatted
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = '+91' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+91' + cleaned;
    }

    return cleaned;
};

/**
 * Sign in with phone number - sends OTP via SMS
 */
export const signInWithPhone = async (phone: string): Promise<{ success: boolean; phone: string }> => {
    try {
        const formattedPhone = sanitizePhone(phone);

        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: {
                channel: 'sms',
                shouldCreateUser: true
            }
        });

        if (error) throw error;

        return { success: true, phone: formattedPhone };
    } catch (error: any) {
        console.error('Login Error:', error.message);
        throw error;
    }
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (phone: string, token: string) => {
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: phone,
            token: token,
            type: 'sms',
        });

        if (error) throw error;

        return data.session;
    } catch (error: any) {
        console.error('Verification Error:', error.message);
        throw error;
    }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
    try {
        if (Platform.OS === 'web') {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
            return data;
        } else {
            // Mobile Native Flow
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: userInfo.data.idToken,
                });
                if (error) throw error;
                return data;
            } else {
                throw new Error('No ID token present!');
            }
        }
    } catch (error: any) {
        console.error('Google Sign-In Error:', error.message);
        throw error;
    }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
    if (Platform.OS !== 'web') {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            // Ignore sign out errors if not signed in with Google
        }
    }
    await supabase.auth.signOut();
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * Get current session
 */
export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};
