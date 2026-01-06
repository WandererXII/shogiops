import { expect, test } from 'vitest';
import { makeWesternEngineMoveOrDrop } from '@/notation/western-engine.js';
import { initialSfen, parseSfen } from '@/sfen.js';
import { parseUsi } from '@/util.js';

test('basic moves', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const move = parseUsi('7g7f')!;
  expect(makeWesternEngineMoveOrDrop(pos, move)).toEqual('P-7f');
  pos.play(move);
  expect(makeWesternEngineMoveOrDrop(pos, parseUsi('3c3d')!)).toEqual('P-3d');
});

test('amb moves', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const move = parseUsi('6i5h')!;
  expect(makeWesternEngineMoveOrDrop(pos, move)).toEqual('G6i-5h');
});
