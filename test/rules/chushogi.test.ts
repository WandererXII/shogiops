import { test } from 'node:test';
import { shogigroundSecondLionStep } from '../../src/compat.js';
import { initialSfen, parseSfen } from '../../src/sfen.js';
import { opposite, parseSquareName, parseUsi } from '../../src/util.js';
import { expect, perft } from '../debug.js';
import { perfts } from '../fixtures/perftChushogi.js';

test('valid promotions', () => {
  const pos = parseSfen(
    'chushogi',
    '10p1/2I1pP2p1LL/1Rp1PB2LL2/12/7L4/1p10/12/12/11k/12/11K/12 b - 1',
  ).unwrap();
  // capture inside prom zone
  expect(pos.isLegal(parseUsi('7c8b+')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('7c8b')!)).toEqual(true);
  // inside prom zone
  expect(pos.isLegal(parseUsi('7c6b+')!)).toEqual(false);
  expect(pos.isLegal(parseUsi('7c6b')!)).toEqual(true);
  // pawn last rank
  expect(pos.isLegal(parseUsi('7b7a+')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('7b7a')!)).toEqual(true);
  // entering prom zone
  expect(pos.isLegal(parseUsi('5e5c+')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('5e5c')!)).toEqual(true);
  // capture leaving prom zone
  expect(pos.isLegal(parseUsi('11c11f+')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('11c11f')!)).toEqual(true);
});

test('lion moves', () => {
  const pos = parseSfen('chushogi', '12/12/12/12/12/6+O5/12/12/12/12/12/12 b').unwrap();
  expect(pos.moveDests(parseSquareName('6f')).size()).toEqual(24);
  // 1 step, 0 dist move
  expect(pos.isLegal(parseUsi('6f6f')!)).toEqual(false);
  // 1 step, 1 dist move
  expect(pos.isLegal(parseUsi('6f5e')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('6f7g')!)).toEqual(true);
  // 1 step, 2 dist move
  expect(pos.isLegal(parseUsi('6f7d')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('6f4h')!)).toEqual(true);
  // 2 step, back to start
  expect(pos.isLegal(parseUsi('6f6g6f')!)).toEqual(true);
  // 2 step
  expect(pos.isLegal(parseUsi('6f5e6d')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('6f7g8h')!)).toEqual(true);

  const pos2 = parseSfen(
    'chushogi',
    '3l8/11p/10p1/3n5+D2/2i1f7/3N5G2/9+H2/2t2P1i4/2p3+D5/2+H9/12/12 b',
  ).unwrap();
  // jumps
  expect(pos2.isLegal(parseUsi('3g3e')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('3g3f')!)).toEqual(false);
  expect(pos2.isLegal(parseUsi('6i4g')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('6i8g')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('6i7h')!)).toEqual(false);
  // captures
  expect(pos2.isLegal(parseUsi('6i5h')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('6i5h6i')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('6i5h4g')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('3d2c')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('3d1b')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('3d2c1b')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('3d1b2c')!)).toEqual(false);
  expect(pos2.isLegal(parseUsi('10j10i')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('10j10h')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('10j10i10h')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('10j10h10i')!)).toEqual(false);
  // lions
  expect(pos2.isLegal(parseUsi('9f10e')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('9f8e')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('9f9d')!)).toEqual(false);
  expect(pos2.isLegal(parseUsi('9f10e9d')!)).toEqual(false);
  expect(pos2.isLegal(parseUsi('9f8e9d')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('9f9e9d')!)).toEqual(false);

  const pos3 = parseSfen(
    'chushogi',
    '11l/6l5/5Nn5/11n/9N2/12/1N10/9n2/1n7N2/4r7/4nN6/4r7 b',
  ).unwrap();
  expect(pos3.isLegal(parseUsi('7c6c')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('7c6b6c')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('3e1d')!)).toEqual(false);
  expect(pos3.isLegal(parseUsi('3e2e1d')!)).toEqual(false);
  expect(pos3.isLegal(parseUsi('3e2e1d')!)).toEqual(false);
  expect(pos3.isLegal(parseUsi('3i3h')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('3i3h3g')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('3i2h3h')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('7k8k')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('7k8j8k')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('7k8l8k')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('7k8k8j')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('7k8k8l')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('7k7j8k')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('11g11i')!)).toEqual(true);
  expect(pos3.isLegal(parseUsi('11g11h11i')!)).toEqual(true);

  const pos4 = parseSfen('chushogi', '11k/12/12/10bm/9N2/12/5n6/6N5/5r6/12/9K2/12 b').unwrap();
  pos4.play(parseUsi('6h7g')!);
  expect(pos4.isLegal(parseUsi('2d3e')!)).toEqual(true);

  const pos5 = parseSfen('chushogi', '12/12/12/12/12/12/12/12/4+ho3n2/4N7/12/6B5 w').unwrap();
  const pos5Alt = pos5.clone();
  const pos5Alt2 = pos5.clone();
  pos5.play(parseUsi('8i8j8i')!);
  pos5Alt.play(parseUsi('8i8j')!);
  pos5Alt2.play(parseUsi('7i8j+')!);
  expect(pos5.isLegal(parseUsi('6l3i')!)).toEqual(false);
  expect(pos5Alt.isLegal(parseUsi('6l3i')!)).toEqual(false);
  expect(pos5Alt2.isLegal(parseUsi('6l3i')!)).toEqual(false);
  expect(pos5Alt2.isLegal(parseUsi('6l8j')!)).toEqual(true);
});

test('wiki lion moves and more', () => {
  const pos = parseSfen('chushogi', '12/12/12/12/7g4/6n5/5N6/12/12/12/12/12 b').unwrap();
  expect(pos.isLegal(parseUsi('7g6f')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('7g6f5e')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('7g6f6e')!)).toEqual(true);
  const pos2 = parseSfen('chushogi', '12/12/12/12/4B2l4/4S7/5N6/7n4/12/12/12/12 b').unwrap();
  const pos2opp = parseSfen('chushogi', '12/12/12/12/4B2l4/4S7/5N6/7n4/12/12/12/12 w').unwrap();
  expect(pos2.isLegal(parseUsi('7g5h')!)).toEqual(false);
  expect(pos2.isLegal(parseUsi('7g5e')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('8e5h')!)).toEqual(true);
  expect(pos2opp.isLegal(parseUsi('5h7g')!)).toEqual(false);
  expect(pos2opp.isLegal(parseUsi('5h5j')!)).toEqual(true);
  const pos3 = parseSfen('chushogi', '12/12/12/12/3n8/12/5N6/5P6/7b4/12/12/12 b').unwrap();
  const pos3opp = parseSfen('chushogi', '12/12/12/12/3n8/12/5N6/5P6/7b4/12/12/12 w').unwrap();
  expect(pos3.isLegal(parseUsi('7g9e')!)).toEqual(false);
  expect(pos3.isLegal(parseUsi('7g5i')!)).toEqual(true);
  expect(pos3opp.isLegal(parseUsi('9e7g')!)).toEqual(false);
  expect(pos3opp.isLegal(parseUsi('9e10e')!)).toEqual(true);
  expect(pos3opp.isLegal(parseUsi('5i7g')!)).toEqual(true);
  const pos4 = parseSfen('chushogi', '12/12/12/12/3n1H6/3sp7/5N6/5P6/1k5b4/12/12/12 b').unwrap();
  expect(pos4.isLegal(parseUsi('7g9e')!)).toEqual(true);
  expect(pos4.isLegal(parseUsi('7g8f9e')!)).toEqual(false);
  const pos5 = parseSfen('chushogi', '12/12/12/12/12/4N7/4p7/4n7/12/12/12/12 b').unwrap();
  expect(pos5.isLegal(parseUsi('8f8g')!)).toEqual(true);
  expect(pos5.isLegal(parseUsi('8f8h')!)).toEqual(false);
  expect(pos5.isLegal(parseUsi('8f8g8h')!)).toEqual(false);
  const pos6 = parseSfen('chushogi', '12/12/12/12/6+o1r3/4gi6/6N5/7s4/8n3/12/12/12 b').unwrap();
  expect(pos6.isLegal(parseUsi('6g4i')!)).toEqual(false);
  expect(pos6.isLegal(parseUsi('6g5h4i')!)).toEqual(true);
  expect(pos6.isLegal(parseUsi('6g6e')!)).toEqual(false);
  expect(pos6.isLegal(parseUsi('6g7f6e')!)).toEqual(false);
  expect(pos6.isLegal(parseUsi('6g6f6e')!)).toEqual(false);
  expect(pos6.isLegal(parseUsi('6g7f')!)).toEqual(true);
  expect(pos6.isLegal(parseUsi('6g7f8f')!)).toEqual(true);
  const pos7 = parseSfen('chushogi', '12/12/12/12/12/4r7/12/12/5o3n1n/4N6P/12/6B5 w - 1').unwrap();
  const pos7Alt = pos7.clone();
  const pos7Alt2 = pos7.clone();
  const pos7Alt3 = pos7.clone();
  pos7.play(parseUsi('8f8j')!);
  pos7Alt.play(parseUsi('7i8j+')!);
  pos7Alt2.play(parseUsi('7i8j')!);
  pos7Alt3.play(parseUsi('3i4i3i')!);
  expect(pos7.isLegal(parseUsi('6l8j')!)).toEqual(true);
  expect(pos7.isLegal(parseUsi('6l3i')!)).toEqual(false);
  expect(pos7Alt.lastLionCapture).toEqual(parseSquareName('8j'));
  expect(pos7Alt.isLegal(parseUsi('6l8j')!)).toEqual(true);
  expect(pos7Alt.isLegal(parseUsi('6l3i')!)).toEqual(false);
  expect(pos7Alt2.isLegal(parseUsi('6l8j')!)).toEqual(true);
  expect(pos7Alt2.isLegal(parseUsi('6l3i')!)).toEqual(false);
  expect(pos7Alt3.isLegal(parseUsi('6l3i')!)).toEqual(true);
  expect(pos7Alt3.isLegal(parseUsi('1j1i')!)).toEqual(true);
  const pos8 = parseSfen('chushogi', '12/12/3l8/12/3b4+o3/6n5/4N7/6R5/7K4/12/12/12 b - 1').unwrap();
  expect(pos8.isLegal(parseUsi('8g6f')!)).toEqual(false);
});

test('falcon/eagle second move', () => {
  const pos = parseSfen('chushogi', 'k11/12/12/12/6n5/6P5/12/5+h6/12/5N6/12/11K b').unwrap();
  expect(pos.isLegal(parseUsi('6f6e')!)).toEqual(true);
  pos.play(parseUsi('6f6e')!);
  expect(pos.isLegal(parseUsi('7h7i')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('7h7i7j')!)).toEqual(false);
  const dests = shogigroundSecondLionStep(pos, '7h', '7i').get('7i');
  expect(dests && !dests.includes('7j') && dests.length > 0).toEqual(true);

  const pos2 = parseSfen('chushogi', 'k11/12/12/12/6n5/6P5/12/7+d4/12/5N6/12/11K b').unwrap();
  pos2.play(parseUsi('6f6e')!);
  expect(pos2.isLegal(parseUsi('5h6i')!)).toEqual(true);
  expect(pos2.isLegal(parseUsi('5h6i7j')!)).toEqual(false);
  const dests2 = shogigroundSecondLionStep(pos2, '5h', '6i').get('6i');

  expect(dests2 && !dests2.includes('7j') && dests2.length > 0).toEqual(true);
});

test('bare king', () => {
  const pos = parseSfen('chushogi', '12/12/12/12/6k5/4g7/4G7/6K5/12/12/12/12 b - 1').unwrap();
  expect(pos.outcome()).toEqual(undefined);
  pos.play(parseUsi('8g8f')!);
  expect(pos.outcome()?.result).toEqual('bareKing');
  expect(pos.outcome()?.winner).toEqual('sente');

  const pos2 = parseSfen('chushogi', '12/12/12/12/3I2k5/12/12/5+pK5/12/12/12/12 b - 1').unwrap();
  expect(pos2.outcome()).toEqual(undefined);
  pos2.play(parseUsi('6h7h')!);
  expect(pos2.outcome()).toEqual(undefined);
  pos2.play(parseUsi('6e7d')!);
  expect(pos2.outcome()).toEqual(undefined);
  pos2.play(parseUsi('9e9d+')!);
  expect(pos2.outcome()?.result).toEqual('bareKing');

  const pos3 = parseSfen(
    'chushogi',
    '1P3PP3P1/12/12/12/6k5/12/12/6K5/12/12/12/l10l b - 1',
  ).unwrap();
  expect(pos3.outcome()?.result).toEqual('draw');

  const pos4 = parseSfen('chushogi', '12/12/12/12/6k5/5g6/4G7/6K5/12/12/12/12 b - 1').unwrap();
  expect(pos4.outcome()).toEqual(undefined);
  pos4.play(parseUsi('8g7f')!);
  expect(pos4.outcome()).toEqual(undefined);
  const pos4alt = pos4.clone();
  pos4.play(parseUsi('6e7f')!);
  pos4alt.play(parseUsi('6e6d')!);
  expect(pos4.outcome()?.result).toEqual('draw');
  expect(pos4alt.outcome()?.result).toEqual('bareKing');

  const pos5 = parseSfen('chushogi', '12/12/12/12/6k5/5K6/12/4G7/12/12/12/12 w - 1').unwrap();
  expect(pos5.outcome()).toEqual(undefined);
  pos5.turn = opposite(pos5.turn);
  expect(pos5.outcome()).toEqual(undefined);
});

const chushogiPerfts: [string, number, number][] = [
  ['', 1, 36],
  ['', 2, 1296],
  ['11k/12/12/12/12/4r7/12/12/9n2/4+o7/12/6B4K b 8j', 1, 7],
  ['11k/12/12/12/12/4r7/12/12/9n2/4+o7/12/6B4K b -', 1, 8],
];

const soloPiecePefts: [string, number, number][] = [
  ['12/12/12/12/12/12/5N6/12/12/12/12/12 b', 1, 24 + 8 * 8], // solo lion
  ['12/12/12/12/12/12/5+O6/12/12/12/12/12 b', 1, 24 + 8 * 8], // solo +lion
  ['12/12/12/12/12/12/5+H6/12/12/12/12/12 b', 1, 41], // solo falcon
  ['12/12/12/12/12/12/5+D6/12/12/12/12/12 b', 1, 40], // solo eagle
  ['12/12/12/12/7g4/6n5/5N6/12/12/12/12/12 b - 1', 1, 24 + 8 * 8],
  ['12/12/12/12/4B2l4/4S7/5N6/7n4/12/12/12/12 b - 1', 1, 98],
];

test('chushogi perft', () => {
  chushogiPerfts.forEach(([sfen, depth, res]) => {
    const pos = parseSfen('chushogi', sfen || initialSfen('chushogi')).unwrap();
    expect(perft(pos, depth)).toEqual(res);
  });
});

test('chushogi solo piece perft', () => {
  soloPiecePefts.forEach(([sfen, depth, res]) => {
    const pos = parseSfen('chushogi', sfen || initialSfen('chushogi')).unwrap();
    expect(perft(pos, depth, { ignoreEnd: true })).toEqual(res);
  });
});

test('randomly generated perfts - for consistency', () => {
  perfts.forEach((p) => {
    const [sfen, depth, res] = p;
    const pos = parseSfen('chushogi', sfen || initialSfen('chushogi')).unwrap();
    expect(pos.isEnd()).toEqual(false);
    expect(perft(pos, depth)).toEqual(res);
  });
});

test('valid in opposite check', () => {
  const posB = parseSfen('chushogi', '12/12/12/12/12/6k5/5K6/12/12/12/12/12 b - 1').unwrap();
  const posW = parseSfen('chushogi', '12/12/12/12/12/6k5/5K6/12/12/12/12/12 w - 1').unwrap();
  expect(posB.validate(true).isOk).toEqual(true);
  expect(posW.validate(true).isOk).toEqual(true);
});
