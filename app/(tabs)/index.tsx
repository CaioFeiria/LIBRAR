import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buildSlots, findCurrentUnit, findNextLetter, LetterSlot, TOTAL_LETTERS, UNITS } from '@/constants/album';
import { useAlbumColors } from '@/constants/theme';

const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const WEEK_DONE = [true, true, true, true, true, false, false];
const TODAY_INDEX = 4;

// Progresso local de demonstração — ainda sem persistência real (AsyncStorage/backend).
const COLLECTED_LETTERS = new Set(['A', 'B', 'C']);

export default function AlbumScreen() {
  const router = useRouter();
  const colors = useAlbumColors();
  const [collected] = useState(COLLECTED_LETTERS);

  const currentUnit = useMemo(() => findCurrentUnit(collected), [collected]);
  const currentUnitIndex = UNITS.findIndex((unit) => unit.id === currentUnit.id);
  const nextUnit = UNITS[currentUnitIndex + 1];
  const slots = useMemo(() => buildSlots(currentUnit.letters, collected), [currentUnit, collected]);
  const nextLetter = useMemo(() => findNextLetter(currentUnit, collected), [currentUnit, collected]);
  const isUnitComplete = nextLetter === null;

  const openLetter = (letter: string) => {
    router.push({ pathname: '/letter/[letter]', params: { letter } });
  };

  const handleSlotPress = (slot: LetterSlot) => {
    if (slot.state === 'locked') {
      Alert.alert('Ainda bloqueada', 'Complete a letra anterior para destravar essa figurinha.');
      return;
    }
    openLetter(slot.letter);
  };

  const handleBonusPress = () => {
    if (isUnitComplete) {
      Alert.alert('Figurinha bônus!', `Parabéns por completar a Unidade "${currentUnit.title}".`);
    } else {
      Alert.alert('Figurinha bônus', 'Complete todas as letras da unidade para desbloquear a figurinha holográfica.');
    }
  };

  const handleOpenPack = () => {
    if (nextLetter) openLetter(nextLetter);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]} edges={['top']}>
      <View style={[styles.hud, { backgroundColor: colors.paper, borderBottomColor: colors.line }]}>
        <View style={styles.hudRow}>
          <Text style={[styles.hudTitle, { color: colors.ink }]}>Álbum de Sinais</Text>
          <Text style={[styles.hudTally, { color: colors.inkSoft }]}>
            {collected.size}/{TOTAL_LETTERS} figurinhas
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.line }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.amber, width: `${(collected.size / TOTAL_LETTERS) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.weekRow}>
          {WEEK_LABELS.map((label, index) => (
            <View
              key={label + index}
              style={[
                styles.weekDot,
                { borderColor: colors.line },
                WEEK_DONE[index] && { backgroundColor: colors.teal, borderColor: colors.teal },
                index === TODAY_INDEX && { borderColor: colors.raspberry, borderWidth: 2 },
              ]}
            />
          ))}
          <Text style={[styles.weekLabel, { color: colors.inkSoft }]}>5 dias seguidos</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={[styles.pageTab, { backgroundColor: colors.amber }]}>
            <Text style={[styles.pageTabText, { color: colors.amberInk }]}>
              Unidade {currentUnitIndex + 1} · {currentUnit.range}
            </Text>
          </View>
          <View style={[styles.pageSheet, { backgroundColor: colors.card, shadowColor: colors.ink }]}>
            <Text style={[styles.pageName, { color: colors.inkSoft }]}>{currentUnit.title}</Text>
            <View style={styles.grid}>
              {slots.map((slot) => (
                <Sticker key={slot.letter} slot={slot} colors={colors} onPress={() => handleSlotPress(slot)} />
              ))}
              <BonusSlot unlocked={isUnitComplete} colors={colors} onPress={handleBonusPress} />
            </View>
          </View>
        </View>

        {nextUnit && (
          <View style={[styles.nextPage, { backgroundColor: colors.card, borderColor: colors.line }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.inkSoft} />
            <Text style={[styles.nextPageText, { color: colors.inkSoft }]}>
              Página {currentUnitIndex + 2}{' '}
              <Text style={{ color: colors.ink, fontWeight: '700' }}>
                {nextUnit.title} · {nextUnit.range}
              </Text>{' '}
              vira quando esta unidade estiver completa.
            </Text>
          </View>
        )}

        {nextLetter && (
          <TouchableOpacity
            style={[styles.pack, { backgroundColor: colors.raspberry }]}
            onPress={handleOpenPack}
            activeOpacity={0.85}
          >
            <View style={styles.scallopRow}>
              {Array.from({ length: 16 }).map((_, i) => (
                <View key={i} style={[styles.scallop, { backgroundColor: colors.paper }]} />
              ))}
            </View>
            <Text style={[styles.packEyebrow, { color: colors.card }]}>Pacote de hoje</Text>
            <View style={styles.packRow}>
              <Text style={[styles.packTitle, { color: colors.card }]}>Praticar a letra {nextLetter}</Text>
              <View style={[styles.packBtn, { backgroundColor: colors.card }]}>
                <Text style={[styles.packBtnText, { color: colors.raspberry }]}>Abrir</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Sticker({
  slot,
  colors,
  onPress,
}: {
  slot: LetterSlot;
  colors: ReturnType<typeof useAlbumColors>;
  onPress: () => void;
}) {
  if (slot.state === 'locked') {
    return (
      <TouchableOpacity style={[styles.slot, styles.slotLocked, { borderColor: colors.line }]} onPress={onPress}>
        <Text style={[styles.slotLetter, { color: colors.locked }]}>{slot.letter}</Text>
      </TouchableOpacity>
    );
  }

  if (slot.state === 'available') {
    return (
      <TouchableOpacity
        style={[styles.slot, styles.slotAvailable, { borderColor: colors.raspberry }]}
        onPress={onPress}
      >
        <View style={[styles.flag, { backgroundColor: colors.raspberry }]}>
          <Text style={[styles.flagText, { color: colors.card }]}>Colar agora</Text>
        </View>
        <Text style={[styles.slotLetter, { color: colors.raspberry }]}>{slot.letter}</Text>
      </TouchableOpacity>
    );
  }

  const hueColor = colors[slot.hue];
  return (
    <TouchableOpacity
      style={[styles.slot, styles.slotStuck, { backgroundColor: hueColor, transform: [{ rotate: `${slot.rotation}deg` }] }]}
      onPress={onPress}
    >
      <FontAwesome5 name="hand-paper" size={40} color="rgba(255,255,255,0.22)" style={styles.watermark} />
      <Text style={[styles.slotLetter, { color: colors.card }]}>{slot.letter}</Text>
    </TouchableOpacity>
  );
}

function BonusSlot({
  unlocked,
  colors,
  onPress,
}: {
  unlocked: boolean;
  colors: ReturnType<typeof useAlbumColors>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.slot,
        styles.slotBonus,
        { borderColor: colors.line },
        unlocked && { backgroundColor: colors.amber, borderColor: colors.amber },
      ]}
      onPress={onPress}
    >
      <Ionicons name="star-outline" size={22} color={unlocked ? colors.amberInk : colors.inkSoft} />
      <Text style={[styles.bonusText, { color: unlocked ? colors.amberInk : colors.inkSoft }]}>Bônus</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  hud: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, gap: 9 },
  hudRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  hudTitle: { fontFamily: 'System', fontWeight: '800', fontSize: 16 },
  hudTally: { fontWeight: '600', fontSize: 13, fontVariant: ['tabular-nums'] },
  progressTrack: { height: 6, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  weekDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.6 },
  weekLabel: { marginLeft: 4, fontSize: 11.5, fontWeight: '600' },

  scrollContent: { paddingBottom: 24 },
  page: { position: 'relative', marginHorizontal: 16, marginTop: 18 },
  pageTab: {
    position: 'absolute',
    top: -12,
    left: 18,
    zIndex: 2,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 5,
    borderRadius: 8,
  },
  pageTabText: { fontWeight: '800', fontSize: 11 },
  pageSheet: {
    borderRadius: 16,
    padding: 16,
    paddingTop: 22,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  pageName: { fontSize: 12, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },

  slot: {
    width: '31%',
    aspectRatio: 0.86,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLocked: { borderWidth: 1.6, borderStyle: 'dashed' },
  slotAvailable: { borderWidth: 2, borderStyle: 'dashed', position: 'relative' },
  slotStuck: { overflow: 'hidden', position: 'relative' },
  slotBonus: { borderWidth: 1.6, borderStyle: 'dashed', gap: 4 },
  slotLetter: { fontWeight: '800', fontSize: 26 },
  watermark: { position: 'absolute' },
  flag: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  flagText: { fontWeight: '700', fontSize: 9.5 },
  bonusText: { fontWeight: '700', fontSize: 9.5, letterSpacing: 0.3 },

  nextPage: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextPageText: { flex: 1, fontSize: 12.5, lineHeight: 17 },

  pack: { marginHorizontal: 16, marginTop: 22, borderRadius: 16, padding: 16, paddingTop: 20, position: 'relative' },
  scallopRow: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scallop: { width: 14, height: 14, borderRadius: 7 },
  packEyebrow: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 },
  packRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  packTitle: { fontWeight: '800', fontSize: 15, flexShrink: 1 },
  packBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  packBtnText: { fontWeight: '800', fontSize: 12 },
});
