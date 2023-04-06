import { perft } from '../../src/debug';
import { initialSfen, parseSfen } from '../../src/sfen';
import { SquareSet } from '../../src/squareSet';
import { parseSquareName, parseUsi } from '../../src/util';
import { Annan } from '../../src/variant/annan';
import { fullSquareSet } from '../../src/variant/util';
import { perfts } from '../fixtures/perftAnnan';

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

test('only friednly pieces give you moves', () => {
  const pos = parseSfen('annan', '9/9/9/4P4/4r4/9/9/9/K7k b').unwrap();
  expect(pos.moveDests(parseSquareName('5d')).size()).toBe(1);

  const pos2 = parseSfen('annan', '4k3S/r1l1gs3/n+N1s5/L+P4G1+B/1Pp1p1Rb1/4PNpN1/3+pPGPP1/6G1P/1p1K2S1+l w').unwrap();
  expect(perft(pos2, 1, false)).toBe(35);
});

test('do not allow capturing move givers that prevent check', () => {
  const pos = parseSfen(
    'annan',
    '2k5N/3p2+P1G/1+P+P1s2+P+L/1pg1bS3/6Bp1/6G1P/1K1SL+pP2/+ln+pRG1+p1+p/1+lP1+p2R1 b SN2Pnp 205'
  ).unwrap();
  expect(pos.moveDests(parseSquareName('4d')).has(parseSquareName('5c'))).toBe(false);
});

test('checkmate', () => {
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

  // 2 checkers
  const pos2 = parseSfen(
    'annan',
    'P1G+N3s1/lp7/2+N+Pp+P1+L+P/1sB1kP3/N1pl1s3/g6p1/+p1B2+p+p+l+p/1+s+r+n4R/1g1pK1+p2 b G3P 167'
  ).unwrap();
  expect(perft(pos2, 1, false)).toBe(2);

  expect(pos2.isLegal(parseUsi('1h6h')!)).toBe(true);
  expect(pos2.isLegal(parseUsi('7g6h')!)).toBe(true);

  const pos3 = parseSfen('annan', '8k/9/3l5/9/9/9/9/2G+n2+p2/3pK4 b - 1').unwrap();
  expect(perft(pos3, 1, false)).toBe(1);

  const pos4 = parseSfen('annan', '8k/9/3ll4/9/9/9/4+R4/2G+p2+p2/3pK4 b').unwrap();
  expect(perft(pos4, 1, false)).toBe(1);

  const pos5 = parseSfen('annan', '9/9/2B3B2/9/4k4/9/2B3B2/9/8K w').unwrap();
  expect(pos5.isLegal(parseUsi('5e5d')!)).toBe(true);
  expect(pos5.isLegal(parseUsi('5e5f')!)).toBe(true);
  expect(pos5.isLegal(parseUsi('5e4e')!)).toBe(true);
  expect(pos5.isLegal(parseUsi('5e6e')!)).toBe(true);
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

test('randomly generated perfts - for consistency', () => {
  perfts.forEach(p => {
    const [sfen, depth, res] = p,
      pos = parseSfen('annan', sfen || initialSfen('annan')).unwrap();
    expect(pos.isEnd()).toBe(false);
    expect(perft(pos, depth, false)).toBe(res);
  });
});
