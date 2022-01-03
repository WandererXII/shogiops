import { parseUsi } from '../../src';
import { Shogi } from '../../src/shogi';
import { makeWesternEngineMove } from '../../src/notation/westernEngine';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeWesternEngineMove(pos, move)).toEqual('P-7f');
  pos.play(move);
  expect(makeWesternEngineMove(pos, parseUsi('3c3d')!)).toEqual('P-3d');
});

test('amb moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('6i5h')!;
  expect(makeWesternEngineMove(pos, move)).toEqual('G6i-5h');
});
