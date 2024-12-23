import type { SquareSet } from './square-set.js';
import type { MoveOrDrop, PieceName, Rules, Square, SquareName } from './types.js';
import {
  defined,
  isDrop,
  makeSquareName,
  parseSquareName,
  parseUsi,
  squareFile,
  squareRank,
} from './util.js';
import type { Chushogi } from './variant/chushogi.js';
import { secondLionStepDests } from './variant/chushogi.js';
import type { Position } from './variant/position.js';
import { dimensions, fullSquareSet } from './variant/util.js';

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

// https://github.com/WandererXII/scalashogi/blob/main/src/main/scala/format/usi/UsiCharPair.scala
export function scalashogiCharPair(md: MoveOrDrop, rules: Rules): string {
  const charOffset = 35;
  function squareToCharCode(sq: Square): number {
    return charOffset + squareRank(sq) * dimensions(rules).files + squareFile(sq);
  }
  function lionMoveToChar(orig: Square, dest: Square, ms: Square, rules: Rules): number {
    const toMidStep =
        (squareFile(orig) - squareFile(ms) + 1 + 3 * (squareRank(orig) - squareRank(ms) + 1) + 4) %
        9,
      toDest =
        (squareFile(ms) - squareFile(dest) + 1 + 3 * (squareRank(ms) - squareRank(dest) + 1) + 4) %
        9;
    return charOffset + fullSquareSet(rules).size() + toMidStep + 8 * toDest;
  }

  if (isDrop(md))
    return String.fromCharCode(
      squareToCharCode(md.to),
      charOffset +
        81 +
        ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'].indexOf(md.role)
    );
  else {
    const from = squareToCharCode(md.from),
      to = defined(md.midStep)
        ? lionMoveToChar(md.from, md.to, md.midStep, rules)
        : squareToCharCode(md.to);
    if (md.promotion) return String.fromCharCode(to, from);
    else return String.fromCharCode(from, to);
  }
}
