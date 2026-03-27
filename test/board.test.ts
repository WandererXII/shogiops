import { test } from 'node:test';
import { Board } from '../src/board.js';
import type { Piece } from '../src/types.js';
import { expect } from './debug.js';

test('set and get', () => {
  const board = Board.empty();
  expect(board.get(0)).toEqual(undefined);
  const knight: Piece = { role: 'knight', color: 'sente' };
  expect(board.set(0, knight)).toEqual(undefined);
  expect(board.get(0)).toEqual(knight);
});
