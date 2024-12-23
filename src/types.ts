import type { Board } from './board.js';
import type { COLORS, FILE_NAMES, RANK_NAMES, RESULTS, ROLES, RULES } from './constants.js';
import type { Hands } from './hands.js';
import type { SquareSet } from './square-set.js';

export type FileName = (typeof FILE_NAMES)[number];

export type RankName = (typeof RANK_NAMES)[number];

export type Square = number;

export type SquareName = `${FileName}${RankName}`;

export type Color = (typeof COLORS)[number];

export interface Dimensions {
  ranks: number;
  files: number;
}

export type Role = (typeof ROLES)[number];

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

export type MoveOrDrop = NormalMove | DropMove;

export interface Setup {
  board: Board;
  hands: Hands;
  turn: Color;
  moveNumber: number;
  lastMoveOrDrop?:
    | MoveOrDrop
    | {
        to: Square;
      };
  lastLionCapture?: Square; // by non-lion piece
}

export type Result = (typeof RESULTS)[number];

export type Rules = (typeof RULES)[number];

export interface Outcome {
  result: Result;
  winner: Color | undefined;
}

export interface Handicap {
  rules: Rules;
  sfen: string;
  japaneseName: string;
  englishName: string;
}
