import { Color, FILE_NAMES, Move, Piece, PieceName, RANK_NAMES, Role, Square, SquareName, isDrop } from './types.js';

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

export function parseSquare(str: SquareName): Square;
export function parseSquare(str: string): Square | undefined;
export function parseSquare(str: string): Square | undefined {
  if (str.length !== 2 && str.length !== 3) return;
  const file = parseInt(str.slice(0, -1)) - 1,
    rank = str.slice(-1).charCodeAt(0) - 'a'.charCodeAt(0);
  if (isNaN(file) || file < 0 || file >= 16 || rank < 0 || rank >= 16) return;
  return file + 16 * rank;
}

export function makeSquare(square: Square): SquareName {
  return (FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)]) as SquareName;
}

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
    default:
      return;
  }
}

export function parseUsi(str: string): Move | undefined {
  if (str[1] === '*') {
    const role = parseUsiDropRole(str[0]),
      to = parseSquare(str.slice(2));
    if (defined(role) && defined(to)) return { role, to };
  } else if (str.length >= 4 && str.length <= 7) {
    const fromOffset = parseInt(str[2]) ? 2 : 3,
      toOffset = parseInt(str[fromOffset + 1]) ? 3 : 2,
      from = parseSquare(str.slice(0, fromOffset)),
      to = parseSquare(str.slice(fromOffset, fromOffset + toOffset)),
      promotion = str[fromOffset + toOffset] === '+' ? true : false;
    if (defined(from) && defined(to)) return { from, to, promotion };
  }
  return;
}

function makeUsiDropRole(role: Role): string {
  return role === 'knight' ? 'N' : role[0].toUpperCase();
}

export function makeUsi(move: Move): string {
  if (isDrop(move)) return `${makeUsiDropRole(move.role).toUpperCase()}*${makeSquare(move.to)}`;
  return makeSquare(move.from) + makeSquare(move.to) + (move.promotion ? '+' : '');
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
