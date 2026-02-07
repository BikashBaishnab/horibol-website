import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Dimensions } from '../../theme';

interface WebContainerProps {
    children: React.ReactNode;
}

/**
 * A wrapper component that provides a max-width and centering for the web platform.
 * It has no effect on mobile platforms.
 */
export const WebContainer = ({ children }: WebContainerProps) => {
    if (Platform.OS !== 'web') {
        return <>{children}</>;
    }

    return (
        <View style={styles.outerContainer}>
            <View style={styles.innerContainer}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        width: '100%',
        height: '100%', // Use height: 100% since root should have height
        backgroundColor: '#f1f3f5', // Modern light gray background for the gutter
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    innerContainer: {
        flex: 1,
        width: '100%',
        maxWidth: Dimensions.webMaxWidth, // Standard desktop max-width
        backgroundColor: '#ffffff',
        // Shadow or border to distinguish the app area from the gutter
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
});
