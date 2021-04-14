import { squareFile, squareRank } from './util';
import { Square, Piece, Color, BySquare } from './types';
import { SquareSet } from './squareSet';

function computeRange(square: Square, deltas: number[]): SquareSet {
  let range = SquareSet.empty();
  for (const delta of deltas) {
    const sq = square + delta;
    if (0 <= sq && sq < 81 && Math.abs(squareFile(square) - squareFile(sq)) <= 2) {
      range = range.with(sq);
    }
  }
  return range;
}

function tabulate<T>(f: (square: Square) => T): BySquare<T> {
  const table = [];
  for (let square = 0; square < 81; square++) table[square] = f(square);
  return table;
}

const KING_ATTACKS = tabulate(sq => computeRange(sq, [-10, -9, -8, -1, 1, 8, 9, 10]));
const KNIGHT_ATTACKS = {
  sente: tabulate(sq => computeRange(sq, [17, 19])),
  gote: tabulate(sq => computeRange(sq, [-17, -19])),
};
const PAWN_ATTACKS = {
  sente: tabulate(sq => computeRange(sq, [9])),
  gote: tabulate(sq => computeRange(sq, [-9])),
};
const SILVER_ATTACKS = {
  sente: tabulate(sq => computeRange(sq, [-10, -8, 8, 9, 10])),
  gote: tabulate(sq => computeRange(sq, [-10, -9, -8, 8, 10])),
};
const GOLD_ATTACKS = {
  sente: tabulate(sq => computeRange(sq, [-9, -1, 1, 8, 9, 10])),
  gote: tabulate(sq => computeRange(sq, [-10, -9, -8, -1, 1, 9])),
};

export function kingAttacks(square: Square): SquareSet {
  return KING_ATTACKS[square];
}

export function knightAttacks(color: Color, square: Square): SquareSet {
  return KNIGHT_ATTACKS[color][square];
}

export function silverAttacks(color: Color, square: Square): SquareSet {
  return SILVER_ATTACKS[color][square];
}

export function goldAttacks(color: Color, square: Square): SquareSet {
  return GOLD_ATTACKS[color][square];
}

export function pawnAttacks(color: Color, square: Square): SquareSet {
  return PAWN_ATTACKS[color][square];
}

const FILE_RANGE = tabulate(sq => SquareSet.fromFile(squareFile(sq)).without(sq));
const RANK_RANGE = tabulate(sq => SquareSet.fromRank(squareRank(sq)).without(sq));

const FORW_RANGE = tabulate(sq => SquareSet.forwardRanks(squareRank(sq)).without(sq));
const BACK_RANGE = tabulate(sq => SquareSet.backwardRanks(squareRank(sq)).without(sq));

const DIAG_RANGE = tabulate(sq => {
  const diag = new SquareSet(0x100401, 0x802008, 0x4010040);
  const shift = 9 * (squareRank(sq) - squareFile(sq));
  return (shift >= 0 ? diag.shl81(shift) : diag.shr81(-shift)).without(sq);
});

const ANTI_DIAG_RANGE = tabulate(sq => {
  const diag = new SquareSet(0x1010100, 0x202020, 0x40404);
  const shift = 9 * (squareRank(sq) + squareFile(sq) - 8);
  return (shift >= 0 ? diag.shl81(shift) : diag.shr81(-shift)).without(sq);
});

function hyperbola(bit: SquareSet, range: SquareSet, occupied: SquareSet): SquareSet {
  let forward = occupied.intersect(range);
  let reverse = forward.bswap81(); // Assumes no more than 1 bit per rank
  forward = forward.minus81(bit);
  reverse = reverse.minus81(bit.bswap81());
  return forward.xor(reverse.bswap81()).intersect(range);
}

function fileAttacks(square: Square, occupied: SquareSet): SquareSet {
  return hyperbola(SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
}

function rankAttacks(square: Square, occupied: SquareSet): SquareSet {
  const range = RANK_RANGE[square];
  let forward = occupied.intersect(range);
  let reverse = forward.rbit81();
  forward = forward.minus81(SquareSet.fromSquare(square));
  reverse = reverse.minus81(SquareSet.fromSquare(80 - square));
  return forward.xor(reverse.rbit81()).intersect(range);
}

export function bishopAttacks(square: Square, occupied: SquareSet): SquareSet {
  const bit = SquareSet.fromSquare(square);
  return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
}

export function rookAttacks(square: Square, occupied: SquareSet): SquareSet {
  return fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
}

export function lanceAttacks(color: Color, square: Square, occupied: SquareSet): SquareSet {
  return color === 'sente'
    ? fileAttacks(square, occupied).intersect(FORW_RANGE[square])
    : fileAttacks(square, occupied).intersect(BACK_RANGE[square]);
}

export function horseAttacks(square: Square, occupied: SquareSet): SquareSet {
  return bishopAttacks(square, occupied).union(kingAttacks(square));
}

export function dragonAttacks(square: Square, occupied: SquareSet): SquareSet {
  return rookAttacks(square, occupied).union(kingAttacks(square));
}

export function attacks(piece: Piece, square: Square, occupied: SquareSet): SquareSet {
  switch (piece.role) {
    case 'pawn':
      return pawnAttacks(piece.color, square);
    case 'lance':
      return lanceAttacks(piece.color, square, occupied);
    case 'knight':
      return knightAttacks(piece.color, square);
    case 'silver':
      return silverAttacks(piece.color, square);
    case 'promotedKnight':
    case 'promotedLance':
    case 'promotedSilver':
    case 'tokin':
    case 'gold':
      return goldAttacks(piece.color, square);
    case 'bishop':
      return bishopAttacks(square, occupied);
    case 'rook':
      return rookAttacks(square, occupied);
    case 'horse':
      return horseAttacks(square, occupied);
    case 'dragon':
      return dragonAttacks(square, occupied);
    case 'king':
      return kingAttacks(square);
  }
}

export function ray(a: Square, b: Square): SquareSet {
  const other = SquareSet.fromSquare(b);
  if (RANK_RANGE[a].intersects(other)) return RANK_RANGE[a].with(a);
  if (ANTI_DIAG_RANGE[a].intersects(other)) return ANTI_DIAG_RANGE[a].with(a);
  if (DIAG_RANGE[a].intersects(other)) return DIAG_RANGE[a].with(a);
  if (FILE_RANGE[a].intersects(other)) return FILE_RANGE[a].with(a);
  return SquareSet.empty();
}

export function between(a: Square, b: Square): SquareSet {
  return ray(a, b)
    .intersect(SquareSet.full().shl81(a).xor(SquareSet.full().shl81(b)))
    .withoutFirst();
}
