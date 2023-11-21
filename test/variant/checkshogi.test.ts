import { perft } from '../../src/debug';
import { parseSfen } from '../../src/sfen';
import { parseUsi } from '../../src/util';
import { Checkshogi } from '../../src/variant/checkshogi';

// from standard
test('starting perft', () => {
  const pos = Checkshogi.default();
  expect(perft(pos, 0, false)).toBe(1);
  expect(perft(pos, 1, false)).toBe(30);
  expect(perft(pos, 2, false)).toBe(900);
  expect(perft(pos, 3, false)).toBe(25470);
  // expect(perft(pos, 4, false)).toBe(719731);
  //expect(perft(pos, 5, false)).toBe(19861490);
});

test('check win', () => {
  const pos = parseSfen('checkshogi', '9/3gk4/9/2b6/9/6B2/9/4KG3/9 b - 1', false).unwrap();
  expect(pos.isCheck()).toBe(false);
  expect(pos.isEnd()).toBe(false);
  pos.play(parseUsi('3f2e')!);
  expect(pos.isCheck()).toBe(true);
  expect(pos.isEnd()).toBe(true);
  expect(pos.outcome()?.result).toBe('specialVariantEnd');
  expect(pos.outcome()?.winner).toBe('sente');

  const pos2 = parseSfen('checkshogi', '9/3gk4/9/2b6/9/6B2/9/4KG3/9 w - 1', false).unwrap();
  expect(pos2.isCheck()).toBe(false);
  expect(pos2.isEnd()).toBe(false);
  pos2.play(parseUsi('7d8e')!);
  expect(pos2.isCheck()).toBe(true);
  expect(pos2.isEnd()).toBe(true);
  expect(pos2.outcome()?.result).toBe('specialVariantEnd');
  expect(pos2.outcome()?.winner).toBe('gote');
});
