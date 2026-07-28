import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LetterArt } from '@/components/LetterArt';
import { StickerHue, Unit, UNITS } from '@/constants/album';
import { useAlbumColors, withAlpha } from '@/constants/theme';

export default function PraticarScreen() {
  const router = useRouter();
  const colors = useAlbumColors();

  const openLetter = (letter: string) => {
    router.push({ pathname: '/letter/[letter]', params: { letter } });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.ink }]}>Prática livre</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Escolha qualquer letra pra treinar o sinal na câmera, sem depender da ordem do álbum.
        </Text>

        {UNITS.map((unit) => (
          <UnitSection key={unit.id} unit={unit} colors={colors} onPressLetter={openLetter} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function UnitSection({
  unit,
  colors,
  onPressLetter,
}: {
  unit: Unit;
  colors: ReturnType<typeof useAlbumColors>;
  onPressLetter: (letter: string) => void;
}) {
  const accentColor = colors[unit.accent];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.unitDot, { backgroundColor: accentColor }]} />
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>{unit.title}</Text>
        <Text style={[styles.sectionRange, { color: colors.inkSoft }]}>{unit.range}</Text>
      </View>
      <View style={styles.letterRow}>
        {unit.letters.map((letter) => (
          <LetterCard key={letter} letter={letter} accent={unit.accent} colors={colors} onPress={() => onPressLetter(letter)} />
        ))}
      </View>
    </View>
  );
}

function LetterCard({
  letter,
  accent,
  colors,
  onPress,
}: {
  letter: string;
  accent: StickerHue;
  colors: ReturnType<typeof useAlbumColors>;
  onPress: () => void;
}) {
  const accentColor = colors[accent];
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: withAlpha(accentColor, 0.14), borderColor: withAlpha(accentColor, 0.35) },
      ]}
      onPress={onPress}
    >
      <LetterArt letter={letter} color={accentColor} size={34} />
      <Text style={[styles.cardLetter, { color: colors.ink }]}>{letter}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  subtitle: { fontSize: 13.5, textAlign: 'center', alignSelf: 'center', maxWidth: 300, marginTop: 6, marginBottom: 8, lineHeight: 19 },

  section: { marginTop: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  unitDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  sectionRange: { fontSize: 12.5, fontFamily: 'System', fontVariant: ['tabular-nums'] },

  letterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: 76,
    height: 84,
    borderRadius: 16,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cardLetter: { fontWeight: '800', fontSize: 13 },
});
