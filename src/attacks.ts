import { squareFile, squareRank } from './util.js';
import { Square, Piece, Color } from './types.js';
import { SquareSet } from './squareSet.js';

function computeRange(square: Square, deltas: number[]): SquareSet {
  const file = squareFile(square),
    dests: Square[] = deltas.map(delta => square + delta).filter(sq => Math.abs(file - squareFile(sq)) <= 2);
  return SquareSet.fromSquares(dests);
}

function tabulateSquares(f: (square: Square) => SquareSet): SquareSet[] {
  const table = [];
  for (let square = 0; square < 256; square++) table[square] = f(square);
  return table;
}

function tabulateRanks(f: (rank: number) => SquareSet): SquareSet[] {
  const table = [];
  for (let rank = 0; rank < 16; rank++) table[rank] = f(rank);
  return table;
}

const FORW_RANKS = tabulateRanks(rank => SquareSet.ranksAbove(rank));
const BACK_RANKS = tabulateRanks(rank => SquareSet.ranksBelow(rank));

const NEIGHBORS = tabulateSquares(sq => computeRange(sq, [-17, -16, -15, -1, 1, 15, 16, 17]));

const FILE_RANGE = tabulateSquares(sq => SquareSet.fromFile(squareFile(sq)).without(sq));
const RANK_RANGE = tabulateSquares(sq => SquareSet.fromRank(squareRank(sq)).without(sq));

const DIAG_RANGE = tabulateSquares(sq => {
  const diag = new SquareSet([0x20001, 0x80004, 0x200010, 0x800040, 0x2000100, 0x8000400, 0x20001000, 0x80004000]);
  const shift = 16 * (squareRank(sq) - squareFile(sq));
  return (shift >= 0 ? diag.shl256(shift) : diag.shr256(-shift)).without(sq);
});

const ANTI_DIAG_RANGE = tabulateSquares(sq => {
  const diag = new SquareSet([0x40008000, 0x10002000, 0x4000800, 0x1000200, 0x400080, 0x100020, 0x40008, 0x10002]);
  const shift = 16 * (squareRank(sq) + squareFile(sq) - 15);
  return (shift >= 0 ? diag.shl256(shift) : diag.shr256(-shift)).without(sq);
});

export function kingAttacks(square: Square): SquareSet {
  return NEIGHBORS[square];
}

export function knightAttacks(color: Color, square: Square): SquareSet {
  if (color === 'sente') return computeRange(square, [-31, -33]);
  else return computeRange(square, [31, 33]);
}

export function silverAttacks(color: Color, square: Square): SquareSet {
  if (color === 'sente') return NEIGHBORS[square].withoutMany([square + 16, square - 1, square + 1]);
  else return NEIGHBORS[square].withoutMany([square - 16, square - 1, square + 1]);
}

export function goldAttacks(color: Color, square: Square): SquareSet {
  if (color === 'sente') return NEIGHBORS[square].withoutMany([square + 17, square + 15]);
  else return NEIGHBORS[square].withoutMany([square - 17, square - 15]);
}

export function pawnAttacks(color: Color, square: Square): SquareSet {
  if (color === 'sente') return SquareSet.fromSquare(square - 16);
  else return SquareSet.fromSquare(square + 16);
}

function hyperbola(bit: SquareSet, range: SquareSet, occupied: SquareSet): SquareSet {
  let forward = occupied.intersect(range);
  let reverse = forward.rowSwap256(); // Assumes no more than 1 bit per rank

  forward = forward.minus256(bit);
  reverse = reverse.minus256(bit.rowSwap256());
  return forward.xor(reverse.rowSwap256()).intersect(range);
}

function fileAttacks(square: Square, occupied: SquareSet): SquareSet {
  return hyperbola(SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
}

function rankAttacks(square: Square, occupied: SquareSet): SquareSet {
  const range = RANK_RANGE[square];
  let forward = occupied.intersect(range);
  let reverse = forward.rbit256();
  forward = forward.minus256(SquareSet.fromSquare(square));
  reverse = reverse.minus256(SquareSet.fromSquare(255 - square));

  return forward.xor(reverse.rbit256()).intersect(range);
}

export function bishopAttacks(square: Square, occupied: SquareSet): SquareSet {
  const bit = SquareSet.fromSquare(square);
  return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
}

export function rookAttacks(square: Square, occupied: SquareSet): SquareSet {
  return fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
}

export function lanceAttacks(color: Color, square: Square, occupied: SquareSet): SquareSet {
  if (color === 'sente') return fileAttacks(square, occupied).intersect(FORW_RANKS[squareRank(square)]);
  else return fileAttacks(square, occupied).intersect(BACK_RANKS[squareRank(square)]);
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
    case 'promotedknight':
    case 'promotedlance':
    case 'promotedsilver':
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
    .intersect(SquareSet.full().shl256(a).xor(SquareSet.full().shl256(b)))
    .withoutFirst();
}
