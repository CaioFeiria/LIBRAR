import { ComponentType } from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
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

/**
 * Caixa do conteúdo não-transparente da PNG, medida em pixels do arquivo original
 * (canto superior-esquerdo e inferior-direito da mão dentro do canvas). Usada pra
 * cortar a margem vazia e manter o pulso encostado na base — o mesmo efeito que
 * A-E já têm "de fábrica" porque vieram recortadas coladas na borda.
 *
 * Sem fator de "boost": qualquer escala acima do que a própria caixa de conteúdo
 * permite corta a ponta do dedo, já que o pulso fica fixo na base e não há
 * margem sobrando por cima pra crescer. Mãos finas (G, H, I) só parecem menores
 * que uma mão cheia (B) porque preenchem menos a própria caixa — isso é a forma
 * real do sinal, não dá pra "aumentar" sem cortar conteúdo de verdade.
 */
interface ArtBox {
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// A arte já vem colorida (pele, sombra etc.) — a cor da figurinha (prop `color`)
// não se aplica aqui, só serve pro placeholder vetorial acima.
function imageArt(source: ImageSourcePropType, box?: ArtBox): ComponentType<LetterArtProps> {
  if (!box) {
    return function PlainImageLetterArt({ size = 46 }: LetterArtProps) {
      return <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />;
    };
  }

  const { width, height, minX, minY, maxX, maxY } = box;
  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;

  return function CroppedImageLetterArt({ size = 46 }: LetterArtProps) {
    const scale = size / Math.max(contentWidth, contentHeight);
    const left = size / 2 - ((minX + maxX) / 2) * scale;
    const top = size - maxY * scale;
    return (
      <View style={{ width: size, height: size, overflow: 'hidden' }}>
        <Image
          source={source}
          resizeMode="contain"
          style={{ position: 'absolute', left, top, width: width * scale, height: height * scale }}
        />
      </View>
    );
  };
}

const LETTER_ART: Partial<Record<string, ComponentType<LetterArtProps>>> = {
  A: imageArt(require('@/assets/letters/letra_a.png')),
  B: imageArt(require('@/assets/letters/letra_b.png')),
  C: imageArt(require('@/assets/letters/letra_c.png')),
  D: imageArt(require('@/assets/letters/letra_d.png')),
  E: imageArt(require('@/assets/letters/letra_e.png')),
  F: imageArt(require('@/assets/letters/letra_f.png'), {
    width: 554,
    height: 1110,
    minX: 11,
    minY: 11,
    maxX: 542,
    maxY: 1096,
  }),
  G: imageArt(require('@/assets/letters/letra_g.png'), {
    width: 606,
    height: 1169,
    minX: 12,
    minY: 12,
    maxX: 593,
    maxY: 1168,
  }),
  H: imageArt(require('@/assets/letters/letra_h.png'), {
    width: 888,
    height: 1091,
    minX: 12,
    minY: 11,
    maxX: 875,
    maxY: 1077,
  }),
  I: imageArt(require('@/assets/letters/letra_i.png'), {
    width: 732,
    height: 1168,
    minX: 16,
    minY: 12,
    maxX: 717,
    maxY: 1167,
  }),
  J: imageArt(require('@/assets/letters/letra_j.png'), {
    width: 944,
    height: 932,
    minX: 14,
    minY: 12,
    maxX: 931,
    maxY: 877,
  }),
};

export function LetterArt({ letter, color, size }: { letter: string } & LetterArtProps) {
  const Art = LETTER_ART[letter] ?? PlaceholderHand;
  return <Art color={color} size={size} />;
}
