import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StickerHue } from '@/constants/album';
import { useAlbumColors, withAlpha } from '@/constants/theme';

interface RankingEntry {
  name: string;
  weeklyCount: number;
  isYou?: boolean;
}

// Dados fictícios só pra simular o layout — sem backend/ranking real ainda.
const DEMO_RANKING: RankingEntry[] = [
  { name: 'Ana', weeklyCount: 14 },
  { name: 'Bruno', weeklyCount: 12 },
  { name: 'Carla', weeklyCount: 9 },
  { name: 'Você', weeklyCount: 7, isYou: true },
  { name: 'Diego', weeklyCount: 6 },
  { name: 'Elisa', weeklyCount: 4 },
  { name: 'Fábio', weeklyCount: 2 },
];

const AVATAR_HUES: StickerHue[] = ['amber', 'teal', 'plum', 'raspberry'];

export default function RankingScreen() {
  const colors = useAlbumColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.ink }]}>Ranking da semana</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>Quem colou mais figurinhas nos últimos 7 dias</Text>
      </View>

      <View style={styles.list}>
        {DEMO_RANKING.map((entry, index) => {
          const rank = index + 1;
          const hue = AVATAR_HUES[index % AVATAR_HUES.length];
          const avatarColor = colors[hue];
          return (
            <View
              key={entry.name}
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.line },
                entry.isYou && { borderColor: colors.raspberry, backgroundColor: withAlpha(colors.raspberry, 0.1) },
              ]}
            >
              <View style={styles.rankBox}>
                {rank <= 3 ? (
                  <Ionicons
                    name="trophy"
                    size={18}
                    color={rank === 1 ? colors.amber : rank === 2 ? colors.inkSoft : colors.raspberry}
                  />
                ) : (
                  <Text style={[styles.rankText, { color: colors.inkSoft }]}>{rank}</Text>
                )}
              </View>

              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={[styles.avatarText, { color: colors.card }]}>{entry.name.charAt(0)}</Text>
              </View>

              <Text style={[styles.name, { color: colors.ink }, entry.isYou && styles.nameYou]}>
                {entry.name}
              </Text>

              <View style={styles.countBox}>
                <Text style={[styles.countNumber, { color: colors.ink }]}>{entry.weeklyCount}</Text>
                <Text style={[styles.countLabel, { color: colors.inkSoft }]}>fig.</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[styles.caption, { color: colors.inkSoft }]}>
        Ranking de demonstração — ainda não conectado a dados reais de outros alunos.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 18 },

  list: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.4,
  },
  rankBox: { width: 22, alignItems: 'center' },
  rankText: { fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 14 },
  name: { flex: 1, fontSize: 14, fontWeight: '600' },
  nameYou: { fontWeight: '800' },
  countBox: { alignItems: 'center', minWidth: 34 },
  countNumber: { fontWeight: '800', fontSize: 15, fontVariant: ['tabular-nums'] },
  countLabel: { fontSize: 9.5, fontWeight: '600' },

  caption: { textAlign: 'center', fontSize: 11.5, marginTop: 18, marginHorizontal: 32, lineHeight: 16 },
});
