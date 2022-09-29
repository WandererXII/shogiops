import { Move, isDrop } from '../types.js';
import { defined, makeSquare } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { aimingAt, roleToWestern } from './util.js';

// P-7f
export function makeWesternEngineMove(pos: Position, move: Move): string | undefined {
  if (isDrop(move)) {
    return roleToWestern(pos.rules)(move.role) + '*' + makeSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleToWestern(pos.rules)(piece.role),
        disambStr = aimingAt(pos, pos.board.pieces(piece.color, piece.role), move.to).without(move.from).isEmpty()
          ? ''
          : makeSquare(move.from),
        toCapture = pos.board.get(move.to),
        toStr = `${!!toCapture ? 'x' : '-'}${makeSquare(move.to)}`;
      if (defined(move.midStep)) {
        const midCapture = pos.board.get(move.midStep),
          igui = !!midCapture && move.to === move.from;
        if (igui) return `${roleStr}${disambStr}x!${makeSquare(move.midStep)}`;
        else if (move.to === move.from) return `--`;
        else return `${roleStr}${disambStr}${!!midCapture ? 'x' : '-'}${makeSquare(move.midStep)}${toStr}`;
      } else {
        const promStr = move.promotion
          ? '+'
          : pieceCanPromote(pos.rules)(piece, move.from, move.to, toCapture)
          ? '='
          : '';
        return `${roleStr}${disambStr}${toStr}${promStr}`;
      }
    } else return undefined;
  }
}
