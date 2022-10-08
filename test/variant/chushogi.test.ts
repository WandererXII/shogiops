import { perft } from '../../src/debug';
import { initialSfen, parseSfen } from '../../src/sfen';

const chushogiPerfts: [string, number, number][] = [
  ['', 1, 36],
  ['', 2, 1296],
];

test.each(chushogiPerfts)('chushogi perft: %s (%s): %s', (sfen, depth, res) => {
  const pos = parseSfen('chushogi', sfen || initialSfen('chushogi')).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});
