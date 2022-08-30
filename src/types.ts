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

export type ByColor<T> = {
  [color in Color]: T;
};

// correct order for sfen hand exporting
export const ROLES = [
  'rook',
  'bishop',
  'gold',
  'silver',
  'knight',
  'lance',
  'pawn',
  'dragon',
  'horse',
  'promotedsilver',
  'promotedknight',
  'promotedlance',
  'tokin',
  'king',
] as const;
export type Role = typeof ROLES[number];

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

export const RULES = ['standard', 'minishogi'] as const;
export type Rules = typeof RULES[number];

export interface Outcome {
  winner: Color | undefined;
}
