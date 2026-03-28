import { ToastProvider } from '@/components/Toast';
import { initApiBaseUrl } from '@/constants/api';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initApiBaseUrl().then(() => {
      setReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tech-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="tickets" options={{ headerShown: false }} />
          <Stack.Screen name="naps" options={{ headerShown: false }} />
          <Stack.Screen name="add-ticket" options={{ headerShown: false }} />
          <Stack.Screen name="ProfileSettings/AccountSettings" options={{ headerShown: false }} />
          <Stack.Screen name="ProfileSettings/PrivacySecurity" options={{ headerShown: false }} />
          <Stack.Screen name="ProfileSettings/HelpSupport" options={{ headerShown: false }} />
          <Stack.Screen name="ProfileSettings/AboutKazibufast" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
