import { Square, Piece } from './types.js';
import { makeSquare, makeUsi } from './util.js';
import { makePiece } from './sfen.js';
import { SquareSet } from './squareSet.js';
import { Position } from './shogi.js';
import { pieceCanPromote, pieceInDeadZone } from './variantUtil.js';

export function piece(piece: Piece): string {
  return makePiece(piece);
}

export function square(sq: Square): string {
  return makeSquare(sq);
}

export function dests(dests: Map<Square, SquareSet>): string {
  const lines = [];
  for (const [from, to] of dests) {
    lines.push(`${makeSquare(from)}: ${Array.from(to, square).join(' ')}`);
  }
  return lines.join('\n');
}

export function perft(pos: Position, depth: number, log = false): number {
  if (depth < 1) return 1;

  const ctx = pos.ctx();
  const dropDests = pos.allDropDests(ctx);

  let nodes = 0;
  for (const [from, dests] of pos.allDests(ctx)) {
    for (const to of dests) {
      const promotions: Array<boolean> = [];
      const piece = pos.board.get(from)!;
      if (pieceCanPromote(pos.rules)(piece, from, to)) {
        promotions.push(true);
        if (!pieceInDeadZone(pos.rules)(piece, to)) promotions.push(false);
      } else promotions.push(false);

      for (const promotion of promotions) {
        const child = pos.clone();
        const move = { from, to, promotion };
        child.play(move);
        const children = perft(child, depth - 1, false);
        if (log) console.log(makeUsi(move), children, '(', depth, ')');
        nodes += children;
      }
    }
  }
  for (const [role, dropDestsOfRole] of dropDests) {
    for (const to of dropDestsOfRole) {
      const child = pos.clone();
      const move = { role, to };
      child.play(move);
      const children = perft(child, depth - 1, false);
      if (log) console.log(makeUsi(move), children, '(', depth, ')');
      nodes += children;
    }
  }
  return nodes;
}
