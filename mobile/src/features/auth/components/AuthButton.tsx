import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '@/theme/colors';

type AuthButtonProps = {
  readonly title: string;
  readonly onPress: () => void;
  readonly loading?: boolean;
  readonly disabled?: boolean;
};

export default function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.primary} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});