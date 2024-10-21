import { makeWesternEngineMoveOrDrop } from '@/notation/westernEngine.js';
import { parseUsi } from '@/util.js';
import { Shogi } from '@/variant/shogi.js';
import { expect, test } from 'vitest';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeWesternEngineMoveOrDrop(pos, move)).toEqual('P-7f');
  pos.play(move);
  expect(makeWesternEngineMoveOrDrop(pos, parseUsi('3c3d')!)).toEqual('P-3d');
});

test('amb moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('6i5h')!;
  expect(makeWesternEngineMoveOrDrop(pos, move)).toEqual('G6i-5h');
});
