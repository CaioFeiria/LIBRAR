import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlbumColors } from '@/constants/theme';

export default function RankingScreen() {
  const colors = useAlbumColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <View style={styles.container}>
        <Ionicons name="medal-outline" size={40} color={colors.inkSoft} />
        <Text style={[styles.title, { color: colors.ink }]}>Ranking em breve</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Quando o álbum tiver progresso salvo entre os alunos, aqui vai entrar a comparação semanal de figurinhas coladas.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13.5, textAlign: 'center', lineHeight: 19, maxWidth: 280 },
});
