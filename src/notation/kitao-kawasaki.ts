import type { MoveOrDrop, Square } from '../types.js';
import { defined, isDrop } from '../util.js';
import type { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { aimingAt, makeNumberSquare, roleKanjiDuplicates, roleToKanji } from './util.js';

// 歩-76
export function makeKitaoKawasakiMoveOrDrop(
  pos: Position,
  md: MoveOrDrop,
  lastDest?: Square,
): string | undefined {
  if (isDrop(md)) {
    return `${roleToKanji(md.role)}*${makeNumberSquare(md.to)}`;
  } else {
    const piece = pos.board.get(md.from);
    if (piece) {
      const roleStr = roleToKanji(piece.role).replace('成', '+');
      const ambStr = aimingAt(
        pos,
        pos.board
          .roles(piece.role, ...roleKanjiDuplicates(pos.rules)(piece.role))
          .intersect(pos.board.color(piece.color)),
        md.to,
      )
        .without(md.from)
        .isEmpty()
        ? ''
        : `(${makeNumberSquare(md.from)})`;
      const toCapture = pos.board.get(md.to);
      const actionStr = toCapture ? 'x' : '-';
      if (defined(md.midStep)) {
        const midCapture = pos.board.get(md.midStep);
        const igui = !!midCapture && md.to === md.from;
        if (igui) return `${roleStr}${ambStr}x!${makeNumberSquare(md.midStep)}`;
        else if (md.to === md.from) return `--`;
        else
          return `${roleStr}${ambStr}${midCapture ? 'x' : '-'}${makeNumberSquare(
            md.midStep,
          )}${actionStr}${makeNumberSquare(md.to)}`;
      } else {
        const destStr =
          (lastDest ?? pos.lastMoveOrDrop?.to) === md.to ? '' : makeNumberSquare(md.to);
        const promStr = md.promotion
          ? '+'
          : pieceCanPromote(pos.rules)(piece, md.from, md.to, toCapture)
            ? '='
            : '';
        return `${roleStr}${ambStr}${actionStr}${destStr}${promStr}`;
      }
    } else return undefined;
  }
}
