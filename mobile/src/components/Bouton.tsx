import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
    readonly title: string;
    readonly onPress: () => void;
    readonly selection?: boolean;
    readonly desactivated?: boolean;
}

export default function Bouton({title, onPress, selection = true, desactivated = false}: Props) {
    return(
        <Pressable
        onPress={onPress}
        disabled={desactivated}
        style={[styles.bouton, selection ? styles.bleu : styles.gris, desactivated && styles.attenue]}
        >
            <Text style={styles.texte}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    bouton: {paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10},
    bleu: {backgroundColor: '#2563eb'},
    gris: {backgroundColor: '#94a3b8'},
    attenue: {opacity: 0.5},
    texte: {color: 'white', fontWeight: '600'},
});