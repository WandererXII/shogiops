import { SquareSet } from './squareSet.js';
import { MoveOrDrop, PieceName, SquareName, isDrop } from './types.js';
import { defined, makeSquareName, parseSquareName, parseUsi } from './util.js';
import { Chushogi, secondLionStepDests } from './variant/chushogi.js';
import { Position } from './variant/position.js';

export function squareSetToSquareNames(sqs: SquareSet): SquareName[] {
  return Array.from(sqs, s => makeSquareName(s));
}

export function shogigroundMoveDests(pos: Position): Map<SquareName, SquareName[]> {
  const result: Map<SquareName, SquareName[]> = new Map(),
    ctx = pos.ctx();
  for (const [from, squares] of pos.allMoveDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = squareSetToSquareNames(squares);
      result.set(makeSquareName(from), d);
    }
  }
  return result;
}

export function shogigroundDropDests(pos: Position): Map<PieceName, SquareName[]> {
  const result: Map<PieceName, SquareName[]> = new Map(),
    ctx = pos.ctx();
  for (const [pieceName, squares] of pos.allDropDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = squareSetToSquareNames(squares);
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
    squares = secondLionStepDests(before, parseSquareName(initialSq), parseSquareName(midSq));
  if (squares.nonEmpty()) {
    const d = squareSetToSquareNames(squares);
    result.set(makeSquareName(parseSquareName(midSq)), d);
  }
  return result;
}

export function usiToSquareNames(usi: string): SquareName[] {
  const md = parseUsi(usi);
  return defined(md) ? moveToSquareNames(md) : [];
}

export function moveToSquareNames(md: MoveOrDrop): SquareName[] {
  return isDrop(md)
    ? [makeSquareName(md.to)]
    : defined(md.midStep)
      ? [makeSquareName(md.from), makeSquareName(md.midStep), makeSquareName(md.to)]
      : [makeSquareName(md.from), makeSquareName(md.to)];
}

export function checksSquareNames(pos: Position): SquareName[] {
  return squareSetToSquareNames(pos.checks());
}
