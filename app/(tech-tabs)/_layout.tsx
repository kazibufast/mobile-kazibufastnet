import { API } from '@/constants/api';
import { getToken, setToken } from '@/scripts/token';
import { setUser } from '@/scripts/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scaleSize = (size: number) => Math.round(size * (width / 375));

export default function TechTabsLayout() {
  const router = useRouter();
  const tabBarHeight = Platform.select({ ios: scaleSize(85), android: scaleSize(65) });
  const tabBarPaddingBottom = Platform.select({ ios: scaleSize(25), android: scaleSize(10) });
  const iconSize = scaleSize(24);

  const checkingRef = useRef(false);
  const checkAttendance = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API.tech.attendanceStatus(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401) {
        // Token expired — log out
        setToken(null);
        setUser(null);
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/(auth)/login');
        return;
      }
      if (!res.ok) return;

      const data = await res.json();
      const hour = new Date().getHours();
      if (!data.timed_in && !data.timed_out_today && hour >= 8 && hour < 13) {
        router.replace('/(time-in)/time-in');
      }
    } catch {}
    finally { checkingRef.current = false; }
  }, []);

  // Check on initial mount and every time tabs regain focus
  useFocusEffect(useCallback(() => { checkAttendance(); }, [checkAttendance]));

  // Also check when app comes back from background
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkAttendance();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [checkAttendance]);

  const technicianTabs = [
    { name: 'home', title: 'Home', icon: 'home-outline' },
    { name: 'team', title: 'Team', icon: 'people-outline' },
    { name: 'tickets', title: 'Tickets', icon: 'ticket-outline' },
    { name: 'naps', title: 'Naps', icon: 'git-network-outline' },
    { name: 'profile', title: 'Profile', icon: 'person-outline' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#00AF9F',
          tabBarInactiveTintColor: '#888',
          tabBarItemStyle: { justifyContent: 'center', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? scaleSize(5) : 0 },
          tabBarStyle: { height: tabBarHeight, paddingBottom: tabBarPaddingBottom, backgroundColor: '#fff' },
          tabBarLabelStyle: { fontSize: scaleSize(11), fontWeight: '500', marginTop: scaleSize(-5) },
          headerShown: false,
        }}
      >
        {technicianTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.title, tabBarIcon: ({ color }) => <Ionicons name={tab.icon as any} color={color} size={iconSize} /> }}
          />
        ))}
      </Tabs>
    </SafeAreaView>
  );
}
