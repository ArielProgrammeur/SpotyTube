import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type RoutePlaceholderProps = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description: string;
};

export default function RoutePlaceholder({
  eyebrow = 'SPOTYTUBE',
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: colors.background.primary,
  },
  eyebrow: {
    marginBottom: 12,
    color: colors.brand.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  title: {
    marginBottom: 12,
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    maxWidth: 420,
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 23,
  },
});