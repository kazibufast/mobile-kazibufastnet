import { API } from '@/constants/api';
import { getToken } from '@/scripts/token';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scaleSize = (size: number) => Math.round(size * (width / 375));

export default function TechTabsLayout() {
  const router = useRouter();
  const tabBarHeight = Platform.select({ ios: scaleSize(85), android: scaleSize(65) });
  const tabBarPaddingBottom = Platform.select({ ios: scaleSize(25), android: scaleSize(10) });
  const iconSize = scaleSize(24);

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const token = await getToken();
        // Always call attendanceStatus — backend auto-closes stale records from previous days
        const res = await fetch(API.tech.attendanceStatus(), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        // Only redirect to time-in between 8am–1pm
        const hour = new Date().getHours();
        if (!data.timed_in && hour >= 8 && hour < 13) {
          router.replace('/(time-in)/time-in');
        }
      } catch {}
    };

    checkAttendance();
  }, []);

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
