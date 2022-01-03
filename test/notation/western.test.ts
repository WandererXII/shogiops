import { parseUsi } from '../../src';
import { Shogi } from '../../src/shogi';
import { makeWesternMove } from '../../src/notation/western';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeWesternMove(pos, move)).toEqual('P-76');
  pos.play(move);
  expect(makeWesternMove(pos, parseUsi('3c3d')!)).toEqual('P-34');
});

test('amb moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('6i5h')!;
  expect(makeWesternMove(pos, move)).toEqual('G69-58');
});
