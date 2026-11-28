
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/theme/colors';

import { tokenStorage } from '@/core/storage/tokenStorage';
import { getApiErrorMessage } from '@/core/api/apiErrors';

import { authApi } from '@/features/auth/services/authApi';

import {
  clearAuth,
  setLoading,
  setSessionError,
  setUser,
} from '@/features/auth/slices/authSlice';

import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface AuthSessionManagerProps {
  readonly children: ReactNode;
}

function isHttpStatus(
  error: unknown,
  ...expectedStatuses: number[]
): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if (!('status' in error)) {
    return false;
  }

  const status = error.status;

  return (
    typeof status === 'number' &&
    expectedStatuses.includes(status)
  );
}

export default function AuthSessionManager({
  children,
}: AuthSessionManagerProps) {
  const dispatch = useAppDispatch();

  const status = useAppSelector((state) => state.auth.status);
  const sessionError = useAppSelector(
    (state) => state.auth.sessionError,
  );

  const [retryCount, setRetryCount] = useState(0);

  const restorationInProgress = useRef(false);

  useEffect(() => {
    if (restorationInProgress.current) {
      return;
    }

    restorationInProgress.current = true;
    dispatch(setLoading());

    const restoreSession = async (): Promise<void> => {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          tokenStorage.getAccessToken(),
          tokenStorage.getRefreshToken(),
        ]);

        if (!refreshToken) {
          await tokenStorage.clearTokens().catch(() => undefined);
          dispatch(clearAuth());
          return;
        }

        if (accessToken) {
          try {
            const user = await dispatch(
              authApi.endpoints.me.initiate(undefined, {
                forceRefetch: true,
              }),
            ).unwrap();

            dispatch(setUser(user));
            return;
          } catch (error: unknown) {
            if (!isHttpStatus(error, 401)) {
              dispatch(
                setSessionError(
                  getApiErrorMessage(
                    error,
                    'Impossible de vérifier votre session. Vérifiez votre connexion puis réessayez.',
                  ),
                ),
              );
              return;
            }
          }
        }

        try {
          const refreshedTokens = await dispatch(
            authApi.endpoints.refresh.initiate(refreshToken),
          ).unwrap();

          await tokenStorage.saveTokens(
            refreshedTokens.access_token,
            refreshedTokens.refresh_token,
          );

          const user = await dispatch(
            authApi.endpoints.me.initiate(undefined, {
              forceRefetch: true,
            }),
          ).unwrap();

          dispatch(setUser(user));
        } catch (error: unknown) {
          if (isHttpStatus(error, 401, 403)) {
            await tokenStorage.clearTokens().catch(() => undefined);
            dispatch(clearAuth());
            return;
          }

          dispatch(
            setSessionError(
              getApiErrorMessage(
                error,
                'Impossible de restaurer votre session. Vérifiez votre connexion puis réessayez.',
              ),
            ),
          );
        }
      } catch (error: unknown) {
        dispatch(
          setSessionError(
            getApiErrorMessage(
              error,
              'Une erreur est survenue pendant la restauration de votre session.',
            ),
          ),
        );
      }
    };

    void restoreSession().finally(() => {
      restorationInProgress.current = false;
    });
  }, [dispatch, retryCount]);

  const continueToLogin = () => {
    dispatch(clearAuth());
  };

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.brand.primary}
        />

        <Text style={styles.message}>
          Vérification de votre session...
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Impossible de restaurer votre session
        </Text>

        <Text style={styles.message}>
          {sessionError}
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => setRetryCount((count) => count + 1)}
        >
          <Text style={styles.primaryButtonText}>
            Réessayer
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={continueToLogin}
        >
          <Text style={styles.secondaryButtonText}>
            Aller à la connexion
          </Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  message: {
    color: colors.text.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  primaryButton: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  secondaryButton: {
    width: '100%',
    padding: 14,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: colors.text.muted,
    fontSize: 14,
  },
});
