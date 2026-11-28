
import { Redirect } from 'expo-router';

import { useAppSelector } from '@/store/hooks';

export default function Index() {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );

  return (
    <Redirect
      href={
        isAuthenticated
          ? '/(tabs)'
          : '/(auth)/login'
      }
    />
  );
}
