import { initialSfen, parseSfen } from '@/sfen.js';
import { Minishogi } from '@/variant/minishogi.js';
import { expect, test } from 'vitest';
import { perft } from '../debug.js';
import { perfts } from '../fixtures/perftMinishogi.js';

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

test('minishogi default', () => {
  expect(Minishogi.default()).toEqual(parseSfen('minishogi', initialSfen('minishogi')).unwrap());
});

test('randomly generated perfts - for consistency', () => {
  perfts.forEach((p) => {
    const [sfen, depth, res] = p,
      pos = parseSfen('minishogi', sfen || initialSfen('minishogi')).unwrap();
    expect(perft(pos, depth, false)).toBe(res);
  });
});
