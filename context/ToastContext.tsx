import React, { createContext, useCallback, useContext, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('success');
    const [visible, setVisible] = useState(false);
    const opacity = useState(new Animated.Value(0))[0];
    const translateY = useState(new Animated.Value(20))[0];
    const insets = useSafeAreaInsets();

    const showToast = useCallback((msg: string, toastType: ToastType = 'success') => {
        setMessage(msg);
        setType(toastType);
        setVisible(true);

        // Animate in
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide
        setTimeout(() => {
            hideToast();
        }, 3000);
    }, [opacity, translateY]);

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
        });
    }, [opacity, translateY]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'info': return Colors.primary;
            default: return '#333';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        {
                            backgroundColor: getBackgroundColor(),
                            opacity,
                            transform: [{ translateY }],
                            bottom: insets.bottom + 60,
                        },
                    ]}
                >
                    <Text style={styles.toastText}>{message}</Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        left: Spacing.lg,
        right: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.md,
        zIndex: 9999,
    },
    toastText: {
        color: '#FFFFFF',
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        textAlign: 'center',
    },
});
