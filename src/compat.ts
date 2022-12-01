import { Move, PieceName, SquareName, isDrop } from './types.js';
import { defined, makeSquare, parseSquare, parseUsi } from './util.js';
import { Chushogi, secondLionStepDests } from './variant/chushogi.js';
import { Position } from './variant/position.js';

export function shogigroundMoveDests(pos: Position): Map<SquareName, SquareName[]> {
  const result: Map<SquareName, SquareName[]> = new Map(),
    ctx = pos.ctx();
  for (const [from, squares] of pos.allMoveDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeSquare(s));
      result.set(makeSquare(from), d);
    }
  }
  return result;
}

export function shogigroundDropDests(pos: Position): Map<PieceName, SquareName[]> {
  const result: Map<PieceName, SquareName[]> = new Map(),
    ctx = pos.ctx();
  for (const [pieceName, squares] of pos.allDropDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeSquare(s));
      result.set(pieceName, d);
    }
  }

  return result;
}

export function shogigroundSecondLionStep(
  before: Chushogi,
  initialSq: SquareName,
  midSq: SquareName
): Map<SquareName, SquareName[]> {
  const result: Map<SquareName, SquareName[]> = new Map(),
    squares = secondLionStepDests(before, parseSquare(initialSq), parseSquare(midSq));
  if (squares.nonEmpty()) {
    const d = Array.from(squares, s => makeSquare(s));
    result.set(makeSquare(parseSquare(midSq)), d);
  }
  return result;
}

export function usiToSquareNames(usi: string): SquareName[] {
  const move = parseUsi(usi);
  return defined(move) ? moveToSquareNames(move) : [];
}

export function moveToSquareNames(move: Move): SquareName[] {
  return isDrop(move) ? [makeSquare(move.to)] : [makeSquare(move.from), makeSquare(move.to)];
}

export function checksSquareNames(pos: Position): SquareName[] {
  return pos.checkSquares().map(s => makeSquare(s));
}
