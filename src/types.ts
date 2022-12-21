import type { Board } from './board.js';
import type { Hands } from './hands.js';
import type { SquareSet } from './squareSet.js';

export const FILE_NAMES = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
] as const;
export type FileName = typeof FILE_NAMES[number];

export const RANK_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'] as const;
export type RankName = typeof RANK_NAMES[number];

export type Square = number;

export type SquareName = `${FileName}${RankName}`;

export const COLORS = ['sente', 'gote'] as const;

export type Color = typeof COLORS[number];

export interface Dimensions {
  ranks: number;
  files: number;
}

export const ROLES = [
  'lance',
  'knight',
  'silver',
  'gold',
  'king',
  'bishop',
  'rook',
  'pawn',
  'tokin',
  'promotedlance',
  'promotedsilver',
  'promotedknight',
  'horse',
  'dragon',
  // chushogi
  'promotedpawn',
  'leopard',
  'copper',
  'elephant',
  'chariot',
  'tiger',
  'kirin',
  'phoenix',
  'sidemover',
  'verticalmover',
  'lion',
  'queen',
  'gobetween',
  'whitehorse',
  'lionpromoted',
  'queenpromoted',
  'bishoppromoted',
  'sidemoverpromoted',
  'verticalmoverpromoted',
  'rookpromoted',
  'prince',
  'whale',
  'horsepromoted',
  'elephantpromoted',
  'stag',
  'boar',
  'ox',
  'falcon',
  'eagle',
  'dragonpromoted',
] as const;
export type Role = typeof ROLES[number];

export type RoleMap = Map<Role, SquareSet>;
export type ColorMap = Map<Color, SquareSet>;
export type HandMap = Map<Role, number>;

export interface Piece {
  role: Role;
  color: Color;
}

export type PieceName = `${Color} ${Role}`;

export interface NormalMove {
  from: Square;
  to: Square;
  promotion?: boolean;
  midStep?: Square;
}

export interface DropMove {
  role: Role;
  to: Square;
}

export type Move = NormalMove | DropMove;

export function isDrop(v: Move): v is DropMove {
  return 'role' in v;
}

export function isNormal(v: Move): v is NormalMove {
  return 'from' in v;
}

export interface Setup {
  board: Board;
  hands: Hands;
  turn: Color;
  moveNumber: number;
  lastMove:
    | Move
    | {
        to: Square;
      }
    | undefined;
  lastLionCapture?: Square; // by non-lion piece
}

export const RESULTS = ['checkmate', 'stalemate', 'draw', 'bareking', 'kinglost'] as const;
export type Result = typeof RESULTS[number];

export const RULES = ['standard', 'minishogi', 'chushogi'] as const;
export type Rules = typeof RULES[number];

export interface Outcome {
  result: Result;
  winner: Color | undefined;
}
