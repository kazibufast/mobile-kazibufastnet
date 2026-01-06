import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(auth)/index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        
        {/* Tech tabs */}
        <Stack.Screen name="(tech-tabs)" options={{ headerShown: false }} />


        {/* Profile settings and user announcement */}
        <Stack.Screen name="ProfileSettings/AccountSettings" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSettings/PrivacySecurity" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSettings/HelpSupport" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSettings/AboutKazibufast" options={{ headerShown: false }} />

        <Stack.Screen name="tickets/[id]" options={{ headerShown: false }} />

        <Stack.Screen name="(time-in)/time-in" options={{ headerShown: false }} />
        <Stack.Screen name="(time-out)/time-out" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
