export const FILE_NAMES = ['9', '8', '7', '6', '5', '4', '3', '2', '1'] as const;
export type FileName = typeof FILE_NAMES[number];

export const RANK_NAMES = ['i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] as const;
export type RankName = typeof RANK_NAMES[number];

export type Square = number;

export type SquareName = `${FileName}${RankName}`;

export type BySquare<T> = T[];

export const COLORS = ['sente', 'gote'] as const;

export type Color = typeof COLORS[number];

export type ByColor<T> = {
  [color in Color]: T;
};

export const ROLES = [
  'pawn',
  'lance',
  'knight',
  'silver',
  'gold',
  'bishop',
  'rook',
  'tokin',
  'promotedlance',
  'promotedknight',
  'promotedsilver',
  'horse',
  'dragon',
  'king',
] as const;
export const HAND_ROLES = ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'] as const;
export const PROMOTABLE_ROLES = ['pawn', 'lance', 'knight', 'silver', 'bishop', 'rook'] as const;
export type Role = typeof ROLES[number];
export type HandRole = typeof HAND_ROLES[number];
export type PromotableRole = typeof PROMOTABLE_ROLES[number];

export type ByRole<T> = {
  [role in Role]: T;
};

export interface Piece {
  role: Role;
  color: Color;
}

export interface NormalMove {
  from: Square;
  to: Square;
  promotion?: boolean;
}

export interface DropMove {
  role: HandRole;
  to: Square;
}

export type Move = NormalMove | DropMove;

export function isDrop(v: Move): v is DropMove {
  return 'role' in v;
}

export function isNormal(v: Move): v is NormalMove {
  return 'from' in v;
}

// variant will be added later, once lishogi supports them
export const RULES = ['shogi', 'minishogi'] as const;
export type Rules = typeof RULES[number];

export interface Outcome {
  winner: Color | undefined;
}
