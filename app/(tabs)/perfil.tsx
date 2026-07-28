import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TOTAL_LETTERS } from '@/constants/album';
import { useAlbumColors } from '@/constants/theme';

// Mesmo progresso de demonstração usado no álbum — ainda sem persistência real.
const COLLECTED_COUNT = 3;

export default function PerfilScreen() {
  const colors = useAlbumColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <View style={styles.container}>
        <View style={[styles.avatar, { backgroundColor: colors.plum }]}>
          <Ionicons name="person-outline" size={30} color={colors.card} />
        </View>
        <Text style={[styles.title, { color: colors.ink }]}>Seu progresso</Text>
        <Text style={[styles.tally, { color: colors.inkSoft }]}>
          {COLLECTED_COUNT}/{TOTAL_LETTERS} figurinhas coladas
        </Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Login, avatar e histórico de sinais praticados ainda não existem — esta tela é só o placeholder do lugar onde vão entrar.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  tally: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  subtitle: { fontSize: 13.5, textAlign: 'center', lineHeight: 19, maxWidth: 280, marginTop: 6 },
});
