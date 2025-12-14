import { FILE_NAMES, RANK_NAMES } from './constants.js';
import type {
  Color,
  DropMove,
  MoveOrDrop,
  NormalMove,
  Piece,
  PieceName,
  Role,
  Square,
  SquareName,
} from './types.js';
export { Result } from '@badrap/result';

export function defined<A>(v: A | undefined): v is A {
  return v !== undefined;
}

export function opposite(color: Color): Color {
  return color === 'gote' ? 'sente' : 'gote';
}

export function squareRank(square: Square): number {
  return square >>> 4;
}

export function squareFile(square: Square): number {
  return square & 15;
}

export function squareDist(a: Square, b: Square): number {
  const x1 = squareFile(a),
    x2 = squareFile(b);
  const y1 = squareRank(a),
    y2 = squareRank(b);
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

export function makePieceName(piece: Piece): PieceName {
  return `${piece.color} ${piece.role}`;
}

export function parsePieceName(pieceName: PieceName): Piece {
  const splitted = pieceName.split(' '),
    color = splitted[0] as Color,
    role = splitted[1] as Role;
  return { color, role };
}

export function parseCoordinates(file: number, rank: number): Square | undefined {
  if (file >= 0 && file < 16 && rank >= 0 && rank < 16) return file + rank * 16;
  return;
}

export function parseSquareName(str: SquareName): Square;
export function parseSquareName(str: string): Square | undefined;
export function parseSquareName(str: string): Square | undefined {
  if (str.length !== 2 && str.length !== 3) return;
  const file = parseInt(str.slice(0, -1)) - 1,
    rank = str.slice(-1).charCodeAt(0) - 'a'.charCodeAt(0);
  if (isNaN(file) || file < 0 || file >= 16 || rank < 0 || rank >= 16) return;
  return file + 16 * rank;
}

export function makeSquareName(square: Square): SquareName {
  return (FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)]) as SquareName;
}

export function isDrop(v: MoveOrDrop): v is DropMove {
  return 'role' in v;
}

export function isMove(v: MoveOrDrop): v is NormalMove {
  return 'from' in v;
}

export const lionRoles: Role[] = ['lion', 'lionpromoted'];

// other roles can't be dropped with any current variant
function parseUsiDropRole(ch: string): Role | undefined {
  switch (ch.toUpperCase()) {
    case 'P':
      return 'pawn';
    case 'L':
      return 'lance';
    case 'N':
      return 'knight';
    case 'S':
      return 'silver';
    case 'G':
      return 'gold';
    case 'B':
      return 'bishop';
    case 'R':
      return 'rook';
    case 'T':
      return 'tokin';
    default:
      return;
  }
}

export const usiDropRegex: RegExp = /^([PLNSGBRT])\*(\d\d?[a-p])$/;
export const usiMoveRegex: RegExp = /^(\d\d?[a-p])(\d\d?[a-p])?(\d\d?[a-p])(\+|=|\?)?$/;

export function parseUsi(str: string): MoveOrDrop | undefined {
  const dropMatch = str.match(usiDropRegex);
  if (dropMatch) {
    const role = parseUsiDropRole(dropMatch[1]),
      to = parseSquareName(dropMatch[2]);
    if (defined(role) && defined(to)) return { role, to };
  }
  const moveMatch = str.match(usiMoveRegex);
  if (moveMatch) {
    const from = parseSquareName(moveMatch[1]),
      midStep = moveMatch[2] ? parseSquareName(moveMatch[2]) : undefined,
      to = parseSquareName(moveMatch[3]),
      promotion = moveMatch[4] === '+' ? true : false;
    if (defined(from) && defined(to)) return { from, to, promotion, midStep };
  }
  return;
}

function makeUsiDropRole(role: Role): string {
  return role === 'knight' ? 'N' : role[0].toUpperCase();
}

export function makeUsi(md: MoveOrDrop): string {
  if (isDrop(md)) return `${makeUsiDropRole(md.role).toUpperCase()}*${makeSquareName(md.to)}`;
  return (
    makeSquareName(md.from) +
    (defined(md.midStep) ? makeSquareName(md.midStep) : '') +
    makeSquareName(md.to) +
    (md.promotion ? '+' : '')
  );
}

export function toBW(color: string): 'b' | 'w' {
  // white, w, gote, g
  if (color[0] === 'w' || color[0] === 'g') return 'w';
  return 'b';
}

export function toBlackWhite(color: string): 'black' | 'white' {
  if (color[0] === 'w' || color[0] === 'g') return 'white';
  return 'black';
}

export function toColor(color: string): Color {
  if (color[0] === 'w' || color[0] === 'g') return 'gote';
  return 'sente';
}

export function boolToColor(b: boolean): Color {
  return b ? 'sente' : 'gote';
}
