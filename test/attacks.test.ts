import {
  rookAttacks,
  bishopAttacks,
  knightAttacks,
  pawnAttacks,
  kingAttacks,
  silverAttacks,
  goldAttacks,
  lanceAttacks,
  horseAttacks,
  dragonAttacks,
  ray,
  between,
} from '../src/attacks';
import { SquareSet } from '../src/squareSet';

test('rook attacks', () => {
  const center = 40;
  const corner = 0;
  const cornerLast = 80;
  expect(rookAttacks(center, SquareSet.empty())).toEqual(SquareSet.fromFile(4).xor(SquareSet.fromRank(4)));
  expect(rookAttacks(center, new SquareSet(0x0, 0x405010, 0x0))).toEqual(new SquareSet(0x0, 0x405010, 0x0));
  expect(rookAttacks(center, new SquareSet(0x40401, 0x4c25108, 0x77a0100))).toEqual(
    new SquareSet(0x402010, 0x405010, 0x0)
  );
  expect(rookAttacks(center, new SquareSet(0x0, 0x401010, 0x0))).toEqual(new SquareSet(0x0, 0x43d010, 0x0));
  expect(rookAttacks(center, new SquareSet(0x0, 0x5010, 0x10))).toEqual(new SquareSet(0x0, 0x405010, 0x10));
  expect(rookAttacks(center, new SquareSet(0x0, 0x400000, 0x0))).toEqual(new SquareSet(0x402010, 0x43de10, 0x0));

  expect(rookAttacks(corner, SquareSet.empty())).toEqual(new SquareSet(0x403fe, 0x40201, 0x40201));
  expect(rookAttacks(corner, new SquareSet(0x10, 0x0, 0x40000))).toEqual(new SquareSet(0x4021e, 0x40201, 0x40201));
  expect(rookAttacks(corner, new SquareSet(0x40008, 0x200, 0x0))).toEqual(new SquareSet(0x4020e, 0x0, 0x0));

  expect(rookAttacks(cornerLast, SquareSet.empty())).toEqual(new SquareSet(0x4020100, 0x4020100, 0x3fe0100));
  expect(rookAttacks(cornerLast, new SquareSet(0x0, 0x100, 0x3fc0000))).toEqual(
    new SquareSet(0x0, 0x4020100, 0x2020100)
  );
  expect(rookAttacks(cornerLast, new SquareSet(0x0, 0x20000, 0x2010000))).toEqual(
    new SquareSet(0x0, 0x4020000, 0x2020100)
  );

  expect(rookAttacks(71, new SquareSet(0x1110501, 0xa00028, 0x4050444))).toEqual(
    new SquareSet(0x4020100, 0x4020100, 0x4010100)
  );
});

test('bishop attacks', () => {
  const center = 40;
  const corner = 0;
  const cornerLast = 80;
  expect(bishopAttacks(center, SquareSet.empty())).toEqual(new SquareSet(0x1110501, 0xa00028, 0x4050444));
});

test('king attacks', () => {
  expect(kingAttacks(40)).toEqual(new SquareSet(0x0, 0xe05038, 0x0));
  expect(kingAttacks(22)).toEqual(new SquareSet(0xa07000, 0x38, 0x0));
});

test('knight attacks', () => {
  expect(knightAttacks('sente', 40)).toEqual(new SquareSet(0x0, 0x0, 0x28));
  expect(knightAttacks('sente', 70)).toEqual(SquareSet.empty());
  expect(knightAttacks('gote', 40)).toEqual(new SquareSet(0xa00000, 0x0, 0x0));
  expect(knightAttacks('gote', 15)).toEqual(SquareSet.empty());
});

test('pawn attacks', () => {
  expect(pawnAttacks('sente', 40)).toEqual(new SquareSet(0x0, 0x400000, 0x0));
  expect(pawnAttacks('gote', 40)).toEqual(new SquareSet(0x0, 0x10, 0x0));
});

test('silver attacks', () => {
  expect(silverAttacks('sente', 40)).toEqual(new SquareSet(0x0, 0xe00028, 0x0));
  expect(silverAttacks('sente', 49)).toEqual(new SquareSet(0x0, 0x5000, 0x38));
  expect(silverAttacks('gote', 40)).toEqual(new SquareSet(0x0, 0xa00038, 0x0));
});

test('gold attacks', () => {
  expect(goldAttacks('sente', 40)).toEqual(new SquareSet(0x0, 0xe05010, 0x0));
  expect(goldAttacks('sente', 49)).toEqual(new SquareSet(0x0, 0xa02000, 0x38));
  expect(goldAttacks('gote', 40)).toEqual(new SquareSet(0x0, 0x405038, 0x0));
});

test('lance attacks', () => {
  expect(lanceAttacks('sente', 0, SquareSet.empty())).toEqual(new SquareSet(0x40200, 0x40201, 0x40201));
  expect(lanceAttacks('sente', 22, SquareSet.empty())).toEqual(new SquareSet(0x0, 0x402010, 0x402010));
  expect(lanceAttacks('sente', 40, new SquareSet(0x0, 0x400000, 0x0))).toEqual(new SquareSet(0x0, 0x400000, 0x0));
  expect(lanceAttacks('sente', 15, new SquareSet(0x0, 0x814480, 0xe020))).toEqual(
    new SquareSet(0x1000000, 0x1008040, 0x8040)
  );
  expect(lanceAttacks('gote', 40, new SquareSet(0x0, 0x10, 0x0))).toEqual(new SquareSet(0x0, 0x10, 0x0));
  expect(lanceAttacks('gote', 58, SquareSet.empty())).toEqual(new SquareSet(0x402010, 0x402010, 0x0));
  expect(lanceAttacks('gote', 58, new SquareSet(0x400000, 0x0, 0x0))).toEqual(new SquareSet(0x400000, 0x402010, 0x0));
});

test('dragon attacks', () => {
  expect(dragonAttacks(40, SquareSet.empty())).toEqual(new SquareSet(0x402010, 0xe3de38, 0x402010));
  expect(dragonAttacks(40, new SquareSet(0x0, 0x0, 0x10))).toEqual(new SquareSet(0x402010, 0xe3de38, 0x10));
  expect(dragonAttacks(40, new SquareSet(0x0, 0x400000, 0x0))).toEqual(new SquareSet(0x402010, 0xe3de38, 0x0));
});

test('horse attacks', () => {
  expect(horseAttacks(40, SquareSet.empty())).toEqual(new SquareSet(0x1110501, 0xe05038, 0x4050444));
  expect(horseAttacks(40, new SquareSet(0x0, 0x0, 0x10))).toEqual(new SquareSet(0x1110501, 0xe05038, 0x4050444));
  expect(horseAttacks(40, new SquareSet(0x0, 0x8, 0x0))).toEqual(new SquareSet(0x1010100, 0xe05038, 0x4050444));
});

test('ray', () => {
  expect(ray(0, 9)).toEqual(SquareSet.fromFile(0));
});

test('between', () => {
  expect(between(42, 42)).toEqual(SquareSet.empty());
  expect(Array.from(between(0, 3))).toEqual([1, 2]);

  expect(Array.from(between(24, 8))).toEqual([16]);
  expect(Array.from(between(8, 24))).toEqual([16]);
});
