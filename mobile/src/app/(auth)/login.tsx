
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { tokenStorage } from '@/core/storage/tokenStorage';
import { getApiErrorMessage } from '@/core/api/apiErrors';
import { normalizeUser, useLoginMutation } from '@/features/auth/services/authApi';
import { setUser } from '@/features/auth/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';

import AuthInput from '@/features/auth/components/AuthInput';
import AuthButton from '@/features/auth/components/AuthButton';

import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/login.schema';

import { colors } from '@/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await login(values).unwrap();
      await tokenStorage.saveTokens(
        response.access_token,
        response.refresh_token,
      );
      dispatch(setUser(normalizeUser(response.user)));
      router.replace('/(tabs)');
    }catch(error: unknown) {
      Alert.alert('Connexion Impossible',
        getApiErrorMessage(error, 'Adresse e-mail ou mot de passe invalid.',
      ),
    );
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Branding */}
          <View style={styles.header}>
            <Text style={styles.logo}>
              Spoty<Text style={styles.logoAccent}>Tube</Text>
            </Text>

            <Text style={styles.eyebrow}>
              YOUR MEDIA. YOUR NETWORK.
            </Text>

            <Text style={styles.title}>
              Bon retour parmi nous.
            </Text>

            <Text style={styles.subtitle}>
              Connectez-vous pour retrouver vos contenus
              multimédias et accéder à vos serveurs locaux.
            </Text>
          </View>

          {/* Login form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <AuthInput
                  label="Adresse e-mail"
                  placeholder="exemple@email.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <AuthInput
                  label="Mot de passe"
                  placeholder="Saisissez votre mot de passe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="current-password"
                  returnKeyType="done"
                />
              )}
            />

            <View style={styles.forgotPasswordContainer}>
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable accessibilityRole="link">
                  <Text style={styles.link}>
                    Mot de passe oublié ?
                  </Text>
                </Pressable>
              </Link>
            </View>

            <AuthButton
              title="Se connecter"
              onPress={onSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>

          {/* Registration link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous n&napos;avez pas encore de compte ?
            </Text>

            <Link href="/(auth)/register" asChild>
              <Pressable accessibilityRole="link">
                <Text style={styles.link}>
                  Créer un compte
                </Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.legal}>
            SPOTYTUBE · PRIVATE MEDIA STREAMING BY A_P
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: 36,
  },

  header: {
    gap: 12,
  },

  logo: {
    color: colors.text.primary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.5,
  },

  logoAccent: {
    color: colors.brand.primary,
  },

  eyebrow: {
    color: colors.brand.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  title: {
    color: colors.text.primary,
    fontSize: 27,
    fontWeight: '700',
    marginTop: 8,
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 23,
  },

  form: {
    gap: 22,
  },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -10,
  },

  link: {
    color: colors.brand.accent,
    fontSize: 13,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },

  footerText: {
    color: colors.text.secondary,
    fontSize: 13,
  },

  legal: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
