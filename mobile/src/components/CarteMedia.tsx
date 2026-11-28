/*import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { urlMiniature } from '../services/api';
import type { Media } from '../types/catalogue';
import { formaterDuree } from '../utils/format';

type Props = { media: Media; hote: string; onPress: () => void };

export function CarteMedia({ media, hote, onPress }: Props) {
  // Pas de miniature (cas de l'audio) : on affichera une note de musique à la place.
  const miniature = media.thumbnail ? urlMiniature(hote, media.thumbnail) : null;

  return (
    <Pressable onPress={onPress} style={styles.carte}>
      {miniature ? (
        <Image source={{ uri: miniature }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.sansImage]}>
          <Text style={styles.note}>♪</Text>
        </View>
      )}
      <View style={styles.texte}>
        <Text style={styles.titre}>{media.title}</Text>
        <Text style={styles.detail}>
          {media.type === 'video' ? 'Vidéo' : 'Audio'} · {formaterDuree(media.duration)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: { flexDirection: 'row', padding: 10, marginBottom: 10, backgroundColor: '#f1f5f9', borderRadius: 10 },
  image: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#cbd5e1' },
  sansImage: { alignItems: 'center', justifyContent: 'center' },
  note: { fontSize: 28 },
  texte: { marginLeft: 12, justifyContent: 'center', flex: 1 },
  titre: { fontSize: 16, fontWeight: '600' },
  detail: { color: '#475569', marginTop: 4 },
});*/