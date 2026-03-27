import { test } from 'node:test';
import { initialSfen, parseSfen } from '../../src/sfen.js';
import { parseUsi } from '../../src/util.js';
import { expect, perft } from '../debug.js';
import { perfts } from '../fixtures/perftKyotoshogi.js';

const kyotoshogiPerfts: [string, number, number][] = [
  ['', 1, 12],
  ['', 2, 137],
  ['', 3, 1636],
  ['', 4, 18268],
  // ['', 5, 225903],
  ['1S3/L2k1/5/1Kl2/2n2 w Psgp 58', 1, 120],
  ['5/2k1l/5/5/pBK2 w Ggtsp 28', 1, 170],
  ['kl3/1n3/G4/5/TSK1P b P', 1, 47],
];

test('kyotoshogi perft', () => {
  kyotoshogiPerfts.forEach(([sfen, depth, res]) => {
    const pos = parseSfen('kyotoshogi', sfen || initialSfen('kyotoshogi')).unwrap();
    expect(perft(pos, depth)).toEqual(res);
  });
});

test('kyotoshogi checkmate', () => {
  const pos = parseSfen('kyotoshogi', 'r1k1N/T1L2/2NBK/5/1S3 w P').unwrap();
  expect(pos.outcome()).toEqual({ result: 'checkmate', winner: 'sente' });
});

test('pawn checkmate', () => {
  const pos = parseSfen('kyotoshogi', 'kl3/1n3/G4/5/TSK1P b P').unwrap();
  expect(pos.isLegal(parseUsi('P*5b')!)).toEqual(true);
  pos.play(parseUsi('P*5b')!);
  expect(pos.outcome()?.result).toEqual('checkmate');
});

test('last rank', () => {
  const pos = parseSfen('kyotoshogi', 'pgkst/R3P/5/5/TSKG1 b P').unwrap();
  expect(pos.isLegal(parseUsi('1b1a+')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('5b5a+')!)).toEqual(true);
});

test('pieces in dead zone', () => {
  const posRes = parseSfen('kyotoshogi', 'PgksL/5/5/5/pSKGl b');
  expect(posRes.isOk).toEqual(true);
  expect(posRes.unwrap().validate(true).isOk).toEqual(true);
});

test('promotion in usi', () => {
  const pos = parseSfen('kyotoshogi', initialSfen('kyotoshogi')).unwrap();
  // king
  expect(pos.isLegal(parseUsi('3e3d+')!)).toEqual(false);
  expect(pos.isLegal(parseUsi('3e3d')!)).toEqual(true);
  // gold
  expect(pos.isLegal(parseUsi('2e3d+')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('2e3d')!)).toEqual(false);
});

test('drops', () => {
  const pos = parseSfen('kyotoshogi', '5/5/5/5/k3K b PTGS').unwrap();
  expect(pos.isLegal(parseUsi('T*3a')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('S*3a')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('G*3a')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('P*3a')!)).toEqual(true);

  expect(pos.isLegal(parseUsi('L*3a')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('B*3a')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('N*3a')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('R*3a')!)).toEqual(true);
});

test('randomly generated perfts - for consistency', () => {
  perfts.forEach((p) => {
    const [sfen, depth, res] = p;
    const pos = parseSfen('kyotoshogi', sfen || initialSfen('kyotoshogi')).unwrap();
    expect(perft(pos, depth)).toEqual(res);
  });
});
