import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="setup-pin" options={{ headerShown: false }} />
        <Stack.Screen name="mpin-login" options={{ headerShown: false }} />

        <Stack.Screen name="tabs-redirect" options={{ headerShown: false }} />

        <Stack.Screen name="(tech-tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="ProfileSettings/AccountSettings" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSettings/PrivacySecurity" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSettings/HelpSupport" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSettings/AboutKazibufast" options={{ headerShown: false }} />
        <Stack.Screen name="UserAnnouncement/seeAllAnnouncements" options={{ headerShown: false }} />
        <Stack.Screen name="UserAnnouncement/seeAllUpcomingBills" options={{ headerShown: false }} />
        <Stack.Screen name="add-ticket" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
