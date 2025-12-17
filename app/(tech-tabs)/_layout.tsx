import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scaleSize = (size: number) => Math.round(size * (width / 375));

export default function TechTabsLayout() {
  const tabBarHeight = Platform.select({ ios: scaleSize(85), android: scaleSize(55) });
  const tabBarPaddingBottom = Platform.select({ ios: scaleSize(25), android: scaleSize(5) });
  const iconSize = scaleSize(24);

  const technicianTabs = [
    { name: 'home', title: 'Home', icon: 'home-outline' },
    { name: 'team', title: 'Team', icon: 'people-outline' },
    { name: 'tickets', title: 'Tickets', icon: 'ticket-outline' },
    { name: 'profile', title: 'Profile', icon: 'person-outline' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#00AF9F',
          tabBarInactiveTintColor: '#888',
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? scaleSize(5) : 0
          },
          tabBarStyle: {
            height: tabBarHeight,
            paddingBottom: tabBarPaddingBottom,
            backgroundColor: '#fff',    
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 0,
            elevation: 0,          
            borderTopWidth: 0        
          },
          tabBarLabelStyle: {
            fontSize: scaleSize(11),
            fontWeight: '500',
            marginTop: scaleSize(-5)
          },
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
