
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  ChevronRight,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';

import { colors } from '@/theme/colors';

import { baseApi } from '@/core/api/baseApi';
import { tokenStorage } from '@/core/storage/tokenStorage';

import { useLogoutMutation } from '@/features/auth/services/authApi';
import { clearAuth } from '@/features/auth/slices/authSlice';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const [logout, { isLoading }] = useLogoutMutation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const performLogout = async (): Promise<void> => {
    setIsSigningOut(true);

    let refreshToken: string | null = null;
    let remoteSessionRevoked = false;

    try {
      // 1. Retrieve the refresh token.
      refreshToken = await tokenStorage.getRefreshToken();

      // 2. Revoke the session on the backend when possible.
      if (refreshToken) {
        try {
          await logout(refreshToken).unwrap();
          remoteSessionRevoked = true;
        } catch {
          // Local logout must still work without network access.
        }
      }

      // 3. Clear locally stored tokens.
      await tokenStorage.clearTokens().catch(() => undefined);

      // 4. Reset Redux authentication state.
      dispatch(clearAuth());

      // 5. Clear cached API data, including user-specific data.
      dispatch(baseApi.util.resetApiState());

      // 6. Return to the login screen.
      router.replace('/(auth)/login');

      // Inform the user when server-side revocation could not
      // be confirmed because of a network or server error.
      if (refreshToken && !remoteSessionRevoked) {
        Alert.alert(
          'Déconnexion locale effectuée',
          "Votre session a été supprimée de cet appareil, mais le serveur n'a pas confirmé sa révocation. Reconnectez-vous au réseau pour vérifier la situation.",
        );
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmLogout = (): void => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter de SpotyTube ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => {
            void performLogout();
          },
        },
      ],
    );
  };

  const busy = isLoading || isSigningOut;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CONFIGURATION</Text>
        <Text style={styles.title}>Réglages</Text>
        <Text style={styles.description}>
          Gérez votre compte et les paramètres de SpotyTube.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MON COMPTE</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <UserRound
              size={25}
              color={colors.brand.primary}
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.username}>
              {user?.username ?? 'Utilisateur'}
            </Text>

            <Text style={styles.email}>
              {user?.email ?? 'Adresse e-mail non disponible'}
            </Text>

            <Text style={styles.accountStatus}>
              {user?.isVerified
                ? 'Compte vérifié'
                : 'Compte non vérifié'}
            </Text>
          </View>

          <ShieldCheck
            size={21}
            color={colors.brand.primary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PRÉFÉRENCES</Text>

        <View style={styles.optionCard}>
          <View style={styles.optionIcon}>
            <ShieldCheck
              size={21}
              color={colors.brand.primary}
            />
          </View>

          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              Sécurité et session
            </Text>
            <Text style={styles.optionDescription}>
              Gestion de votre session utilisateur
            </Text>
          </View>

          <ChevronRight
            size={20}
            color={colors.text.muted}
          />
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionIcon}>
            <UserRound
              size={21}
              color={colors.brand.primary}
            />
          </View>

          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              Transcodage et lecture
            </Text>
            <Text style={styles.optionDescription}>
              Configuration prochainement disponible
            </Text>
          </View>

          <ChevronRight
            size={20}
            color={colors.text.muted}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SESSION</Text>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}
          onPress={confirmLogout}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter de SpotyTube"
        >
          {busy ? (
            <ActivityIndicator
              size="small"
              color={colors.status.error}
            />
          ) : (
            <LogOut
              size={20}
              color={colors.status.error}
            />
          )}

          <Text style={styles.logoutText}>
            {busy ? 'Déconnexion...' : 'Se déconnecter'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          SpotyTube · Version 1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 20,
  },

  header: {
    marginBottom: 30,
  },

  eyebrow: {
    color: colors.brand.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 10,
  },

  title: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },

  description: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
  },

  section: {
    marginBottom: 27,
  },

  sectionTitle: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.background.border,
    gap: 13,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },

  profileInfo: {
    flex: 1,
  },

  username: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },

  email: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 5,
  },

  accountStatus: {
    color: colors.brand.primary,
    fontSize: 11,
    fontWeight: '600',
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.background.border,
    marginBottom: 9,
    gap: 12,
  },

  optionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.background.primary,
  },

  optionInfo: {
    flex: 1,
  },

  optionTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  optionDescription: {
    color: colors.text.muted,
    fontSize: 11,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.status.error,
    backgroundColor: colors.background.secondary,
  },

  logoutText: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.5,
  },

  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 15,
  },

  footerText: {
    color: colors.text.muted,
    fontSize: 11,
  },
});
