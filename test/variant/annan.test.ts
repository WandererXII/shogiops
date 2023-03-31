import { perft } from '../../src/debug';
import { initialSfen, parseSfen } from '../../src/sfen';
import { SquareSet } from '../../src/squareSet';
import { parseSquareName, parseUsi } from '../../src/util';
import { Annan } from '../../src/variant/annan';
import { fullSquareSet } from '../../src/variant/util';

const annanPerfts: [string, number, number][] = [
  ['', 1, 28],
  ['', 2, 784],
];

test.each(annanPerfts)('annan perft: %s (%s): %s', (sfen, depth, res) => {
  const pos = parseSfen('annan', sfen || initialSfen('annan')).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});

test('annan default', () => {
  expect(Annan.default()).toEqual(parseSfen('annan', initialSfen('annan')).unwrap());
});

test('annan checkmate', () => {
  const pos = parseSfen('annan', '4k4/4+R4/9/4L4/9/+B8/9/7GS/7GK w - 1').unwrap(),
    pos2 = parseSfen('annan', '4k4/9/9/4P4/4L4/4N4/4GP3/3P1L3/3L1S3 w - 1').unwrap();

  expect(pos.outcome()).toEqual({ result: 'checkmate', winner: 'sente' });
  expect(pos2.outcome()).toEqual({ result: 'checkmate', winner: 'sente' });
});

test('drop', () => {
  const pos = parseSfen('annan', '5k3/9/9/9/5P3/5L3/9/9/5K3 w p 1').unwrap();
  expect(pos.dropDests({ color: 'gote', role: 'pawn' }).has(parseSquareName('4c'))).toBe(true);
  expect(pos.isLegal({ role: 'pawn', to: parseSquareName('4c') })).toBe(true);

  const pos2 = parseSfen('annan', '4k4/9/4G4/9/9/9/9/9/9 b P 1').unwrap();
  expect(pos2.dropDests({ color: 'sente', role: 'pawn' }).has(parseSquareName('5b'))).toBe(false);
  expect(pos2.isLegal({ role: 'pawn', to: parseSquareName('5b') })).toBe(false);

  const pos3 = parseSfen('annan', '9/9/9/k8/g8/G8/K8/9/9 b NLP 1').unwrap();
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'pawn' })
      .intersect(SquareSet.fromRank(0))
      .equals(SquareSet.fromRank(0).intersect(fullSquareSet('annan')))
  ).toBe(true);
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'lance' })
      .intersect(SquareSet.fromRank(0))
      .equals(SquareSet.fromRank(0).intersect(fullSquareSet('annan')))
  ).toBe(true);
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'knight' })
      .intersect(SquareSet.fromRank(0))
      .equals(SquareSet.fromRank(0).intersect(fullSquareSet('annan')))
  ).toBe(true);
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'knight' })
      .intersect(SquareSet.fromRank(1))
      .equals(SquareSet.fromRank(1).intersect(fullSquareSet('annan')))
  ).toBe(true);
  expect(pos3.isLegal({ role: 'pawn', to: parseSquareName('5a') })).toBe(true);
  expect(pos3.isLegal({ role: 'lance', to: parseSquareName('5a') })).toBe(true);
  expect(pos3.isLegal({ role: 'knight', to: parseSquareName('5a') })).toBe(true);
  expect(pos3.isLegal({ role: 'knight', to: parseSquareName('5b') })).toBe(true);

  const pos4 = parseSfen('annan', '9/9/9/9/9/k8/n1PPPPPP1/N2G2B2/K8 b 3P 1').unwrap();
  expect(pos4.dropDests({ color: 'sente', role: 'pawn' }).has(parseSquareName('8e'))).toBe(true);
  expect(pos4.dropDests({ color: 'sente', role: 'pawn' }).has(parseSquareName('5e'))).toBe(false);
  expect(pos4.dropDests({ color: 'sente', role: 'pawn' }).size()).toBe(23);
  expect(pos4.isLegal({ role: 'pawn', to: parseSquareName('5a') })).toBe(false);
  expect(pos4.isLegal({ role: 'pawn', to: parseSquareName('1a') })).toBe(true);
  expect(pos4.moveDests(parseSquareName('6g')).size()).toBe(3);
  expect(pos4.isLegal(parseUsi('6g5f')!)).toBe(true);
});

test('promotions', () => {
  const pos = parseSfen('annan', '9/3PL4/2P5N/k6N1/g8/G8/K8/9/5L3 b - 1').unwrap();
  expect(pos.isLegal(parseUsi('6b6a')!)).toBe(true);
  expect(pos.isLegal(parseUsi('6b6a+')!)).toBe(true);
  expect(pos.isLegal(parseUsi('5b5a')!)).toBe(true);
  expect(pos.isLegal(parseUsi('5b5a+')!)).toBe(true);
  expect(pos.isLegal(parseUsi('2d3b')!)).toBe(true);
  expect(pos.isLegal(parseUsi('2d3b+')!)).toBe(true);
  expect(pos.isLegal(parseUsi('1c2a')!)).toBe(true);
  expect(pos.isLegal(parseUsi('1c2a+')!)).toBe(true);
  expect(pos.isLegal(parseUsi('4i4a')!)).toBe(true);
  expect(pos.isLegal(parseUsi('4i4a+')!)).toBe(true);
});

test('capture attacker move giver', () => {
  const pos = parseSfen('annan', '5k3/9/9/7b1/5P3/5L3/9/9/5K3 w - 1').unwrap();
  expect(pos.moveDests(parseSquareName('2d')).has(parseSquareName('4f'))).toBe(true);
});

test('capture attacker move giver - with king', () => {
  const pos = parseSfen('annan', '9/7Pk/7+R1/9/9/9/9/9/8K w - 1').unwrap();
  expect(pos.moveDests(parseSquareName('1b')).has(parseSquareName('2c'))).toBe(true);
});

test('proper parse', () => {
  const pos1 = parseSfen('annan', '9/4kP3/5+R3/2B6/9/9/9/9/8K w - 1', true);
  expect(pos1.isOk).toBe(true);

  const pos2 = parseSfen('annan', '3P1PNL1/7N1/5P3/9/4p4/6k2/9/3K5/6nsl b', true);
  expect(pos2.isOk).toBe(true);
});
