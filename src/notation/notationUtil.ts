import { Position } from '../shogi.js';
import { Piece, Square } from '../types.js';
import { squareFile, squareRank } from '../util.js';
import { SquareSet } from '../squareSet.js';

export function piecesAiming(pos: Position, piece: Piece, to: Square): SquareSet {
  // Disambiguation
  let pieces = SquareSet.empty();
  for (const s of pos.board.pieces(pos.turn, piece.role))
    if (pos.dests(s).has(to)) pieces = pieces.union(SquareSet.fromSquare(s));
  return pieces;
}

export function makeNumberSquare(sq: Square): string {
  return (squareFile(sq) + 1).toString() + (squareRank(sq) + 1);
}

// only for single digit boards - something like 111 would be amiguous
export function parseNumberSquare(str: string): Square | undefined {
  if (str.length !== 2) return;
  const file = str.charCodeAt(0) - '1'.charCodeAt(0);
  const rank = str.charCodeAt(1) - '1'.charCodeAt(0);
  if (file < 0 || file >= 16 || rank < 0 || rank >= 16) return;
  return file + 16 * rank;
}

export function makeJapaneseSquare(sq: Square): string {
  return (
    (squareFile(sq) + 1)
      .toString()
      .split('')
      .map(c => String.fromCharCode(c.charCodeAt(0) + 0xfee0))
      .join('') + numberToKanji(squareRank(sq) + 1)
  );
}

export function parseJapaneseSquare(str: string): Square | undefined {
  if (str.length < 2 || str.length > 4) return;
  const fileOffset = str.length === 2 || (str.length === 3 && str[1] === '十') ? 1 : 2;
  const file =
    parseInt(
      str
        .slice(0, fileOffset)
        .split('')
        .map(c => (c.charCodeAt(0) >= 0xfee0 + 48 ? String.fromCharCode(c.charCodeAt(0) - 0xfee0) : c))
        .join('')
    ) - 1;
  const rank = kanjiToNumber(str.slice(fileOffset)) - 1;
  if (isNaN(file) || file < 0 || file >= 16 || rank < 0 || rank >= 16) return;
  return file + 16 * rank;
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

// max 99
export function numberToKanji(n: number): string {
  n = Math.max(0, Math.min(n, 99));
  const res = n >= 20 ? toKanjiDigit(Math.floor(n / 10).toString()) + '十' : n >= 10 ? '十' : '';
  return res + toKanjiDigit(Math.floor(n % 10).toString());
}

// max 99
export function kanjiToNumber(str: string): number {
  let res = str.startsWith('十') ? 1 : 0;
  for (const s of str) {
    if (s === '十') res *= 10;
    else res += fromKanjiDigit(s);
  }
  return Math.max(0, Math.min(res, 99));
}
