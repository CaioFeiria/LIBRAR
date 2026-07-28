const FULL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Letras cujo sinal no alfabeto manual de Libras envolve movimento (não são estáticas).
// Conjunto padrão ensinado em cursos de Libras — H, J, K, X e Z.
const MOVING_LETTERS = new Set(['H', 'J', 'K', 'X', 'Z']);

export function getLetterPosition(letter: string): number {
  return FULL_ALPHABET.indexOf(letter) + 1;
}

export function isMovingSign(letter: string): boolean {
  return MOVING_LETTERS.has(letter);
}
