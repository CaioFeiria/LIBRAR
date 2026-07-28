import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/AppAlertProvider';
import { TOTAL_LETTERS, UNITS } from '@/constants/album';
import { DEMO_COLLECTED_LETTERS, DEMO_STREAK_DAYS } from '@/constants/demoProgress';
import { useAlbumColors, withAlpha } from '@/constants/theme';

const UNITS_COMPLETE = UNITS.filter((unit) => unit.letters.every((letter) => DEMO_COLLECTED_LETTERS.has(letter)));

const SETTINGS_ROWS = [
  { icon: 'notifications-outline' as const, label: 'Notificações' },
  { icon: 'flag-outline' as const, label: 'Objetivo diário' },
  { icon: 'log-out-outline' as const, label: 'Sair' },
];

export default function PerfilScreen() {
  const colors = useAlbumColors();
  const alert = useAppAlert();

  const notAvailable = () => alert('Ainda não disponível', 'Essa parte do perfil ainda não foi conectada a uma conta de verdade.');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.plum }]}>
            <Text style={[styles.avatarText, { color: colors.card }]}>V</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.ink }]}>Você</Text>
            <Text style={[styles.tally, { color: colors.inkSoft }]}>
              {DEMO_COLLECTED_LETTERS.size}/{TOTAL_LETTERS} figurinhas coladas
            </Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.card }]} onPress={notAvailable}>
            <Ionicons name="pencil-outline" size={16} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatTile icon="albums-outline" value={String(DEMO_COLLECTED_LETTERS.size)} label="Figurinhas" colors={colors} />
          <StatTile icon="flame-outline" value={String(DEMO_STREAK_DAYS)} label="Dias seguidos" colors={colors} />
          <StatTile icon="checkmark-done-outline" value={String(UNITS_COMPLETE.length)} label="Unidades" colors={colors} />
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.ink }]}>Progresso no álbum</Text>
            <Text style={[styles.progressPct, { color: colors.inkSoft }]}>
              {Math.round((DEMO_COLLECTED_LETTERS.size / TOTAL_LETTERS) * 100)}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.line }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.amber, width: `${(DEMO_COLLECTED_LETTERS.size / TOTAL_LETTERS) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.unitDotsRow}>
            {UNITS.map((unit) => {
              const complete = unit.letters.every((letter) => DEMO_COLLECTED_LETTERS.has(letter));
              const accentColor = colors[unit.accent];
              return (
                <View key={unit.id} style={styles.unitDotWrap}>
                  <View
                    style={[
                      styles.unitDot,
                      complete
                        ? { backgroundColor: accentColor, borderColor: accentColor }
                        : { backgroundColor: 'transparent', borderColor: colors.line },
                    ]}
                  />
                  <Text style={[styles.unitDotLabel, { color: colors.inkSoft }]}>{unit.range}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.settingsList}>
          {SETTINGS_ROWS.map((row) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.settingsRow, { backgroundColor: colors.card, borderColor: colors.line }]}
              onPress={notAvailable}
            >
              <Ionicons name={row.icon} size={18} color={colors.inkSoft} />
              <Text style={[styles.settingsLabel, { color: colors.ink }]}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={withAlpha(colors.inkSoft, 0.6)} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.caption, { color: colors.inkSoft }]}>
          Perfil de demonstração — login e progresso real ainda não existem.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({
  icon,
  value,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  colors: ReturnType<typeof useAlbumColors>;
}) {
  return (
    <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <Ionicons name={icon} size={18} color={colors.inkSoft} />
      <Text style={[styles.statValue, { color: colors.ink }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.inkSoft }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 32 },

  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800' },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800' },
  tally: { fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'], marginTop: 2 },
  editBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  statTile: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 14, borderWidth: 1.4 },
  statValue: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10.5, fontWeight: '600', textAlign: 'center' },

  progressCard: { marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1.4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 13.5, fontWeight: '700' },
  progressPct: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  progressTrack: { height: 6, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  unitDotsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  unitDotWrap: { alignItems: 'center', gap: 4 },
  unitDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  unitDotLabel: { fontSize: 9.5, fontWeight: '600', fontVariant: ['tabular-nums'] },

  settingsList: { marginTop: 20, gap: 8 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.4 },
  settingsLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

  caption: { textAlign: 'center', fontSize: 11.5, marginTop: 22, lineHeight: 16 },
});
