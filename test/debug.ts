import type { SquareSet } from '@/square-set.js';
import type { DropMove, NormalMove, PieceName, Role, Square } from '@/types.js';
import { makeSquareName, makeUsi, parsePieceName } from '@/util.js';
import type { Chushogi } from '@/variant/chushogi.js';
import { secondLionStepDests } from '@/variant/chushogi.js';
import type { Position } from '@/variant/position.js';
import { pieceCanPromote, pieceForcePromote, promotableOnDrop, promote } from '@/variant/util.js';

export function moveDests(moveDests: Map<Square, SquareSet>): string {
  const lines: string[] = [];
  for (const [from, to] of moveDests) {
    lines.push(`${makeSquareName(from)}: ${Array.from(to, makeSquareName).join(' ')}`);
  }
  return lines.join('\n');
}

export function dropDests(dropDests: Map<PieceName, SquareSet>): string {
  const lines: string[] = [];
  for (const [pn, to] of dropDests) {
    lines.push(`${pn}: ${Array.from(to, makeSquareName).join(' ')}`);
  }
  return lines.join('\n');
}

export function perft(
  pos: Position,
  depth: number,
  options: { log?: boolean; ignoreEnd?: boolean } = {},
): number {
  if (depth < 1) return 1;
  if (!options.ignoreEnd && pos.isEnd()) return 0;

  const logs: string[] = [];
  let nodes = 0;
  for (const [from, moveDests] of pos.allMoveDests()) {
    for (const to of moveDests) {
      const promotions: boolean[] = [],
        piece = pos.board.get(from)!;
      if (pieceCanPromote(pos.rules)(piece, from, to, pos.board.get(to))) {
        promotions.push(true);
        if (!pieceForcePromote(pos.rules)(piece, to)) promotions.push(false);
      } else promotions.push(false);

      for (const promotion of promotions) {
        const child = pos.clone(),
          move = { from, to, promotion };
        child.play(move);
        const children = perft(child, depth - 1, options);
        if (options.log) logs.push(`${makeUsi(move)}: ${children}`);
        nodes += children;
      }
      const roleWithLionPower: Role[] = ['lion', 'lionpromoted', 'eagle', 'falcon'];
      if (roleWithLionPower.includes(piece.role)) {
        const secondMoveDests = secondLionStepDests(pos as Chushogi, from, to);
        for (const mid of secondMoveDests) {
          const child = pos.clone(),
            move: NormalMove = { from, to, midStep: mid };
          child.play(move);
          const children = perft(child, depth - 1, options);
          if (options.log) logs.push(`${makeUsi(move)}: ${children}`);
          nodes += children;
        }
      }
    }
  }
  for (const [pieceName, dropDestsOfRole] of pos.allDropDests()) {
    const promotions: boolean[] = [false],
      piece = parsePieceName(pieceName);
    if (promotableOnDrop(pos.rules)(piece)) promotions.push(true);
    for (const prom of promotions) {
      for (const to of dropDestsOfRole) {
        const child = pos.clone(),
          drop: DropMove = { role: prom ? promote(pos.rules)(piece.role)! : piece.role, to };
        child.play(drop);
        const children = perft(child, depth - 1, options);
        if (options.log) logs.push(`${makeUsi(drop)}: ${children}`);
        nodes += children;
      }
    }
  }
  if (options.log) console.log(logs.join('\n'));
  return nodes;
}
