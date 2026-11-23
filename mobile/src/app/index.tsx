import { View } from "react-native";
import Bouton from "@/components/Bouton"

export default function CatalogueScreen(){
  return(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12}}>
      <Bouton title="Bleu" onPress={() => console.log('appui bleu')} />
      <Bouton title="Gris" selection={false} onPress={() => console.log('appui gris')}/>
      <Bouton title="Bloque" desactivated onPress={() => console.log('appui bloque')}/>
    </View>
  )
}