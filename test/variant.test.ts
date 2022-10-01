import { perft } from '../src/debug';
import { InvalidSfen, initialSfen, parseSfen } from '../src/sfen';
import { Rules } from '../src/types';

const variantPerfts: [Rules, string, number, number][] = [
  ['minishogi', '', 1, 14],
  ['minishogi', '', 2, 181],
  ['minishogi', '', 3, 2512],
  ['minishogi', '', 4, 35401],
  ['minishogi', '', 5, 533203],
  ['chushogi', '', 1, 36],
  ['chushogi', '', 2, 1296],
];

test.each(variantPerfts)('variant perft: %s (%s): %s', (rules, sfen, depth, res) => {
  const pos = parseSfen(rules, sfen || initialSfen(rules)).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});

test('minishogi checkmate', () => {
  const pos = parseSfen('minishogi', 'r1s1k/2b1g/5/r1G1B/KPS2 b p').unwrap();
  expect(pos.outcome()).toEqual({ result: 'checkmate', winner: 'gote' });
});

test('roles outside variant', () => {
  const r1 = parseSfen('minishogi', '2k2/2p2/2l2/2P2/2K2 b - 1', true);
  expect(
    r1.unwrap(
      _ => undefined,
      err => err.message
    )
  ).toEqual(InvalidSfen.BoardPiece);
});
