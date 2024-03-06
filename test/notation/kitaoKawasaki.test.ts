import { makeKitaoKawasakiMoveOrDrop } from '../../src/notation/kitaoKawasaki';
import { parseUsi } from '../../src/util';
import { Shogi } from '../../src/variant/shogi';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeKitaoKawasakiMoveOrDrop(pos, move)).toEqual('歩-76');
  pos.play(move);
  expect(makeKitaoKawasakiMoveOrDrop(pos, parseUsi('3c3d')!)).toEqual('歩-34');
});

test('amb moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('6i5h')!;
  expect(makeKitaoKawasakiMoveOrDrop(pos, move)).toEqual('金(69)-58');
});
