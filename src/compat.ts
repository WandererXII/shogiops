import { SquareName, Move, isDrop, PieceName, Piece } from './types.js';
import { defined, makePieceName, makeSquare, parseUsi } from './util.js';
import { Position } from './position.js';

export function shogigroundMoveDests(pos: Position): Map<SquareName, SquareName[]> {
  const result: Map<SquareName, SquareName[]> = new Map();
  const ctx = pos.ctx();
  for (const [from, squares] of pos.allMoveDests(ctx)) {
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeSquare(s));
      result.set(makeSquare(from), d);
    }
  }
  return result;
}

export function shogigroundDropDests(pos: Position, piece?: Piece): Map<PieceName, SquareName[]> {
  const result: Map<PieceName, SquareName[]> = new Map();
  if (piece) {
    const squares = pos.dropDests(piece);
    if (squares.nonEmpty()) {
      const d = Array.from(squares, s => makeSquare(s));
      result.set(makePieceName(piece), d);
    }
  } else {
    const ctx = pos.ctx();
    for (const [p, squares] of pos.allDropDests(ctx)) {
      if (squares.nonEmpty()) {
        const d = Array.from(squares, s => makeSquare(s));
        result.set(p, d);
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
