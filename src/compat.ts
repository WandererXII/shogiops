import { Rules, SquareName, Move, isDrop, Square, Role, PocketRole } from './types';
import { defined, makeSquare, makeUsi, parseSquare, parseUsi, squareFile, squareRank } from './util';
import { Position } from './shogi';

export const C_FILE_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;
export type ChessFileName = typeof C_FILE_NAMES[number];

export const C_RANK_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
export type ChessRankName = typeof C_RANK_NAMES[number];

export type ChessSquareName = `${ChessFileName}${ChessRankName}`;

export function makeChessSquare(square: Square): ChessSquareName {
  return (C_FILE_NAMES[squareFile(square)] + C_RANK_NAMES[squareRank(square)]) as ChessSquareName;
}

export function parseChessSquare(str: ChessSquareName): Square;
export function parseChessSquare(str: string): Square | undefined;
export function parseChessSquare(str: string): Square | undefined {
  if (str.length !== 2) return;
  const file = Math.abs(str.charCodeAt(0) - 'a'.charCodeAt(0));
  const rank = Math.abs(str.charCodeAt(1) - '1'.charCodeAt(0));
  if (file < 0 || file >= 9 || rank < 0 || rank >= 9) return;
  return file + 9 * rank;
}

export function shogigroundDests(pos: Position): Map<ChessSquareName, ChessSquareName[]> {
  const result = new Map();
  const ctx = pos.ctx();
  for (const [from, squares] of pos.allDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeChessSquare(s));
      result.set(makeChessSquare(from), d);
    }
  }
  return result;
}

export function shogigroundDropDests(pos: Position, role?: PocketRole): Map<PocketRole, ChessSquareName[]> {
  const result = new Map();
  if (role) {
    const squares = pos.dropDests(role);
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeChessSquare(s));
      result.set(role, d);
    }
  } else {
    const ctx = pos.ctx();
    for (const [r, squares] of pos.allDropDests(ctx)) {
      if (squares.nonEmpty()) {
        const d = Array.from(squares, s => makeChessSquare(s));
        result.set(r, d);
      }
    }
  }
  return result;
}

export function scalashogiCharPair(move: Move): string {
  if (isDrop(move))
    return String.fromCharCode(
      34 + move.to,
      34 + 81 + 128 + ['rook', 'bishop', 'knight', 'pawn', 'gold', 'silver', 'lance'].indexOf(move.role)
    );
  else return String.fromCharCode(34 + move.from, move.promotion ? 34 + move.to + 128 : 34 + move.to);
}

export function shogigroundMove(move: Move): ChessSquareName[] {
  return isDrop(move) ? [makeChessSquare(move.to)] : [makeChessSquare(move.from), makeChessSquare(move.to)];
}

export function lishogiVariantRules(variant: 'standard' | 'fromPosition'): Rules {
  switch (variant) {
    case 'standard':
    case 'fromPosition':
      return 'shogi';
  }
}

export function chessCoordToShogiCoord(s: ChessSquareName): SquareName {
  return makeSquare(parseChessSquare(s));
}

export function shogiCoordToChessCord(s: SquareName): ChessSquareName {
  return makeChessSquare(parseSquare(s));
}

export function chessCoord(str: string): ChessSquareName | undefined {
  if (str.match(/^[1-9][a-i]$/)) return shogiCoordToChessCord(str as SquareName);
  if (str.match(/^[a-i][1-9]$/)) return str as ChessSquareName;
  return undefined;
}

export function shogiCoord(str: string): SquareName | undefined {
  if (str.match(/^[1-9][a-i]$/)) return str as SquareName;
  if (str.match(/^[a-i][1-9]$/)) return chessCoordToShogiCoord(str as ChessSquareName);
  else return undefined;
}

export function roleToLishogiChar(role: Role): string {
  switch (role) {
    case 'pawn':
      return 'p';
    case 'lance':
      return 'l';
    case 'knight':
      return 'n';
    case 'silver':
      return 's';
    case 'gold':
      return 'g';
    case 'bishop':
      return 'b';
    case 'rook':
      return 'r';
    case 'tokin':
      return 't';
    case 'promotedlance':
      return 'u';
    case 'promotedknight':
      return 'm';
    case 'promotedsilver':
      return 'a';
    case 'horse':
      return 'h';
    case 'dragon':
      return 'd';
    case 'king':
      return 'k';
  }
}

export function lishogiCharToRole(
  ch:
    | 'p'
    | 'l'
    | 'n'
    | 's'
    | 'g'
    | 'b'
    | 'r'
    | 't'
    | 'u'
    | 'm'
    | 'a'
    | 'h'
    | 'd'
    | 'P'
    | 'L'
    | 'N'
    | 'S'
    | 'G'
    | 'B'
    | 'R'
    | 'T'
    | 'U'
    | 'M'
    | 'A'
    | 'H'
    | 'D'
): Role;
export function lishogiCharToRole(ch: string): Role | undefined;
export function lishogiCharToRole(ch: string): Role | undefined {
  switch (ch) {
    case 'P':
    case 'p':
      return 'pawn';
    case 'L':
    case 'l':
      return 'lance';
    case 'N':
    case 'n':
      return 'knight';
    case 'S':
    case 's':
      return 'silver';
    case 'G':
    case 'g':
      return 'gold';
    case 'B':
    case 'b':
      return 'bishop';
    case 'R':
    case 'r':
      return 'rook';
    case 'T':
    case 't':
      return 'tokin';
    case 'U':
    case 'u':
      return 'promotedlance';
    case 'M':
    case 'm':
      return 'promotedknight';
    case 'A':
    case 'a':
      return 'promotedsilver';
    case 'H':
    case 'h':
      return 'horse';
    case 'D':
    case 'd':
      return 'dragon';
    case 'K':
    case 'k':
      return 'king';
    default:
      return;
  }
}

export function parseLishogiUci(str: string): Move | undefined {
  if (str[1] === '*' && str.length === 4) {
    const role = lishogiCharToRole(str[0]) as PocketRole;
    const to = parseChessSquare(str.slice(2));
    if (defined(role) && defined(to)) return { role, to };
  } else if (str.length === 4 || str.length === 5) {
    const from = parseChessSquare(str.slice(0, 2));
    const to = parseChessSquare(str.slice(2, 4));
    const promotion = str[4] === '+' ? true : false;
    if (defined(from) && defined(to)) return { from, to, promotion };
  }
  return;
}

export function makeLishogiUci(move: Move): string {
  if (isDrop(move)) return `${roleToLishogiChar(move.role).toUpperCase()}*${makeChessSquare(move.to)}`;
  return makeChessSquare(move.from) + makeChessSquare(move.to) + (move.promotion ? '+' : '');
}

export function assureUsi(str: string): string | undefined {
  if (str.match(/^([1-9][a-i]|([RBGSNLP]\*))[1-9][a-i](\+|\=)?$/)) return str;
  if (str.match(/^([a-i][1-9]|([RBGSNLP]\*))[a-i][1-9](\+|\=)?$/)) return makeUsi(parseLishogiUci(str)!);
  return;
}

export function assureLishogiUci(str: string): string | undefined {
  if (str.match(/^([a-i][1-9]|([RBGSNLP]\*))[a-i][1-9](\+|\=)?$/)) return str;
  if (str.match(/^([1-9][a-i]|([RBGSNLP]\*))[1-9][a-i](\+|\=)?$/)) return makeLishogiUci(parseUsi(str)!);
  return;
}
