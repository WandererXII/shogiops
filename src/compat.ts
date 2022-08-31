import { SquareName, Move, isDrop, Role } from './types.js';
import { defined, makeSquare, parseUsi } from './util.js';
import { Position } from './position.js';

export function shogigroundDests(pos: Position): Map<SquareName, SquareName[]> {
  const result = new Map();
  const ctx = pos.ctx();
  for (const [from, squares] of pos.allDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeSquare(s));
      result.set(makeSquare(from), d);
    }
  }
  return result;
}

export function shogigroundDropDests(pos: Position, role?: Role): Map<Role, SquareName[]> {
  const result = new Map();
  if (role) {
    const squares = pos.dropDests(role);
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeSquare(s));
      result.set(role, d);
    }
  } else {
    const ctx = pos.ctx();
    for (const [r, squares] of pos.allDropDests(ctx)) {
      if (squares.nonEmpty()) {
        const d = Array.from(squares, s => makeSquare(s));
        result.set(r, d);
      }
    }
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
