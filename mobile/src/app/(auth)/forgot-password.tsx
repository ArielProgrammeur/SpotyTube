
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
import { Link } from 'expo-router';

import AuthInput from '@/features/auth/components/AuthInput';
import AuthButton from '@/features/auth/components/AuthButton';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgot-password.schema';

import { colors } from '@/theme/colors';

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit((values) => {
    Alert.alert(
      'Adresse valide',
      `L&apos;adresse ${values.email} sera utilisée pour la récupération de votre compte lorsque le service API sera connecté.`,
    );
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
          <View style={styles.header}>
            <Text style={styles.logo}>
              Spoty<Text style={styles.logoAccent}>Tube</Text>
            </Text>

            <Text style={styles.eyebrow}>
              RÉCUPÉRATION DU COMPTE
            </Text>

            <Text style={styles.title}>
              Mot de passe oublié ?
            </Text>

            <Text style={styles.subtitle}>
              Pas d&apos;inquiétude. Saisissez l&apos;adresse email
              associée à votre compte pour demander la
              réinitialisation de votre mot de passe.
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
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
                  returnKeyType="done"
                />
              )}
            />

            <AuthButton
              title="Demander la réinitialisation"
              onPress={onSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous vous souvenez de votre mot de passe ?
            </Text>

            <Link href="/(auth)/login">
              <Text style={styles.link}>
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
    gap: 22,
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
