import { Rules } from '../src/types';
import { perft } from '../src/debug';
import { setupPosition } from '../src/variant';
import { parseFen } from '../src/fen';

const variantPerfts: [Rules, string, number, number][] = [
  ['minishogi', '4rbsgk/8p/9/4P4/4KGSBR/9/9/9/9 b - 1', 1, 14],
  ['minishogi', '4rbsgk/8p/9/4P4/4KGSBR/9/9/9/9 b - 1', 2, 181],
  ['minishogi', '4rbsgk/8p/9/4P4/4KGSBR/9/9/9/9 b - 1', 3, 2512],
  ['minishogi', '4rbsgk/8p/9/4P4/4KGSBR/9/9/9/9 b - 1', 4, 35401],
  ['minishogi', '4rbsgk/8p/9/4P4/4KGSBR/9/9/9/9 b - 1', 5, 533203],
];

test.each(variantPerfts)('variant perft: %s (%s): %s', (rules, fen, depth, res) => {
  const pos = setupPosition(rules, parseFen(fen).unwrap()).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});

test('minishogi checkmate', () => {
  const pos = setupPosition('minishogi', parseFen('4r1s1k/6b1g/9/4r1G1B/4KPS2/9/9/9/9 b p').unwrap()).unwrap();
  expect(pos.isCheckmate()).toBe(true);
});
