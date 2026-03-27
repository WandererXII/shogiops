import { test } from 'node:test';
import { InvalidSfen, initialSfen, parseSfen } from '../../src/sfen.js';
import { expect, perft } from '../debug.js';
import { perfts } from '../fixtures/perftMinishogi.js';

const minishogiPerfts: [string, number, number][] = [
  ['', 1, 14],
  ['', 2, 181],
  ['', 3, 2512],
  ['', 4, 35401],
  ['', 5, 533203],
];

test('minishogi perft', () => {
  minishogiPerfts.forEach(([sfen, depth, res]) => {
    const pos = parseSfen('minishogi', sfen || initialSfen('minishogi')).unwrap();
    expect(perft(pos, depth)).toEqual(res);
  });
});

test('roles outside minishogi', () => {
  const r1 = parseSfen('minishogi', '2k2/2p2/2l2/2P2/2K2 b - 1', true);
  expect(
    r1.unwrap(
      (_) => undefined,
      (err) => err.message,
    ),
  ).toEqual(InvalidSfen.BoardPiece);
});

test('minishogi checkmate', () => {
  const pos = parseSfen('minishogi', 'r1s1k/2b1g/5/r1G1B/KPS2 b p').unwrap();
  expect(pos.outcome()).toEqual({ result: 'checkmate', winner: 'gote' });
});

test('randomly generated perfts - for consistency', () => {
  perfts.forEach((p) => {
    const [sfen, depth, res] = p;
    const pos = parseSfen('minishogi', sfen || initialSfen('minishogi')).unwrap();
    expect(perft(pos, depth)).toEqual(res);
  });
});
