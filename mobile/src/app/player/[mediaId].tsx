import { useLocalSearchParams } from 'expo-router';

import RoutePlaceholder from '@/components/layout/RoutePlaceholder';

export default function PlayerScreen() {
  const { mediaId } = useLocalSearchParams<{
    mediaId: string;
  }>();

  return (
    <RoutePlaceholder
      eyebrow="SPOTYTUBE PLAYER"
      title="Lecteur multimédia"
      description={`Identifiant du média : ${mediaId}`}
    />
  );
}