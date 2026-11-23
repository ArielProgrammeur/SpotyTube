import { Tabs } from 'expo-router';
import {
  Compass,
  Server,
  SlidersHorizontal,
} from 'lucide-react-native';

import { colors } from '@/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,

        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.background.border,
          borderTopWidth: 1,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="servers"
        options={{
          title: 'Serveurs',
          tabBarIcon: ({ color, size }) => (
            <Server color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, size }) => (
            <SlidersHorizontal color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}