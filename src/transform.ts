import { ROLES, COLORS } from './types';
import { SquareSet } from './squareSet';
import { Board } from './board';
import { Setup } from './setup';

export function flipVertical(s: SquareSet): SquareSet {
  return s.bswap81();
}

export function flipHorizontal(s: SquareSet): SquareSet {
  const rh = new SquareSet(0x783c1e0, 0x783c1e0, 0x783c1e0); // Right half
  const c2 = new SquareSet(0x633198c, 0x633198c, 0x633198c); // Right rows by two
  const c1 = new SquareSet(0x52a954a, 0x52a954a, 0x52a954a); // Right rows by 1
  const middle = s.intersect(SquareSet.fromFile(4));
  s = s.shl81(1).intersect(c1).union(s.intersect(c1).shr81(1));
  s = s.shl81(2).intersect(c2).union(s.intersect(c2).shr81(2));
  s = s.shl81(5).intersect(rh).union(s.intersect(rh).shr81(5));
  return s.union(middle);
}

export function rotate180(s: SquareSet): SquareSet {
  return s.rbit81();
}

export function transformBoard(board: Board, f: (s: SquareSet) => SquareSet): Board {
  const b = Board.empty();
  b.numberOfFiles = board.numberOfFiles;
  b.numberOfRanks = board.numberOfRanks;
  b.occupied = f(board.occupied);
  for (const color of COLORS) b[color] = f(board[color]);
  for (const role of ROLES) b[role] = f(board[role]);
  return b;
}

export function transformSetup(setup: Setup, f: (s: SquareSet) => SquareSet): Setup {
  return {
    board: transformBoard(setup.board, f),
    hands: setup.hands.clone(),
    turn: setup.turn,
    fullmoves: setup.fullmoves,
  };
}
