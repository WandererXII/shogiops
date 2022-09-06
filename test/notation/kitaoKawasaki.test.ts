import { makeKitaoKawasakiMove } from '../../src/notation/kitaoKawasaki';
import { Shogi } from '../../src/variant/shogi';
import { parseUsi } from '../../src/util';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeKitaoKawasakiMove(pos, move)).toEqual('歩-76');
  pos.play(move);
  expect(makeKitaoKawasakiMove(pos, parseUsi('3c3d')!)).toEqual('歩-34');
});

test('amb moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('6i5h')!;
  expect(makeKitaoKawasakiMove(pos, move)).toEqual('金(69)-58');
});
