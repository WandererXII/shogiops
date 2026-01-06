import { expect, test } from 'vitest';
import { makeKitaoKawasakiMoveOrDrop } from '@/notation/kitao-kawasaki.js';
import { initialSfen, parseSfen } from '@/sfen.js';
import { parseUsi } from '@/util.js';

test('basic moves', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const move = parseUsi('7g7f')!;
  expect(makeKitaoKawasakiMoveOrDrop(pos, move)).toEqual('歩-76');
  pos.play(move);
  expect(makeKitaoKawasakiMoveOrDrop(pos, parseUsi('3c3d')!)).toEqual('歩-34');
});

test('amb moves', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const move = parseUsi('6i5h')!;
  expect(makeKitaoKawasakiMoveOrDrop(pos, move)).toEqual('金(69)-58');
});
