import { test } from 'node:test';
import { makeKitaoKawasakiMoveOrDrop } from '../../src/notation/move/kitao-kawasaki.js';
import { initialSfen, parseSfen } from '../../src/sfen.js';
import { parseUsi } from '../../src/util.js';
import { expect } from '../debug.js';

test('basic moves', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const move = parseUsi('7g7f')!;
  expect(makeKitaoKawasakiMoveOrDrop(pos, move)).toEqual('歩-76');
  expect(makeKitaoKawasakiMoveOrDrop(pos.play(move), parseUsi('3c3d')!)).toEqual('歩-34');
});

test('amb moves', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const move = parseUsi('6i5h')!;
  expect(makeKitaoKawasakiMoveOrDrop(pos, move)).toEqual('金(69)-58');
});
