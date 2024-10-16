import { Board } from '../src/board.js';
import type { Piece } from '../src/types.js';

test('set and get', () => {
  const board = Board.empty();
  expect(board.get(0)).toBeUndefined();
  const knight: Piece = { role: 'knight', color: 'sente' };
  expect(board.set(0, knight)).toBeUndefined();
  expect(board.get(0)).toEqual(knight);
});
