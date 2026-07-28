export interface Unit {
  id: string;
  title: string;
  range: string;
  letters: string[];
}

export const UNITS: Unit[] = [
  { id: 'u1', title: 'Primeiras mãos', range: 'A–E', letters: ['A', 'B', 'C', 'D', 'E'] },
  { id: 'u2', title: 'Formas e curvas', range: 'F–J', letters: ['F', 'G', 'H', 'I', 'J'] },
  { id: 'u3', title: 'Sinais em movimento', range: 'K–O', letters: ['K', 'L', 'M', 'N', 'O'] },
  { id: 'u4', title: 'Consoantes duplas', range: 'P–T', letters: ['P', 'Q', 'R', 'S', 'T'] },
  { id: 'u5', title: 'Fechando o alfabeto', range: 'U–Z', letters: ['U', 'V', 'W', 'X', 'Y', 'Z'] },
];

export const TOTAL_LETTERS = UNITS.reduce((sum, unit) => sum + unit.letters.length, 0);

export type StickerHue = 'amber' | 'teal' | 'plum';
export type SlotState = 'stuck' | 'available' | 'locked';

export interface LetterSlot {
  letter: string;
  state: SlotState;
  hue: StickerHue;
  rotation: number;
}

const HUES: StickerHue[] = ['amber', 'teal', 'plum'];

/**
 * Deriva o estado de cada figurinha a partir da lista de letras já coladas:
 * coladas -> "stuck", a próxima da fila -> "available", o resto -> "locked".
 */
export function buildSlots(letters: string[], collected: Set<string>): LetterSlot[] {
  let nextAssigned = false;
  return letters.map((letter, index) => {
    let state: SlotState;
    if (collected.has(letter)) {
      state = 'stuck';
    } else if (!nextAssigned) {
      state = 'available';
      nextAssigned = true;
    } else {
      state = 'locked';
    }
    return { letter, state, hue: HUES[index % HUES.length], rotation: index % 2 === 0 ? -3 : 2 };
  });
}

export function findCurrentUnit(collected: Set<string>): Unit {
  return UNITS.find((unit) => !unit.letters.every((letter) => collected.has(letter))) ?? UNITS[UNITS.length - 1];
}

export function findNextLetter(unit: Unit, collected: Set<string>): string | null {
  return unit.letters.find((letter) => !collected.has(letter)) ?? null;
}
