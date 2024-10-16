import { makeWesternMoveOrDrop } from '../../src/notation/western.js';
import { parseUsi } from '../../src/util.js';
import { Minishogi } from '../../src/variant/minishogi.js';
import { Shogi } from '../../src/variant/shogi.js';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeWesternMoveOrDrop(pos, move)).toEqual('P-76');
  pos.play(move);
  expect(makeWesternMoveOrDrop(pos, parseUsi('3c3d')!)).toEqual('P-34');
});

test('amb moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('6i5h')!;
  expect(makeWesternMoveOrDrop(pos, move)).toEqual('G69-58');
});

test('minishogi move', () => {
  const pos = Minishogi.default();
  const move = parseUsi('4e4d')!;
  expect(makeWesternMoveOrDrop(pos, move)).toEqual('G-44');
});
