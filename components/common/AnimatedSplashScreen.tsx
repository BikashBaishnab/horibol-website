import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Colors } from '../../theme';

const { width, height } = Dimensions.get('window');
const LOGO = require('../../assets/images/horibol_logo.png');

interface AnimatedSplashScreenProps {
    onAnimationFinish: () => void;
}

const AnimatedSplashScreen = ({ onAnimationFinish }: AnimatedSplashScreenProps) => {
    const scale = useSharedValue(0.3);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Logo animation
        scale.value = withSpring(1, { damping: 12, stiffness: 90 });
        opacity.value = withTiming(1, { duration: 1000 });

        // Finish animation
        const timeout = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 500 }, () => {
                // Run on JS thread
                'worklet';
            });
            setTimeout(onAnimationFinish, 500);
        }, 2500);

        return () => clearTimeout(timeout);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Animated.View style={[styles.logoContainer, logoStyle]}>
                <Image
                    source={LOGO}
                    style={styles.logo}
                    contentFit="contain"
                />
            </Animated.View>

            {/* Subtle background pattern/elements could go here */}
            <View style={styles.topCircle} />
            <View style={styles.bottomCircle} />
        </View>
    );
};

export default AnimatedSplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary, // #FFD700 Gold
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 150,
        height: 150,
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    logo: {
        width: 100,
        height: 100,
    },
    topCircle: {
        position: 'absolute',
        top: -width * 0.2,
        right: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    bottomCircle: {
        position: 'absolute',
        bottom: -width * 0.3,
        left: -width * 0.3,
        width: width,
        height: width,
        borderRadius: width * 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
});
