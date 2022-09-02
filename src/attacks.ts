import { opposite, squareFile, squareRank } from './util.js';
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

export function kingAttacks(square: Square): SquareSet {
  return NEIGHBORS[square];
}

export function knightAttacks(square: Square, color: Color): SquareSet {
  if (color === 'sente') return computeRange(square, [-31, -33]);
  else return computeRange(square, [31, 33]);
}

export function silverAttacks(square: Square, color: Color): SquareSet {
  if (color === 'sente') return NEIGHBORS[square].withoutMany([square + 16, square - 1, square + 1]);
  else return NEIGHBORS[square].withoutMany([square - 16, square - 1, square + 1]);
}

export function goldAttacks(square: Square, color: Color): SquareSet {
  if (color === 'sente') return NEIGHBORS[square].withoutMany([square + 17, square + 15]);
  else return NEIGHBORS[square].withoutMany([square - 17, square - 15]);
}

export function pawnAttacks(square: Square, color: Color): SquareSet {
  if (color === 'sente') return SquareSet.fromSquare(square - 16);
  else return SquareSet.fromSquare(square + 16);
}

export function bishopAttacks(square: Square, occupied: SquareSet): SquareSet {
  const bit = SquareSet.fromSquare(square);
  return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
}

export function rookAttacks(square: Square, occupied: SquareSet): SquareSet {
  return fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
}

export function lanceAttacks(square: Square, color: Color, occupied: SquareSet): SquareSet {
  if (color === 'sente') return fileAttacks(square, occupied).intersect(FORW_RANKS[squareRank(square)]);
  else return fileAttacks(square, occupied).intersect(BACK_RANKS[squareRank(square)]);
}

export function horseAttacks(square: Square, occupied: SquareSet): SquareSet {
  return bishopAttacks(square, occupied).union(kingAttacks(square));
}

export function dragonAttacks(square: Square, occupied: SquareSet): SquareSet {
  return rookAttacks(square, occupied).union(kingAttacks(square));
}

// Chushogi pieces

export function goBetweenAttacks(square: Square): SquareSet {
  return SquareSet.fromSquares([square - 16, square + 16]);
}

export function reverseChariotAttacks(square: Square, occupied: SquareSet): SquareSet {
  return fileAttacks(square, occupied);
}

export function sideMoverAttacks(square: Square, occupied: SquareSet): SquareSet {
  return rankAttacks(square, occupied).union(SquareSet.fromSquares([square - 16, square + 16]));
}

export function verticalMoverAttacks(square: Square, occupied: SquareSet): SquareSet {
  return fileAttacks(square, occupied).union(computeRange(square, [-1, 1]));
}

export function copperAttacks(square: Square, color: Color): SquareSet {
  if (color === 'sente') return NEIGHBORS[square].withoutMany([square + 17, square + 15, square + 1, square - 1]);
  else return NEIGHBORS[square].withoutMany([square - 17, square - 15, square - 1, square + 1]);
}

export function ferociousLeopardAttacks(square: Square): SquareSet {
  return NEIGHBORS[square].withoutMany([square + 1, square - 1]);
}

export function blindTigerAttacks(square: Square, color: Color): SquareSet {
  if (color === 'sente') return NEIGHBORS[square].without(square - 16);
  else return NEIGHBORS[square].without(square + 16);
}

export function drunkElephantAttacks(square: Square, color: Color): SquareSet {
  return blindTigerAttacks(square, opposite(color));
}

export function kirinAttacks(square: Square): SquareSet {
  return NEIGHBORS[square]
    .withoutMany([square + 1, square - 1, square + 16, square - 16])
    .union(computeRange(square, [32, -32, -2, 2]));
}

export function phoenixAttacks(square: Square): SquareSet {
  return NEIGHBORS[square]
    .withoutMany([square - 15, square - 17, square + 15, square + 17])
    .union(computeRange(square, [30, 34, -30, -34]));
}

export function freeKingAttacks(square: Square, occupied: SquareSet): SquareSet {
  return rookAttacks(square, occupied).union(bishopAttacks(square, occupied));
}

export function flyingStagAttacks(square: Square, occupied: SquareSet): SquareSet {
  return fileAttacks(square, occupied).union(NEIGHBORS[square]);
}

export function flyingOxAttacks(square: Square, occupied: SquareSet): SquareSet {
  return fileAttacks(square, occupied).union(bishopAttacks(square, occupied));
}

export function freeBoarAttacks(square: Square, occupied: SquareSet): SquareSet {
  return rankAttacks(square, occupied).union(bishopAttacks(square, occupied));
}

export function whaleAttacks(square: Square, color: Color, occupied: SquareSet): SquareSet {
  if (color === 'sente')
    return fileAttacks(square, occupied).union(
      bishopAttacks(square, occupied).intersect(BACK_RANKS[squareRank(square)])
    );
  else
    return fileAttacks(square, occupied).union(
      bishopAttacks(square, occupied).intersect(FORW_RANKS[squareRank(square)])
    );
}

export function whiteHorseAttacks(square: Square, color: Color, occupied: SquareSet): SquareSet {
  return whaleAttacks(square, opposite(color), occupied);
}

export function hornedFalconAttacks(square: Square, color: Color, occupied: SquareSet): SquareSet {
  if (color === 'sente')
    return bishopAttacks(square, occupied)
      .union(rookAttacks(square, occupied).intersect(BACK_RANKS[squareRank(square)]))
      .withMany([square, square - 16, square - 32]);
  else
    return bishopAttacks(square, occupied)
      .union(rookAttacks(square, occupied).intersect(FORW_RANKS[squareRank(square)]))
      .withMany([square, square + 16, square + 32]);
}

export function soaringEagleAttacks(square: Square, color: Color, occupied: SquareSet): SquareSet {
  if (color === 'sente')
    return rookAttacks(square, occupied)
      .union(bishopAttacks(square, occupied).intersect(BACK_RANKS[squareRank(square)]))
      .union(computeRange(square, [-15, -17, 0, -30, -34]));
  else
    return rookAttacks(square, occupied)
      .union(bishopAttacks(square, occupied).intersect(FORW_RANKS[squareRank(square)]))
      .union(computeRange(square, [15, 17, 0, 30, 34]));
}

export function lionAttacks(square: Square): SquareSet {
  return NEIGHBORS[square].union(
    computeRange(square, [-34, -33, -32, -31, -30, -18, -14, -2, 0, 2, 14, 18, 30, 31, 32, 33, 34])
  );
}

export function attacks(piece: Piece, square: Square, occupied: SquareSet): SquareSet {
  switch (piece.role) {
    case 'pawn':
      return pawnAttacks(square, piece.color);
    case 'lance':
      return lanceAttacks(square, piece.color, occupied);
    case 'knight':
      return knightAttacks(square, piece.color);
    case 'silver':
      return silverAttacks(square, piece.color);
    case 'promotedknight':
    case 'promotedlance':
    case 'promotedsilver':
    case 'tokin':
    case 'gold':
      return goldAttacks(square, piece.color);
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
