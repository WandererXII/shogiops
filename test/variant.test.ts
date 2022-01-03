import { Rules } from '../src/types';
import { perft } from '../src/debug';
import { setupPosition } from '../src/variant';
import { parseSfen } from '../src/sfen';

const variantPerfts: [Rules, string, number, number][] = [
  ['minishogi', 'rbsgk/4p/5/P4/KGSBR b - 1', 1, 14],
  ['minishogi', 'rbsgk/4p/5/P4/KGSBR b - 1', 2, 181],
  ['minishogi', 'rbsgk/4p/5/P4/KGSBR b - 1', 3, 2512],
  ['minishogi', 'rbsgk/4p/5/P4/KGSBR b - 1', 4, 35401],
  ['minishogi', 'rbsgk/4p/5/P4/KGSBR b - 1', 5, 533203],
];

test.each(variantPerfts)('variant perft: %s (%s): %s', (rules, sfen, depth, res) => {
  const pos = setupPosition(rules, parseSfen(sfen).unwrap()).unwrap();
  expect(perft(pos, depth, false)).toBe(res);
});

test('minishogi checkmate', () => {
  const pos = setupPosition('minishogi', parseSfen('r1s1k/2b1g/5/r1G1B/KPS2 b p').unwrap()).unwrap();
  expect(pos.isCheckmate()).toBe(true);
});
