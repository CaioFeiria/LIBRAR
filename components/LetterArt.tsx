import { ComponentType } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { Path, Rect, Svg } from 'react-native-svg';

export interface LetterArtProps {
  color: string;
  size?: number;
}

/**
 * Mão genérica usada enquanto a ilustração cartoon de uma letra ainda não existe.
 * Assim que a arte (PNG com fundo transparente, em assets/letters) estiver pronta,
 * adicione a entrada correspondente em LETTER_ART — o resto do app não precisa mudar.
 */
function PlaceholderHand({ color, size = 46 }: LetterArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="9.2" y="2.6" width="2.5" height="9.6" rx="1.2" />
      <Rect x="12.3" y="1.6" width="2.5" height="10.6" rx="1.2" />
      <Rect x="15.4" y="3" width="2.5" height="9" rx="1.2" />
      <Rect x="18.4" y="4.8" width="2.3" height="7.2" rx="1.1" />
      <Path d="M6.6 12.2V9.2a1.5 1.5 0 0 1 3 0v3" transform="rotate(-16 6.6 12.2)" />
      <Path d="M4.8 20.8v-6c0-2.2 1.8-4 4-4h9c2.4 0 4.4 2 4.4 4.4v2.4c0 1.8-1.4 3.2-3.2 3.2H8.4c-2 0-3.6-1.6-3.6-3.6Z" />
    </Svg>
  );
}

// A arte já vem colorida (pele, sombra etc.) — a cor da figurinha (prop `color`)
// não se aplica aqui, só serve pro placeholder vetorial acima.
function imageArt(source: ImageSourcePropType): ComponentType<LetterArtProps> {
  return function ImageLetterArt({ size = 46 }: LetterArtProps) {
    return <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />;
  };
}

const LETTER_ART: Partial<Record<string, ComponentType<LetterArtProps>>> = {
  A: imageArt(require('@/assets/letters/letra_a.png')),
  B: imageArt(require('@/assets/letters/letra_b.png')),
  C: imageArt(require('@/assets/letters/letra_c.png')),
  D: imageArt(require('@/assets/letters/letra_d.png')),
  E: imageArt(require('@/assets/letters/letra_e.png')),
};

export function LetterArt({ letter, color, size }: { letter: string } & LetterArtProps) {
  const Art = LETTER_ART[letter] ?? PlaceholderHand;
  return <Art color={color} size={size} />;
}
