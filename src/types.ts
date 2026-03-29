import type { Board } from './board.js';
import type { COLORS, FILE_NAMES, RANK_NAMES, RESULTS, ROLES, RULES } from './constants.js';
import type { Hands } from './hands.js';

export type FileName = (typeof FILE_NAMES)[number];

export type RankName = (typeof RANK_NAMES)[number];

export type Square = number;

export type SquareName = `${FileName}${RankName}`;

export type Color = (typeof COLORS)[number];

export interface Dimensions {
  readonly ranks: number;
  readonly files: number;
}

export type Role = (typeof ROLES)[number];

export interface Piece {
  readonly role: Role;
  readonly color: Color;
}

export type PieceName = `${Color} ${Role}`;

export interface NormalMove {
  readonly from: Square;
  readonly to: Square;
  readonly promotion?: boolean;
  readonly midStep?: Square;
}

export interface DropMove {
  readonly role: Role;
  readonly to: Square;
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
  readonly result: Result;
  readonly winner: Color | undefined;
}

export interface Handicap {
  readonly rules: Rules;
  readonly sfen: string;
  readonly japaneseName: string;
  readonly englishName: string;
}
