import { perft } from '../../src/debug';
import { initialSfen, parseSfen } from '../../src/sfen';
import { parseSquareName, parseUsi } from '../../src/util';
import { Kyotoshogi } from '../../src/variant/kyotoshogi';
import { perfts } from '../fixtures/perftKyotoshogi';

const kyotoshogiPerfts: [string, number, number][] = [
  ['', 1, 12],
  ['', 2, 137],
  ['', 3, 1636],
  ['', 4, 18268],
  // ['', 5, 225903],
  ['1S3/L2k1/5/1Kl2/2n2 w Psgp 58', 1, 120],
  ['kl3/1n3/G4/5/TSK1P b P', 1, 47],
];

test.each(kyotoshogiPerfts)('kyotoshogi perft: %s (%s): %s', (sfen, depth, res) => {
  const pos = parseSfen('kyotoshogi', sfen || initialSfen('kyotoshogi')).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});

test('kyotoshogi checkmate', () => {
  const pos = parseSfen('kyotoshogi', 'r1k1N/T1L2/2NBK/5/1S3 w P').unwrap();
  expect(pos.outcome()).toEqual({ result: 'checkmate', winner: 'sente' });
});

test('pawn checkmate', () => {
  const pos = parseSfen('kyotoshogi', 'kl3/1n3/G4/5/TSK1P b P').unwrap();
  expect(pos.isLegal({ to: parseSquareName('5b')!, role: 'pawn' })).toBe(true);
});

test('pieces in dead zone', () => {
  const posRes = parseSfen('kyotoshogi', 'PgksL/5/5/5/pSKGl b');
  expect(posRes.isOk).toBe(true);
  expect(posRes.unwrap().validate(true).isOk).toBe(true);
});

test('king cannnot promote', () => {
  const pos = parseSfen('kyotoshogi', initialSfen('kyotoshogi')).unwrap();
  expect(pos.isLegal(parseUsi('3e3d+')!)).toBe(false);
  expect(pos.isLegal(parseUsi('3e3d')!)).toBe(true);
});

test('kyotoshogi default', () => {
  expect(Kyotoshogi.default()).toEqual(parseSfen('kyotoshogi', initialSfen('kyotoshogi')).unwrap());
});

test('randomly generated perfts - for consistency', () => {
  perfts.forEach(p => {
    const [sfen, depth, res] = p,
      pos = parseSfen('kyotoshogi', sfen || initialSfen('kyotoshogi')).unwrap();
    expect(perft(pos, depth, false)).toBe(res);
  });
});
