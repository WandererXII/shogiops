import { SquareSet } from './squareSet.js';
import { NormalMove, PieceName, Role, Square } from './types.js';
import { makeSquare, makeUsi, parsePieceName } from './util.js';
import { Chushogi, secondLionStepDests } from './variant/chushogi.js';
import { Position } from './variant/position.js';
import { pieceCanPromote, pieceForcePromote } from './variant/util.js';

export function moveDests(moveDests: Map<Square, SquareSet>): string {
  const lines = [];
  for (const [from, to] of moveDests) {
    lines.push(`${makeSquare(from)}: ${Array.from(to, makeSquare).join(' ')}`);
  }
  return lines.join('\n');
}

export function dropDests(dropDests: Map<PieceName, SquareSet>): string {
  const lines = [];
  for (const [pn, to] of dropDests) {
    lines.push(`${pn}: ${Array.from(to, makeSquare).join(' ')}`);
  }
  return lines.join('\n');
}

export function perft(pos: Position, depth: number, log = false): number {
  if (depth < 1) return 1;

  let nodes = 0;
  for (const [from, moveDests] of pos.allMoveDests()) {
    for (const to of moveDests) {
      const promotions: Array<boolean> = [],
        piece = pos.board.get(from)!;
      if (pieceCanPromote(pos.rules)(piece, from, to, pos.board.get(to))) {
        promotions.push(true);
        if (!pieceForcePromote(pos.rules)(piece, to)) promotions.push(false);
      } else promotions.push(false);

      for (const promotion of promotions) {
        const child = pos.clone(),
          move = { from, to, promotion };
        child.play(move);
        const children = perft(child, depth - 1, false);
        if (log) console.log(makeUsi(move), children, '(', depth, ')');
        nodes += children;
      }
      const roleWithLionPower: Role[] = ['lion', 'lionpromoted', 'eagle', 'falcon'];
      if (roleWithLionPower.includes(piece.role)) {
        const secondMoveDests = secondLionStepDests(pos as Chushogi, from, to);
        for (const mid of secondMoveDests) {
          const child = pos.clone(),
            move: NormalMove = { from, to, midStep: mid };
          child.play(move);
          const children = perft(child, depth - 1, false);
          if (log) console.log(makeUsi(move), children, '(', depth, ')');
          nodes += children;
        }
      }
    }
  }
  for (const [pieceName, dropDestsOfRole] of pos.allDropDests()) {
    for (const to of dropDestsOfRole) {
      const child = pos.clone(),
        piece = parsePieceName(pieceName),
        move = { role: piece.role, to };
      child.play(move);
      const children = perft(child, depth - 1, false);
      if (log) console.log(makeUsi(move), children, '(', depth, ')');
      nodes += children;
    }
  }
  return nodes;
}
