
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';

import { store } from '../store';
import { useAppSelector } from '@/store/hooks';

import AuthSessionManager from '@/features/auth/components/AuthSessionManager';

import { colors } from '@/theme/colors';

function RootNavigator() {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Protected
        guard={!isAuthenticated}
        redirectTo="/(tabs)"
      >
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected
        guard={isAuthenticated}
        redirectTo="/(auth)/login"
      >
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="player/[mediaId]"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="light" />

      <AuthSessionManager>
        <RootNavigator />
      </AuthSessionManager>
    </Provider>
  );
}
