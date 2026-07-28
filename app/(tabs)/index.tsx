import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/AppAlertProvider';
import { LetterArt } from '@/components/LetterArt';
import {
  buildSlots,
  findCurrentUnit,
  findNextLetter,
  LetterSlot,
  StickerHue,
  TOTAL_LETTERS,
  Unit,
  UNITS,
} from '@/constants/album';
import { useAlbumColors } from '@/constants/theme';

const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const WEEK_DONE = [true, true, true, true, true, false, false];
const TODAY_INDEX = 4;

// Progresso local de demonstração — ainda sem persistência real (AsyncStorage/backend).
// Simulando a Unidade 1 inteira colada, com o bônus desbloqueado e ainda não aberto.
const COLLECTED_LETTERS = new Set(['A', 'B', 'C', 'D', 'E']);
const CLAIMED_BONUSES = new Set<string>();

export default function AlbumScreen() {
  const router = useRouter();
  const colors = useAlbumColors();
  const alert = useAppAlert();
  const [collected] = useState(COLLECTED_LETTERS);
  const [claimedBonuses, setClaimedBonuses] = useState(CLAIMED_BONUSES);

  const currentUnit = useMemo(() => findCurrentUnit(collected, claimedBonuses), [collected, claimedBonuses]);
  const currentUnitIndex = UNITS.findIndex((unit) => unit.id === currentUnit.id);
  const pastUnits = UNITS.slice(0, currentUnitIndex);
  const nextUnit = UNITS[currentUnitIndex + 1];
  const nextLetter = useMemo(() => findNextLetter(currentUnit, collected), [currentUnit, collected]);
  const isUnitComplete = nextLetter === null;
  const isBonusClaimed = claimedBonuses.has(currentUnit.id);

  const openLetter = (letter: string) => {
    router.push({ pathname: '/letter/[letter]', params: { letter } });
  };

  const handleSlotPress = (slot: LetterSlot) => {
    if (slot.state === 'locked') {
      alert('Ainda bloqueada', 'Complete a letra anterior para destravar essa figurinha.');
      return;
    }
    if (slot.state === 'stuck') {
      alert(
        'Figurinha já colada!',
        `A letra ${slot.letter} já está no seu álbum. Quer colar outra por cima pra caprichar ainda mais essa página?`,
        [
          { text: 'Deixar como está', style: 'ghost' },
          { text: 'Colar outra', style: 'primary', onPress: () => openLetter(slot.letter) },
        ],
      );
      return;
    }
    openLetter(slot.letter);
  };

  const handleBonusPress = (unit: Unit, complete: boolean, claimed: boolean) => {
    if (!complete) {
      alert('Figurinha bônus', 'Complete todas as letras da unidade para desbloquear a figurinha holográfica.');
      return;
    }
    if (claimed) {
      alert('Figurinha já coletada', `Você já abriu o bônus da Unidade "${unit.title}".`);
      return;
    }
    alert('Figurinha bônus!', `Parabéns por completar a Unidade "${unit.title}".`, [
      { text: 'Continuar', style: 'secondary' },
    ]);
    setClaimedBonuses((prev) => new Set(prev).add(unit.id));
  };

  const handleOpenPack = () => {
    if (nextLetter) {
      openLetter(nextLetter);
    } else if (isUnitComplete && !isBonusClaimed) {
      handleBonusPress(currentUnit, isUnitComplete, isBonusClaimed);
    }
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
        {pastUnits.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.inkSoft }]}>Páginas concluídas — role pra rever</Text>
        )}

        {pastUnits.map((unit, index) => (
          <UnitPage
            key={unit.id}
            unit={unit}
            unitNumber={index + 1}
            collected={collected}
            isCurrent={false}
            isBonusClaimed
            colors={colors}
            onSlotPress={handleSlotPress}
            onBonusPress={() => handleBonusPress(unit, true, true)}
          />
        ))}

        {pastUnits.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.inkSoft, marginTop: 22 }]}>Página atual</Text>
        )}

        <UnitPage
          unit={currentUnit}
          unitNumber={currentUnitIndex + 1}
          collected={collected}
          isCurrent
          isBonusClaimed={isBonusClaimed}
          colors={colors}
          onSlotPress={handleSlotPress}
          onBonusPress={() => handleBonusPress(currentUnit, isUnitComplete, isBonusClaimed)}
        />

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

        {(nextLetter || (isUnitComplete && !isBonusClaimed)) && (
          <TouchableOpacity
            style={[styles.pack, { backgroundColor: nextLetter ? colors.raspberry : colors.amber }]}
            onPress={handleOpenPack}
            activeOpacity={0.85}
          >
            <View style={styles.scallopRow}>
              {Array.from({ length: 16 }).map((_, i) => (
                <View key={i} style={[styles.scallop, { backgroundColor: colors.paper }]} />
              ))}
            </View>
            <Text style={[styles.packEyebrow, { color: nextLetter ? colors.card : colors.amberInk }]}>
              {nextLetter ? 'Pacote de hoje' : 'Unidade completa'}
            </Text>
            <View style={styles.packRow}>
              <Text style={[styles.packTitle, { color: nextLetter ? colors.card : colors.amberInk }]}>
                {nextLetter ? `Praticar a letra ${nextLetter}` : 'Abrir figurinha bônus'}
              </Text>
              <View style={[styles.packBtn, { backgroundColor: nextLetter ? colors.card : colors.amberInk }]}>
                <Text style={[styles.packBtnText, { color: nextLetter ? colors.raspberry : colors.amber }]}>Abrir</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function UnitPage({
  unit,
  unitNumber,
  collected,
  isCurrent,
  isBonusClaimed,
  colors,
  onSlotPress,
  onBonusPress,
}: {
  unit: Unit;
  unitNumber: number;
  collected: Set<string>;
  isCurrent: boolean;
  isBonusClaimed: boolean;
  colors: ReturnType<typeof useAlbumColors>;
  onSlotPress: (slot: LetterSlot) => void;
  onBonusPress: () => void;
}) {
  const slots = buildSlots(unit.letters, collected);
  const isUnitComplete = slots.every((slot) => slot.state === 'stuck');

  return (
    <View style={styles.page}>
      <View style={[styles.pageTab, { backgroundColor: isCurrent ? colors.amber : colors.teal }]}>
        <Text style={[styles.pageTabText, { color: isCurrent ? colors.amberInk : colors.card }]}>
          Unidade {unitNumber} · {unit.range}
          {!isCurrent && ' · concluída'}
        </Text>
      </View>
      <View style={[styles.pageSheet, { backgroundColor: colors.card, shadowColor: colors.ink }]}>
        <Text style={[styles.pageName, { color: colors.inkSoft }]}>{unit.title}</Text>
        <View style={styles.grid}>
          {slots.map((slot) => (
            <Sticker key={slot.letter} slot={slot} accent={unit.accent} colors={colors} onPress={() => onSlotPress(slot)} />
          ))}
          <BonusSlot unlocked={isUnitComplete} claimed={isBonusClaimed} colors={colors} onPress={onBonusPress} />
        </View>
      </View>
    </View>
  );
}

function Sticker({
  slot,
  accent,
  colors,
  onPress,
}: {
  slot: LetterSlot;
  accent: StickerHue;
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

  // "stuck" — todas as figurinhas coladas da mesma página compartilham a cor da unidade,
  // como o fundo de time num álbum de Copa; só a arte e a letra mudam por figurinha.
  const pageColor = colors[accent];
  return (
    <TouchableOpacity
      style={[styles.slot, styles.slotStuck, { backgroundColor: pageColor, transform: [{ rotate: `${slot.rotation}deg` }] }]}
      onPress={onPress}
    >
      <LetterArt letter={slot.letter} color={colors.card} size={58} />
      <View style={[styles.letterTag, { backgroundColor: colors.card }]}>
        <Text style={[styles.letterTagText, { color: pageColor }]}>{slot.letter}</Text>
      </View>
    </TouchableOpacity>
  );
}

function BonusSlot({
  unlocked,
  claimed,
  colors,
  onPress,
}: {
  unlocked: boolean;
  claimed: boolean;
  colors: ReturnType<typeof useAlbumColors>;
  onPress: () => void;
}) {
  if (claimed) {
    return (
      <TouchableOpacity style={[styles.slot, styles.slotBonusClaimed]} onPress={onPress}>
        <LinearGradient
          colors={[colors.amber, colors.raspberry, colors.plum, colors.teal, colors.amber]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.35)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="star" size={22} color="#fff" style={styles.holoIcon} />
        <Text style={[styles.bonusText, styles.holoIcon, { color: '#fff' }]}>Colada</Text>
      </TouchableOpacity>
    );
  }

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
  sectionLabel: {
    marginHorizontal: 16,
    marginTop: 18,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
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
  slotBonusClaimed: { overflow: 'hidden', gap: 4 },
  holoIcon: { textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  slotLetter: { fontWeight: '800', fontSize: 26 },
  letterTag: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    minWidth: 18,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  letterTagText: { fontWeight: '800', fontSize: 10.5 },
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
