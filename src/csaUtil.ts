import { Square } from './types';
import { squareFile, squareRank } from './util';

export function parseCsaSquare(str: string): Square | undefined {
  if (str.length !== 2) return;
  if (str === '00') return 0; // for hand
  const file = Math.abs(str.charCodeAt(0) - '9'.charCodeAt(0));
  const rank = Math.abs(str.charCodeAt(1) - '9'.charCodeAt(0));
  if (file < 0 || file >= 9 || rank < 0 || rank >= 9) return;
  return file + 9 * rank;
}

export function makeCsaSquare(sq: Square): string {
  return (9 - squareFile(sq)).toString() + (9 - squareRank(sq));
}
