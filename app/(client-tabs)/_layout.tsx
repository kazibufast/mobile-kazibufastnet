import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scaleSize = (size: number) => Math.round(size * (width / 375));

export default function ClientTabsLayout() {
  const tabBarHeight = Platform.select({ ios: scaleSize(85), android: scaleSize(65) });
  const tabBarPaddingBottom = Platform.select({ ios: scaleSize(25), android: scaleSize(10) });
  const iconSize = scaleSize(24);

  const clientTabs = [
    { name: 'home', title: 'Home', icon: 'home-outline' },
    { name: 'subscription', title: 'Subscription', icon: 'receipt-outline' },
    { name: 'billing', title: 'Billing', icon: 'card-outline' },
    { name: 'promo', title: 'Promo', icon: 'pricetag-outline' },
    { name: 'ticket', title: 'Ticket', icon: 'ticket-outline' },
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
        {clientTabs.map((tab) => (
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
