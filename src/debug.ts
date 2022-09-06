import { Square, Role } from './types.js';
import { parsePieceName, makeSquare, makeUsi } from './util.js';
import { Position } from './variant/position.js';
import { pieceCanPromote, pieceForcePromote } from './variant/util.js';
import { SquareSet } from './squareSet.js';

export function moveDests(moveDests: Map<Square, SquareSet>): string {
  const lines = [];
  for (const [from, to] of moveDests) {
    lines.push(`${makeSquare(from)}: ${Array.from(to, makeSquare).join(' ')}`);
  }
  return lines.join('\n');
}

export function dropDests(dropDests: Map<Role, SquareSet>): string {
  const lines = [];
  for (const [role, to] of dropDests) {
    lines.push(`${role}: ${Array.from(to, makeSquare).join(' ')}`);
  }
  return lines.join('\n');
}

export function perft(pos: Position, depth: number, log = false): number {
  if (depth < 1) return 1;

  let nodes = 0;
  for (const [from, moveDests] of pos.allMoveDests()) {
    for (const to of moveDests) {
      const promotions: Array<boolean> = [];
      const piece = pos.board.get(from)!;
      if (pieceCanPromote(pos.rules)(piece, from, to)) {
        promotions.push(true);
        if (!pieceForcePromote(pos.rules)(piece, to)) promotions.push(false);
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
  for (const [pieceName, dropDestsOfRole] of pos.allDropDests()) {
    for (const to of dropDestsOfRole) {
      const child = pos.clone();
      const piece = parsePieceName(pieceName);
      const move = { role: piece.role, to };
      child.play(move);
      const children = perft(child, depth - 1, false);
      if (log) console.log(makeUsi(move), children, '(', depth, ')');
      nodes += children;
    }
  }
  return nodes;
}
