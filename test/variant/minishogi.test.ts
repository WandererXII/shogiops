import { perft } from '../../src/debug';
import { initialSfen, parseSfen } from '../../src/sfen';

const minishogiPerfts: [string, number, number][] = [
  ['', 1, 14],
  ['', 2, 181],
  ['', 3, 2512],
  ['', 4, 35401],
  ['', 5, 533203],
];

test.each(minishogiPerfts)('minishogi perft: %s (%s): %s', (sfen, depth, res) => {
  const pos = parseSfen('minishogi', sfen || initialSfen('minishogi')).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});

test('minishogi checkmate', () => {
  const pos = parseSfen('minishogi', 'r1s1k/2b1g/5/r1G1B/KPS2 b p').unwrap();
  expect(pos.outcome()).toEqual({ result: 'checkmate', winner: 'gote' });
});
