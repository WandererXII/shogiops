import { Move, isDrop } from '../types.js';
import { makeSquare, roleToString } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { piecesAiming } from './notationUtil.js';

// P-7f
export function makeWesternEngineMove(pos: Position, move: Move): string | undefined {
  if (isDrop(move)) {
    return roleToString(move.role).toUpperCase() + '*' + makeSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleToString(piece.role).toUpperCase();
      const ambStr = piecesAiming(pos, piece, move.to).without(move.from).isEmpty() ? '' : makeSquare(move.from);
      const actionStr = pos.board.has(move.to) ? 'x' : '-';
      const promStr = move.promotion ? '+' : pieceCanPromote(pos.rules)(piece, move.from, move.to) ? '=' : '';
      return `${roleStr}${ambStr}${actionStr}${makeSquare(move.to)}${promStr}`;
    } else return undefined;
  }
}
