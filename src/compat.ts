import { Rules, SquareName, Move, isDrop, Role } from './types';
import { defined, makeSquare, parseUsi } from './util';
import { Position } from './shogi';

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

export function scalashogiCharPair(move: Move): string {
  if (isDrop(move))
    return String.fromCharCode(
      34 + move.to,
      34 + 81 + 128 + ['rook', 'bishop', 'knight', 'pawn', 'gold', 'silver', 'lance'].indexOf(move.role)
    );
  else return String.fromCharCode(34 + move.from, move.promotion ? 34 + move.to + 128 : 34 + move.to);
}

export function usiToSquareNames(usi: string): SquareName[] {
  const move = parseUsi(usi);
  return defined(move) ? moveToSquareNames(move) : [];
}

export function moveToSquareNames(move: Move): SquareName[] {
  return isDrop(move) ? [makeSquare(move.to)] : [makeSquare(move.from), makeSquare(move.to)];
}

export function lishogiVariantRules(variant: string): Rules {
  switch (variant) {
    case 'minishogi':
      return 'minishogi';
    default:
      return 'shogi';
  }
}
