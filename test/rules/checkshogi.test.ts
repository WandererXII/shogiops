import { test } from 'node:test';
import { initialSfen, parseSfen } from '../../src/sfen.js';
import { parseUsi } from '../../src/util.js';
import { expect, perft } from '../debug.js';

test('starting perft', () => {
  const pos = parseSfen('checkshogi', initialSfen('checkshogi')).unwrap();
  expect(perft(pos, 0)).toEqual(1);
  expect(perft(pos, 1)).toEqual(30);
  expect(perft(pos, 2)).toEqual(900);
  expect(perft(pos, 3)).toEqual(25470);
  expect(perft(pos, 4)).toEqual(719408);
  // expect(perft(pos, 5)).toEqual(19839626);
});

test('check win', () => {
  const pos = parseSfen('checkshogi', '9/3gk4/9/2b6/9/6B2/9/4KG3/9 b - 1', false).unwrap();
  expect(pos.isCheck()).toEqual(false);
  expect(pos.isEnd()).toEqual(false);
  pos.play(parseUsi('3f2e')!);
  expect(pos.isCheck()).toEqual(true);
  expect(pos.isEnd()).toEqual(true);
  expect(pos.outcome()?.result).toEqual('check');
  expect(pos.outcome()?.winner).toEqual('sente');

  const pos2 = parseSfen('checkshogi', '9/3gk4/9/2b6/9/6B2/9/4KG3/9 w - 1', false).unwrap();
  expect(pos2.isCheck()).toEqual(false);
  expect(pos2.isEnd()).toEqual(false);
  pos2.play(parseUsi('7d8e')!);
  expect(pos2.isCheck()).toEqual(true);
  expect(pos2.isEnd()).toEqual(true);
  expect(pos2.outcome()?.result).toEqual('check');
  expect(pos2.outcome()?.winner).toEqual('gote');
});

test('pawn drop checkmate', () => {
  const pos = parseSfen('checkshogi', '3rkr3/9/8p/4N4/1B7/9/1SG6/1KS6/9 b LPp', false).unwrap();
  expect(pos.isCheck()).toEqual(false);
  expect(pos.isEnd()).toEqual(false);
  const md = parseUsi('P*5b')!;
  expect(pos.isLegal(md)).toEqual(true);
  const md2 = parseUsi('L*5b')!;
  expect(pos.isLegal(md2)).toEqual(true);
  pos.play(md2);
  expect(pos.isCheck()).toEqual(true);
  expect(pos.isEnd()).toEqual(true);
  expect(pos.outcome()?.result).toEqual('check');
  expect(pos.outcome()?.winner).toEqual('sente');
});

test('pawn drop check', () => {
  const pos = parseSfen('checkshogi', '3rk4/9/8p/4N4/1B7/9/1SG6/1KS6/9 b LPp 1').unwrap();
  expect(pos.isCheck()).toEqual(false);
  expect(pos.isEnd()).toEqual(false);
  const md = parseUsi('P*5b')!;
  expect(pos.isLegal(md)).toEqual(true);
  pos.play(md);
  expect(pos.isCheck()).toEqual(true);
  expect(pos.isEnd()).toEqual(true);
  expect(pos.outcome()?.result).toEqual('check');
  expect(pos.outcome()?.winner).toEqual('sente');
});
