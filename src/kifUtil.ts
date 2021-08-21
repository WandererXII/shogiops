import { Square } from './types';
import { parseSquare, squareFile, squareRank } from './util';

export function parseKifSquare(str: string): Square | undefined {
  if (str.length !== 2) return;
  const file = str[0].charCodeAt(0) >= 65297 ? String.fromCharCode(str[0].charCodeAt(0) - 65248) : str[0];
  const rank = String.fromCharCode(
    ('一二三四五六七八九'.includes(str[1]) ? fromKanjiDigit(str[1]).toString() : str[1]).charCodeAt(0) + 48
  );
  return parseSquare(file + rank);
}

export function kifDestSquare(sq: Square): string {
  return (
    String.fromCharCode((9 - squareFile(sq)).toString().charCodeAt(0) + 0xfee0) +
    toKanjiDigit((9 - squareRank(sq)).toString())
  );
}

export function kifOrigSquare(sq: Square): string {
  return 9 - squareFile(sq) + (9 - squareRank(sq)).toString();
}

export function toKanjiDigit(str: string): string {
  switch (str) {
    case '1':
      return '一';
    case '2':
      return '二';
    case '3':
      return '三';
    case '4':
      return '四';
    case '5':
      return '五';
    case '6':
      return '六';
    case '7':
      return '七';
    case '8':
      return '八';
    case '9':
      return '九';
    case '10':
      return '十';
    default:
      return '';
  }
}

// max 99, meant for pieces in hand, you don't need more than 99 pieces...
export function numberToKanji(n: number): string {
  n = Math.max(0, Math.min(n, 99));
  const res = n >= 20 ? toKanjiDigit(Math.floor(n / 10).toString()) + '十' : n >= 10 ? '十' : '';
  return res + toKanjiDigit(Math.floor(n % 10).toString());
}

export function fromKanjiDigit(str: string): number {
  switch (str) {
    case '一':
      return 1;
    case '二':
      return 2;
    case '三':
      return 3;
    case '四':
      return 4;
    case '五':
      return 5;
    case '六':
      return 6;
    case '七':
      return 7;
    case '八':
      return 8;
    case '九':
      return 9;
    case '十':
      return 10;
    default:
      return 0;
  }
}

// max 99, meant for pieces in hand, you don't need more than 99 pieces...
export function kanjiToNumber(str: string): number {
  let res = str.startsWith('十') ? 1 : 0;
  for (const s of str) {
    if (s === '十') res *= 10;
    else res += fromKanjiDigit(s);
  }
  return Math.max(0, Math.min(res, 99));
}

export function normalizedKifLines(kif: string): string[] {
  return kif
    .replace(/:/g, '：')
    .replace(/　/g, ' ') // full-width space to normal space
    .split(/[\r\n]+/)
    .map(l => l.trim())
    .filter(l => l);
}
