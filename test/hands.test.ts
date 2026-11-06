import { test } from 'node:test';
import { Hand, Hands } from '../src/hands.js';
import type { Piece } from '../src/types.js';
import { expect } from './debug.js';

test('Hand.from clamps negative counts to zero', () => {
  const hand = Hand.from([
    ['pawn', -2],
    ['rook', 1],
  ]);

  expect(hand.count()).toEqual(1);
  expect(hand.get('pawn')).toEqual(0);
  expect(hand.get('rook')).toEqual(1);
  expect(hand.nonEmpty()).toEqual(true);
});

test('set and get', () => {
  const hands = Hands.empty();
  expect(hands.color('sente').count()).toEqual(0);
  expect(hands.color('sente').get('gold')).toEqual(0);

  const piece: Piece = { color: 'sente', role: 'gold' };

  const hands2 = hands.increment(piece);
  expect(hands2.get(piece)).toEqual(1);
  expect(hands2.count()).toEqual(1);

  const hands3 = hands2.decrement(piece);
  expect(hands2.color('sente').count()).toEqual(1);
  expect(hands2.get(piece)).toEqual(1);
  expect(hands3.color('sente').count()).toEqual(0);
  expect(hands3.get(piece)).toEqual(0);
});
