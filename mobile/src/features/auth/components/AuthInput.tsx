import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { colors } from '@/theme/colors';

type AuthInputProps = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'secureTextEntry'
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secureTextEntry?: boolean;
};

export default function AuthInput({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  ...inputProps
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
      >
        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.text.muted}
          selectionColor={colors.brand.primary}
          style={styles.input}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible((previous) => !previous)}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible
                ? 'Masquer le mot de passe'
                : 'Afficher le mot de passe'
            }
            style={styles.visibilityButton}
          >
            {isPasswordVisible ? (
              <EyeOff color={colors.text.secondary} size={20} />
            ) : (
              <Eye color={colors.text.secondary} size={20} />
            )}
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  input: {
    flex: 1,
    minHeight: 50,
    color: colors.text.primary,
    fontSize: 15,
  },
  visibilityButton: {
    padding: 6,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 12,
  },
});