import { test } from 'node:test';
import { Board } from '../src/board.js';
import type { Piece } from '../src/types.js';
import { expect } from './debug.js';

test('set and get', () => {
  const knight: Piece = { role: 'knight', color: 'sente' };
  const board = Board.empty();
  expect(board.pieceAt(0)).toEqual(undefined);

  expect(board.pieceAt(0)).toEqual(undefined);
  const board2 = board.withPieceAt(0, knight);
  expect(board.pieceAt(0)).toEqual(undefined);
  expect(board2.pieceAt(0)).toEqual(knight);

  const gold: Piece = { role: 'gold', color: 'sente' };
  let board3 = Board.empty();
  board3 = board3.withPieceAt(0, knight);
  board3 = board3.withPieceAt(0, gold);
  expect(board3.byRole('knight').size()).toEqual(0);
});
