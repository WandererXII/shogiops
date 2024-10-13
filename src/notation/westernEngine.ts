import { MoveOrDrop, isDrop } from '../types.js';
import { defined, makeSquareName } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { aimingAt, roleToWestern } from './util.js';

// P-7f
export function makeWesternEngineMoveOrDrop(pos: Position, md: MoveOrDrop): string | undefined {
  if (isDrop(md)) {
    return roleToWestern(pos.rules)(md.role) + '*' + makeSquareName(md.to);
  } else {
    const piece = pos.board.get(md.from);
    if (piece) {
      const roleStr = roleToWestern(pos.rules)(piece.role),
        disambStr = aimingAt(pos, pos.board.pieces(piece.color, piece.role), md.to)
          .without(md.from)
          .isEmpty()
          ? ''
          : makeSquareName(md.from),
        toCapture = pos.board.get(md.to),
        toStr = `${toCapture ? 'x' : '-'}${makeSquareName(md.to)}`;
      if (defined(md.midStep)) {
        const midCapture = pos.board.get(md.midStep),
          igui = !!midCapture && md.to === md.from;
        if (igui) return `${roleStr}${disambStr}x!${makeSquareName(md.midStep)}`;
        else if (md.to === md.from) return `--`;
        else
          return `${roleStr}${disambStr}${midCapture ? 'x' : '-'}${makeSquareName(md.midStep)}${toStr}`;
      } else {
        const promStr = md.promotion
          ? '+'
          : pieceCanPromote(pos.rules)(piece, md.from, md.to, toCapture)
            ? '='
            : '';
        return `${roleStr}${disambStr}${toStr}${promStr}`;
      }
    } else return undefined;
  }
}
