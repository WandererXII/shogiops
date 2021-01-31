import { SquareSet } from '../src/squareSet';

test('full set has all', () => {
  for (let square = 0; square < 81; square++) {
    expect(SquareSet.full().has(square)).toBe(true);
  }
});

test('size', () => {
  let squares = SquareSet.empty();
  for (let i = 0; i < 81; i++) {
    expect(squares.size()).toBe(i);
    squares = squares.with(i);
  }
});

test('shr81', () => {
  const r = new SquareSet(0x1008838, 0x202020, 0xe08804);
  expect(r.shr81(0)).toEqual(r);
  expect(r.shr81(1)).toEqual(new SquareSet(0x80441c, 0x101010, 0x704402));
  expect(r.shr81(26)).toEqual(new SquareSet(0x404040, 0x1c11008, 0x0));
  expect(r.shr81(27)).toEqual(new SquareSet(0x202020, 0xe08804, 0x0));
  expect(r.shr81(53)).toEqual(new SquareSet(0x1c11008, 0x0, 0x0));
  expect(r.shr81(54)).toEqual(new SquareSet(0xe08804, 0x0, 0x0));

  const r2 = new SquareSet(0x783c1e0, 0x783c1e0, 0x783c1e0);
  expect(r2.shr81(5)).toEqual(new SquareSet(0x3c1e0f, 0x3c1e0f, 0x3c1e0f));
  const r3 = new SquareSet(0x633198c, 0x633198c, 0x633198c);
  expect(r3.shr81(2)).toEqual(new SquareSet(0x18cc663, 0x18cc663, 0x18cc663));
});

test('shl81', () => {
  const r = new SquareSet(0x1008838, 0x202020, 0xe08804);
  expect(r.shl81(0)).toEqual(r);
  expect(r.shl81(1)).toEqual(new SquareSet(0x2011070, 0x404040, 0x1c11008));
  expect(r.shl81(3)).toEqual(new SquareSet(0x441c0, 0x1010101, 0x7044020));
  expect(r.shl81(27)).toEqual(new SquareSet(0x0, 0x1008838, 0x202020));
  expect(r.shl81(28)).toEqual(new SquareSet(0x0, 0x2011070, 0x404040));
  expect(r.shl81(53)).toEqual(new SquareSet(0x0, 0x0, 0x80441c));
  expect(r.shl81(54)).toEqual(new SquareSet(0x0, 0x0, 0x1008838));
  expect(r.shl81(63)).toEqual(new SquareSet(0x0, 0x0, 0x1107000));

  const r2 = new SquareSet(0x3c1e0f, 0x3c1e0f, 0x3c1e0f);
  expect(r2.shl81(5)).toEqual(new SquareSet(0x783c1e0, 0x783c1e0, 0x783c1e0));
  const r3 = new SquareSet(0x18cc663, 0x18cc663, 0x18cc663);
  expect(r3.shl81(2)).toEqual(new SquareSet(0x633198c, 0x633198c, 0x633198c));
});

test('rbit81', () => {
  const r = new SquareSet(0x1, 0x0, 0x0);
  const r2 = new SquareSet(0x2001, 0x1, 0x40000);
  expect(SquareSet.full().rbit81()).toEqual(SquareSet.full());
  expect(SquareSet.empty().rbit81()).toEqual(SquareSet.empty());
  expect(r.rbit81()).toEqual(new SquareSet(0x0, 0x0, 0x4000000));
  expect(r2.rbit81()).toEqual(new SquareSet(0x100, 0x4000000, 0x4002000));
});

test('fromRank', () => {
  expect(SquareSet.fromRank(0)).toEqual(new SquareSet(0x000001ff, 0, 0));
  expect(SquareSet.fromRank(1)).toEqual(new SquareSet(0x3fe00, 0x0, 0x0));
  expect(SquareSet.fromRank(2)).toEqual(new SquareSet(0x7fc0000, 0x0, 0x0));
  expect(SquareSet.fromRank(3)).toEqual(new SquareSet(0x0, 0x1ff, 0x0));
  expect(SquareSet.fromRank(4)).toEqual(new SquareSet(0x0, 0x3fe00, 0x0));
  expect(SquareSet.fromRank(5)).toEqual(new SquareSet(0x0, 0x7fc0000, 0x0));
  expect(SquareSet.fromRank(6)).toEqual(new SquareSet(0x0, 0x0, 0x1ff));
  expect(SquareSet.fromRank(7)).toEqual(new SquareSet(0x0, 0x0, 0x3fe00));
  expect(SquareSet.fromRank(8)).toEqual(new SquareSet(0x0, 0x0, 0x7fc0000));
});

test('fromFile', () => {
  expect(SquareSet.fromFile(0)).toEqual(new SquareSet(0x40201, 0x40201, 0x40201));
  expect(SquareSet.fromFile(1)).toEqual(new SquareSet(0x80402, 0x80402, 0x80402));
  expect(SquareSet.fromFile(2)).toEqual(new SquareSet(0x100804, 0x100804, 0x100804));
  expect(SquareSet.fromFile(3)).toEqual(new SquareSet(0x201008, 0x201008, 0x201008));
  expect(SquareSet.fromFile(4)).toEqual(new SquareSet(0x402010, 0x402010, 0x402010));
  expect(SquareSet.fromFile(5)).toEqual(new SquareSet(0x804020, 0x804020, 0x804020));
  expect(SquareSet.fromFile(6)).toEqual(new SquareSet(0x1008040, 0x1008040, 0x1008040));
  expect(SquareSet.fromFile(7)).toEqual(new SquareSet(0x2010080, 0x2010080, 0x2010080));
  expect(SquareSet.fromFile(8)).toEqual(new SquareSet(0x4020100, 0x4020100, 0x4020100));
});

test('backwardRanks', () => {
  expect(SquareSet.backwardRanks(0)).toEqual(SquareSet.empty());
  expect(SquareSet.backwardRanks(9)).toEqual(new SquareSet(0x07ffffff, 0x07ffffff, 0x07ffffff));
  expect(SquareSet.backwardRanks(1)).toEqual(new SquareSet(0x1ff, 0x0, 0x0));
  expect(SquareSet.backwardRanks(4)).toEqual(new SquareSet(0x7ffffff, 0x1ff, 0x0));
});

test('forwardRanks', () => {
  expect(SquareSet.forwardRanks(0)).toEqual(new SquareSet(0x07ffffff, 0x07ffffff, 0x07ffffff));
  expect(SquareSet.forwardRanks(9)).toEqual(SquareSet.empty());
  expect(SquareSet.forwardRanks(5)).toEqual(new SquareSet(0x0, 0x7fc0000, 0x7ffffff));
  expect(SquareSet.forwardRanks(8)).toEqual(new SquareSet(0x0, 0x0, 0x7fc0000));
});

test('more than one', () => {
  expect(new SquareSet(0, 0, 0).moreThanOne()).toBe(false);
  expect(new SquareSet(1, 0, 0).moreThanOne()).toBe(false);
  expect(new SquareSet(0, 1, 0).moreThanOne()).toBe(false);
  expect(new SquareSet(0, 0, 1).moreThanOne()).toBe(false);
  expect(new SquareSet(2, 0, 0).moreThanOne()).toBe(false);
  expect(new SquareSet(0, 4, 0).moreThanOne()).toBe(false);
  expect(new SquareSet(0, 0, 8).moreThanOne()).toBe(false);
  expect(new SquareSet(-2147483648, 0, 0).moreThanOne()).toBe(false);
  expect(new SquareSet(0, 0, -2147483648).moreThanOne()).toBe(false);

  expect(new SquareSet(1, 1, 0).moreThanOne()).toBe(true);
  expect(new SquareSet(1, 1, 1).moreThanOne()).toBe(true);
  expect(new SquareSet(0, 3, 0).moreThanOne()).toBe(true);
  expect(new SquareSet(-1, 0, 0).moreThanOne()).toBe(true);
  expect(new SquareSet(0, 3, 1).moreThanOne()).toBe(true);
  expect(new SquareSet(0, -1, 0).moreThanOne()).toBe(true);
});
