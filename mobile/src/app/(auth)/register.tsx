
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';

import AuthInput from '@/features/auth/components/AuthInput';
import AuthButton from '@/features/auth/components/AuthButton';

import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';

import { colors } from '@/theme/colors';
import { tokenStorage } from '@/core/storage/tokenStorage';
import { getApiErrorMessage } from '@/core/api/apiErrors';
import { normalizeUser, useRegisterMutation } from '@/features/auth/services/authApi';
import { setUser } from '@/features/auth/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerUser] = useRegisterMutation();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
      }).unwrap();
      await tokenStorage.saveTokens(
        response.access_token,
        response.refresh_token,
      );
      dispatch(setUser(normalizeUser(response.user)));
      router.replace('/(tabs)');
    }catch (error: unknown){
      Alert.alert('Inscription impossible',
        getApiErrorMessage( error, 'Impossible de creer votre compte. Veuillez Reessayer.'),
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
              REJOIGNEZ VOTRE UNIVERS MULTIMÉDIA
            </Text>

            <Text style={styles.title}>
              Créez votre compte.
            </Text>

            <Text style={styles.subtitle}>
              Accédez à vos contenus multimédias et gérez
              vos serveurs locaux depuis une seule application.
            </Text>
          </View>

          {/* Registration form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <AuthInput
                  label="Nom d'utilisateur"
                  placeholder="Votre nom d'utilisateur"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                  returnKeyType="next"
                />
              )}
            />

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
                  placeholder="8 caractères minimum"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <AuthInput
                  label="Confirmer le mot de passe"
                  placeholder="Saisissez à nouveau votre mot de passe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="done"
                />
              )}
            />

            <AuthButton
              title="Créer mon compte"
              onPress={onSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>

          {/* Login link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous avez déjà un compte ?
            </Text>

            <Link href="/(auth)/login" asChild>
              <Text accessibilityRole="link" style={styles.link}>
                Se connecter
              </Text>
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
    gap: 32,
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
    letterSpacing: 1.5,
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
    gap: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  link: {
    color: colors.brand.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  legal: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
