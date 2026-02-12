import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatedSplashScreen, WebContainer } from '../components/common';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { UserLocationProvider } from '../context/UserLocationContext';
import "../global.css";
import { registerForPushNotificationsAsync } from '../services/notification.service';

export default function RootLayout() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
    ...Feather.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push Token Initialized:', token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const isAppReady = isSplashFinished && (fontsLoaded || !!fontError);

  if (!isAppReady) {
    return <AnimatedSplashScreen onAnimationFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <PostHogProvider
      apiKey="phc_q3NV8nF8rbYBd6iIZynr3uATQla77YLZMGitoTFl8dn" // The key from your screenshot
      options={{
        host: "https://us.i.posthog.com", // You confirmed you are using US
        enableSessionReplay: true, // Enables the video recording
        sessionReplayConfig: {
          maskAllTextInputs: true, // Hides passwords/credit card numbers automatically
          maskAllImages: false,    // Keeps your product images visible in the replay
        }
      }}
    >
      <WebContainer>
        <AuthProvider>
          <UserLocationProvider>
            <CartProvider>
              <ToastProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
                </Stack>
              </ToastProvider>
            </CartProvider>
          </UserLocationProvider>
        </AuthProvider>
      </WebContainer>
    </PostHogProvider>
  );
}