import { perft } from '../../src/debug';
import { initialSfen, parseSfen } from '../../src/sfen';
import { parseSquareName, parseUsi } from '../../src/util';
import { Hasamishogi, hasamishogiCapturedSquares } from '../../src/variant/hasamishogi';

const hasamishogiPerfts: [string, number, number][] = [['', 1, 7 * 9]];

test.each(hasamishogiPerfts)('hasamishogi perft: %s (%s): %s', (sfen, depth, res) => {
  const pos = parseSfen('hasamishogi', sfen || initialSfen('hasamishogi')).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});

test('hasamishogi default', () => {
  expect(Hasamishogi.default()).toEqual(parseSfen('hasamishogi', initialSfen('hasamishogi')).unwrap());
});

test('basic capture', () => {
  const pos = parseSfen('hasamishogi', 'p1pPppppp/9/9/9/9/9/9/9/PPP1PPPPP b').unwrap();
  expect(pos.board.has(parseSquareName('7a'))).toBe(true);
  pos.play(parseUsi('8i8a')!);
  expect(pos.board.has(parseSquareName('7a'))).toBe(false);

  const pos2 = parseSfen('hasamishogi', '9/9/9/4pP3/9/3P2p2/9/9/9 b').unwrap();
  expect(pos2.board.has(parseSquareName('5d'))).toBe(true);
  pos2.play(parseUsi('6f6d')!);
  expect(pos2.board.has(parseSquareName('5d'))).toBe(false);

  const pos2Opp = parseSfen('hasamishogi', '9/9/9/4pP3/9/3P2p2/9/9/9 w').unwrap();
  expect(pos2Opp.board.has(parseSquareName('4d'))).toBe(true);
  pos2Opp.play(parseUsi('3f3d')!);
  expect(pos2Opp.board.has(parseSquareName('4d'))).toBe(false);

  const posVert = parseSfen('hasamishogi', '9/9/9/3P5/6p2/6P2/8p/9/9 b').unwrap();
  expect(posVert.board.has(parseSquareName('3e'))).toBe(true);
  posVert.play(parseUsi('6d3d')!);
  expect(posVert.board.has(parseSquareName('3e'))).toBe(false);

  const posVertOpp = parseSfen('hasamishogi', '9/9/9/3P5/6p2/6P2/8p/9/9 w').unwrap();
  expect(posVertOpp.board.has(parseSquareName('3f'))).toBe(true);
  posVertOpp.play(parseUsi('1g3g')!);
  expect(posVertOpp.board.has(parseSquareName('3f'))).toBe(false);

  const posDiag = parseSfen('hasamishogi', '9/9/9/9/4p4/3P1P3/9/4p4/9 b').unwrap();
  expect(posDiag.board.has(parseSquareName('5e'))).toBe(true);
  posDiag.play(parseUsi('6f6d')!);
  expect(posDiag.board.has(parseSquareName('5e'))).toBe(true);

  const posNoConnection = parseSfen('hasamishogi', '4P4/9/4p4/9/1Pp2pp1P/9/4P4/9/9 b').unwrap();
  expect(posNoConnection.board.occupied.size()).toBe(8);
  posNoConnection.play(parseUsi('5g5e')!);
  expect(posNoConnection.board.occupied.size()).toBe(8);
});

test('corner capture', () => {
  const posTR = parseSfen('hasamishogi', 'p3P3p/8P/9/9/9/9/9/9/p7p b').unwrap();
  expect(posTR.board.has(parseSquareName('1a'))).toBe(true);
  posTR.play(parseUsi('5a2a')!);
  expect(posTR.board.has(parseSquareName('1a'))).toBe(false);

  const posTR2 = parseSfen('hasamishogi', 'p6Pp/9/9/9/8P/9/9/9/p7p b').unwrap();
  expect(posTR2.board.has(parseSquareName('1a'))).toBe(true);
  posTR2.play(parseUsi('1e1b')!);
  expect(posTR2.board.has(parseSquareName('1a'))).toBe(false);

  const posTR3 = parseSfen('hasamishogi', 'p5P1p/9/9/9/8P/9/9/9/p7p b').unwrap();
  posTR3.play(parseUsi('1e1b')!);
  expect(posTR3.board.has(parseSquareName('1a'))).toBe(true);

  const posTL = parseSfen('hasamishogi', 'p3P3p/P8/9/9/9/9/9/9/p7p b').unwrap();
  expect(posTL.board.has(parseSquareName('9a'))).toBe(true);
  posTL.play(parseUsi('5a8a')!);
  expect(posTL.board.has(parseSquareName('9a'))).toBe(false);

  const posBR = parseSfen('hasamishogi', 'p7p/9/9/9/9/9/9/8P/p3P3p b').unwrap();
  expect(posBR.board.has(parseSquareName('1i'))).toBe(true);
  posBR.play(parseUsi('5i2i')!);
  expect(posBR.board.has(parseSquareName('1i'))).toBe(false);

  const posBL = parseSfen('hasamishogi', 'p7p/9/9/9/9/9/9/P8/p3P3p b').unwrap();
  expect(posBL.board.has(parseSquareName('9i'))).toBe(true);
  posBL.play(parseUsi('5i8i')!);
  expect(posBL.board.has(parseSquareName('9i'))).toBe(false);

  const posTROpp = parseSfen('hasamishogi', 'P3p3P/8p/9/9/9/9/9/9/P7P w').unwrap();
  expect(posTROpp.board.has(parseSquareName('1a'))).toBe(true);
  posTROpp.play(parseUsi('5a2a')!);
  expect(posTROpp.board.has(parseSquareName('1a'))).toBe(false);
});

test('chain capture', () => {
  const pos = parseSfen('hasamishogi', '1pppppppP/9/9/9/9/9/9/9/PPPPPPPP1 b').unwrap();
  expect(hasamishogiCapturedSquares(pos, parseUsi('9i9a')!).size()).toBe(7);
  pos.play(parseUsi('9i9a')!);
  expect(pos.isEnd()).toBe(true);

  const posOpp = parseSfen('hasamishogi', '1pppppppp/9/9/9/9/9/9/9/pPPPPPPP1 w').unwrap();
  expect(hasamishogiCapturedSquares(posOpp, parseUsi('1a1i')!).size()).toBe(7);
  posOpp.play(parseUsi('1a1i')!);
  expect(posOpp.isEnd()).toBe(true);
});

test('multi capture', () => {
  const pos = parseSfen('hasamishogi', '4P4/4p4/4p4/4p4/Pppp1pppP/9/4P4/9/9 b').unwrap();
  expect(hasamishogiCapturedSquares(pos, parseUsi('5g5e')!).size()).toBe(9);
  pos.play(parseUsi('5g5e')!);
  expect(pos.isEnd()).toBe(true);

  const posOpp = parseSfen('hasamishogi', '4p4/4P4/4P4/4P4/pPPP1PPPp/9/4p4/9/9 w').unwrap();
  expect(hasamishogiCapturedSquares(posOpp, parseUsi('5g5e')!).size()).toBe(9);
  posOpp.play(parseUsi('5g5e')!);
  expect(posOpp.isEnd()).toBe(true);

  const posEdge = parseSfen('hasamishogi', '5Pp1p/8P/9/7P1/9/9/9/9/9 b').unwrap();
  expect(hasamishogiCapturedSquares(posEdge, parseUsi('2d2a')!).size()).toBe(2);
  posEdge.play(parseUsi('2d2a')!);
  expect(posEdge.isEnd()).toBe(true);
});

test('safe move into sandwich', () => {
  const pos = parseSfen('hasamishogi', '3p1p3/9/9/4P4/9/9/9/9/9 b').unwrap();
  expect(hasamishogiCapturedSquares(pos, parseUsi('5d5a')!).size()).toBe(0);
  pos.play(parseUsi('5d5a')!);
  expect(pos.isEnd()).toBe(false);

  const posOpp = parseSfen('hasamishogi', '3P1P3/9/9/4p4/9/9/9/9/9 w').unwrap();
  expect(hasamishogiCapturedSquares(posOpp, parseUsi('1a1i')!).size()).toBe(0);
  posOpp.play(parseUsi('5d5a')!);
  expect(posOpp.isEnd()).toBe(false);
});

test('isLegal', () => {
  const pos = parseSfen('hasamishogi', 'ppppppppp/9/9/9/9/9/9/9/PPPPPPPPP b').unwrap();
  expect(pos.isLegal(parseUsi('5i5e')!)).toBe(true);
  expect(pos.isLegal(parseUsi('5i5a')!)).toBe(false);
  const pos2 = parseSfen('hasamishogi', 'pppppp1pp/9/9/9/9/4P1p2/9/9/PPP1P1PPP b').unwrap();
  expect(pos2.isLegal(parseUsi('5i5e')!)).toBe(false);
  expect(pos2.isLegal(parseUsi('5i5f')!)).toBe(false);
  expect(pos2.isLegal(parseUsi('3i3f')!)).toBe(false);
  expect(pos2.isLegal(parseUsi('3i3e')!)).toBe(false);
});
