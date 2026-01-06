import { expect, test } from 'vitest';
import { initialSfen, parseSfen } from '@/sfen.js';
import { SquareSet } from '@/square-set.js';
import { parseSquareName, parseUsi } from '@/util.js';
import { fullSquareSet } from '@/variant/util.js';
import { perft } from '../debug.js';
import { perfts } from '../fixtures/perftAnnan.js';

const annanPerfts: [string, number, number][] = [
  ['', 1, 28],
  ['', 2, 784],
  ['4k3S/r1l1gs3/n+N1s5/L+P4G1+B/1Pp1p1Rb1/4PNpN1/3+pPGPP1/6G1P/1p1K2S1+l w - 1', 1, 35],
  [
    'P1G+N3s1/lp7/2+N+Pp+P1+L+P/1sB1kP3/N1pl1s3/g6p1/+p1B2+p+p+l+p/1+s+r+n4R/1g1pK1+p2 b G3P 167',
    1,
    2,
  ],
  ['1n2g1g2/l2k1p3/p1p1psb1l/r4Ppp1/1p6p/P2p1PPpP/L3+n1S1L/1BKN2GS1/r1G4N1 b 2Psp 83', 1, 7],
  ['Pn2g4/+S2ps3l/4p1p1+P/sPpg1Pk2/lS1rr2pp/p2GnnPP1/LB+p4+nL/2B2K2+p/1p1GP2+p1 b - 129', 1, 46],
  ['9/1k7/9/4b4/4p4/5N3/6K2/9/9 b - 1', 1, 6],
];

test.each(annanPerfts)('annanshogi perft: %s (%s): %s', (sfen, depth, res) => {
  const pos = parseSfen('annanshogi', sfen || initialSfen('annanshogi')).unwrap();
  expect(perft(pos, depth)).toBe(res);
});

test('pieces in dead zone', () => {
  const posRes = parseSfen(
    'annanshogi',
    'lPsgkgLnP/1r5b1/p1ppp1p1p/1p5pp/9/1P3P1P1/P1PP1P2P/1B5n1/lNSGKGpNL b',
  );
  expect(posRes.isOk).toBe(true);
});

test('only friednly pieces give you moves', () => {
  const pos = parseSfen('annanshogi', '9/9/9/4P4/4r4/9/9/9/K7k b').unwrap();
  expect(pos.moveDests(parseSquareName('5d')).size()).toBe(1);

  const pos2 = parseSfen(
    'annanshogi',
    '4k3S/r1l1gs3/n+N1s5/L+P4G1+B/1Pp1p1Rb1/4PNpN1/3+pPGPP1/6G1P/1p1K2S1+l w',
  ).unwrap();
  expect(perft(pos2, 1)).toBe(35);
});

test('do not allow capturing move givers that prevent check', () => {
  const pos = parseSfen(
    'annanshogi',
    '2k5N/3p2+P1G/1+P+P1s2+P+L/1pg1bS3/6Bp1/6G1P/1K1SL+pP2/+ln+pRG1+p1+p/1+lP1+p2R1 b SN2Pnp 205',
  ).unwrap();
  expect(pos.moveDests(parseSquareName('4d')).has(parseSquareName('5c'))).toBe(false);
});

test('checkmate', () => {
  const pos = parseSfen('annanshogi', '4k4/4+R4/9/4L4/9/+B8/9/7GS/7GK w - 1').unwrap();
  const pos2 = parseSfen('annanshogi', '4k4/9/9/4P4/4L4/4N4/4GP3/3P1L3/3L1S3 w - 1').unwrap();

  expect(pos.outcome()).toEqual({ result: 'checkmate', winner: 'sente' });
  expect(pos2.outcome()).toEqual({ result: 'checkmate', winner: 'sente' });
});

test('drop', () => {
  const pos = parseSfen('annanshogi', '5k3/9/9/9/5P3/5L3/9/9/5K3 w p 1').unwrap();
  expect(pos.dropDests({ color: 'gote', role: 'pawn' }).has(parseSquareName('4c'))).toBe(true);
  expect(pos.isLegal({ role: 'pawn', to: parseSquareName('4c') })).toBe(true);

  const pos2 = parseSfen('annanshogi', '4k4/9/4G4/9/9/9/9/9/9 b P 1').unwrap();
  expect(pos2.dropDests({ color: 'sente', role: 'pawn' }).has(parseSquareName('5b'))).toBe(false);
  expect(pos2.isLegal({ role: 'pawn', to: parseSquareName('5b') })).toBe(false);

  const pos3 = parseSfen('annanshogi', '9/9/9/k8/g8/G8/K8/9/9 b NLP 1').unwrap();
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'pawn' })
      .intersect(SquareSet.fromRank(0))
      .equals(SquareSet.fromRank(0).intersect(fullSquareSet('annanshogi'))),
  ).toBe(true);
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'lance' })
      .intersect(SquareSet.fromRank(0))
      .equals(SquareSet.fromRank(0).intersect(fullSquareSet('annanshogi'))),
  ).toBe(true);
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'knight' })
      .intersect(SquareSet.fromRank(0))
      .equals(SquareSet.fromRank(0).intersect(fullSquareSet('annanshogi'))),
  ).toBe(true);
  expect(
    pos3
      .dropDests({ color: 'sente', role: 'knight' })
      .intersect(SquareSet.fromRank(1))
      .equals(SquareSet.fromRank(1).intersect(fullSquareSet('annanshogi'))),
  ).toBe(true);
  expect(pos3.isLegal({ role: 'pawn', to: parseSquareName('5a') })).toBe(true);
  expect(pos3.isLegal({ role: 'lance', to: parseSquareName('5a') })).toBe(true);
  expect(pos3.isLegal({ role: 'knight', to: parseSquareName('5a') })).toBe(true);
  expect(pos3.isLegal({ role: 'knight', to: parseSquareName('5b') })).toBe(true);

  const pos4 = parseSfen('annanshogi', '9/9/9/9/9/k8/n1PPPPPP1/N2G2B2/K8 b 3P 1').unwrap();
  expect(pos4.dropDests({ color: 'sente', role: 'pawn' }).has(parseSquareName('8e'))).toBe(true);
  expect(pos4.dropDests({ color: 'sente', role: 'pawn' }).has(parseSquareName('5e'))).toBe(false);
  expect(pos4.dropDests({ color: 'sente', role: 'pawn' }).size()).toBe(23);
  expect(pos4.isLegal({ role: 'pawn', to: parseSquareName('5a') })).toBe(false);
  expect(pos4.isLegal({ role: 'pawn', to: parseSquareName('1a') })).toBe(true);
  expect(pos4.moveDests(parseSquareName('6g')).size()).toBe(3);
  expect(pos4.isLegal(parseUsi('6g5f')!)).toBe(true);
});

test('promotions', () => {
  const pos = parseSfen('annanshogi', '9/3PL4/2P5N/k6N1/g8/G8/K8/9/5L3 b - 1').unwrap();
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
  const pos = parseSfen('annanshogi', '5k3/9/9/7b1/5P3/5L3/9/9/5K3 w - 1').unwrap();
  expect(pos.moveDests(parseSquareName('2d')).has(parseSquareName('4f'))).toBe(true);
  const posS = parseSfen('annanshogi', '5k3/9/9/5l3/5p3/9/2B6/9/5K3 b - 1').unwrap();
  expect(posS.isLegal(parseUsi('7g4d')!)).toBe(true);
  expect(perft(posS, 1)).toBe(5);
  // 2 checkers
  const pos2 = parseSfen(
    'annanshogi',
    'P1G+N3s1/lp7/2+N+Pp+P1+L+P/1sB1kP3/N1pl1s3/g6p1/+p1B2+p+p+l+p/1+s+r+n4R/1g1pK1+p2 b G3P 167',
  ).unwrap();
  expect(perft(pos2, 1)).toBe(2);

  expect(pos2.isLegal(parseUsi('1h6h')!)).toBe(true);
  expect(pos2.isLegal(parseUsi('7g6h')!)).toBe(true);

  const pos3 = parseSfen('annanshogi', '8k/9/3l5/9/9/9/9/2G+n2+p2/3pK4 b - 1').unwrap();
  expect(perft(pos3, 1)).toBe(1);

  const pos4 = parseSfen('annanshogi', '8k/9/3ll4/9/9/9/4+R4/2G+p2+p2/3pK4 b').unwrap();
  expect(perft(pos4, 1)).toBe(1);

  const pos5 = parseSfen('annanshogi', '9/9/2B3B2/9/4k4/9/2B3B2/9/8K w').unwrap();
  expect(pos5.isLegal(parseUsi('5e5d')!)).toBe(true);
  expect(pos5.isLegal(parseUsi('5e5f')!)).toBe(true);
  expect(pos5.isLegal(parseUsi('5e4e')!)).toBe(true);
  expect(pos5.isLegal(parseUsi('5e6e')!)).toBe(true);
});

test('capture attacker move giver - with king', () => {
  const pos = parseSfen('annanshogi', '9/7Pk/7+R1/9/9/9/9/9/8K w - 1').unwrap();
  expect(pos.moveDests(parseSquareName('1b')).has(parseSquareName('2c'))).toBe(true);

  const pos2 = parseSfen('annanshogi', '9/8k/9/9/9/9/9/p+r7/K8 b - 1').unwrap();
  expect(pos2.moveDests(parseSquareName('9i')).has(parseSquareName('8h'))).toBe(true);
});

test('do not allow discovering check by capturing move giver', () => {
  const pos = parseSfen('annanshogi', '3k5/9/9/3p5/3bG4/9/9/6K2/9 b').unwrap();
  expect(pos.moveDests(parseSquareName('5e')).has(parseSquareName('6d'))).toBe(false);
  expect(perft(pos, 1)).toBe(13);

  const pos2 = parseSfen('annanshogi', '6k2/p8/9/3Bs4/3R5/9/9/6K2/9 w').unwrap();
  expect(pos2.moveDests(parseSquareName('5d')).has(parseSquareName('6e'))).toBe(false);
  expect(perft(pos2, 1)).toBe(10);
});

test('allow moving/capturing square behind attacker with king', () => {
  const pos = parseSfen('annanshogi', '5K3/9/9/9/3B5/4k4/9/9/9 w - 1').unwrap();
  expect(pos.moveDests(parseSquareName('5f')).has(parseSquareName('6f'))).toBe(true);
  expect(perft(pos, 1)).toBe(7);
  const pos2 = parseSfen('annanshogi', '5K3/9/9/9/3B5/3Bk4/9/9/9 w - 1').unwrap();
  expect(pos2.moveDests(parseSquareName('5f')).has(parseSquareName('6f'))).toBe(true);
});

test('proper parse', () => {
  const pos1 = parseSfen('annanshogi', '9/4kP3/5+R3/2B6/9/9/9/9/8K w - 1', true);
  expect(pos1.isOk).toBe(true);

  const pos2 = parseSfen('annanshogi', '3P1PNL1/7N1/5P3/9/4p4/6k2/9/3K5/6nsl b', true);
  expect(pos2.isOk).toBe(true);
});

test('randomly generated perfts - for consistency', () => {
  perfts.forEach((p) => {
    const [sfen, depth, res] = p;
    const pos = parseSfen('annanshogi', sfen || initialSfen('annanshogi')).unwrap();
    expect(pos.isEnd()).toBe(false);
    expect(perft(pos, depth)).toBe(res);
  });
});
