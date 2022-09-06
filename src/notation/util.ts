import { SquareSet } from '../squareSet.js';
import { Piece, Role, Square } from '../types.js';
import { squareFile, squareRank } from '../util.js';
import { Position } from '../variant/position.js';

export function piecesAiming(pos: Position, piece: Piece, to: Square): SquareSet {
  // Disambiguation
  let pieces = SquareSet.empty();
  for (const s of pos.board.pieces(pos.turn, piece.role))
    if (pos.moveDests(s).has(to)) pieces = pieces.union(SquareSet.fromSquare(s));
  return pieces;
}

export function roleTo1Kanji(role: Role): string {
  switch (role) {
    case 'pawn':
      return '歩';
    case 'lance':
      return '香';
    case 'knight':
      return '桂';
    case 'silver':
      return '銀';
    case 'gold':
      return '金';
    case 'bishop':
      return '角';
    case 'rook':
      return '飛';
    case 'tokin':
      return 'と';
    case 'promotedlance':
      return '杏';
    case 'promotedknight':
      return '圭';
    case 'promotedsilver':
      return '全';
    case 'horse':
      return '馬';
    case 'dragon':
      return '龍';
    default:
      return '玉';
  }
}

export function roleTo2Kanji(role: Role): string {
  switch (role) {
    case 'promotedlance':
      return '成香';
    case 'promotedknight':
      return '成桂';
    case 'promotedsilver':
      return '成銀';
    default:
      return roleTo1Kanji(role);
  }
}

export function kanjiToRole(str: string): Role | undefined {
  switch (str) {
    case '歩':
      return 'pawn';
    case '香':
      return 'lance';
    case '桂':
      return 'knight';
    case '銀':
      return 'silver';
    case '金':
      return 'gold';
    case '角':
      return 'bishop';
    case '飛':
      return 'rook';
    case 'と':
      return 'tokin';
    case '杏':
    case '成香':
      return 'promotedlance';
    case '圭':
    case '成桂':
      return 'promotedknight';
    case '全':
    case '成銀':
      return 'promotedsilver';
    case '馬':
      return 'horse';
    case '龍':
      return 'dragon';
    case '玉':
    case '王':
      return 'king';
    default:
      return undefined;
  }
}

export function roleToCsa(role: Role): string {
  switch (role) {
    case 'pawn':
      return 'FU';
    case 'lance':
      return 'KY';
    case 'knight':
      return 'KE';
    case 'silver':
      return 'GI';
    case 'gold':
      return 'KI';
    case 'bishop':
      return 'KA';
    case 'rook':
      return 'HI';
    case 'tokin':
      return 'TO';
    case 'promotedlance':
      return 'NY';
    case 'promotedknight':
      return 'NK';
    case 'promotedsilver':
      return 'NG';
    case 'horse':
      return 'UM';
    case 'dragon':
      return 'RY';
    default:
      return 'OU';
  }
}

export function csaToRole(str: string): Role | undefined {
  switch (str) {
    case 'FU':
      return 'pawn';
    case 'KY':
      return 'lance';
    case 'KE':
      return 'knight';
    case 'GI':
      return 'silver';
    case 'KI':
      return 'gold';
    case 'KA':
      return 'bishop';
    case 'HI':
      return 'rook';
    case 'TO':
      return 'tokin';
    case 'NY':
      return 'promotedlance';
    case 'NK':
      return 'promotedknight';
    case 'NG':
      return 'promotedsilver';
    case 'UM':
      return 'horse';
    case 'RY':
      return 'dragon';
    case 'OU':
      return 'king';
    default:
      return undefined;
  }
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
