import { Move, isDrop } from '../types.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { makeNumberSquare, piecesAiming, roleToWestern } from './util.js';

// P-76
export function makeWesternMove(pos: Position, move: Move): string | undefined {
  if (isDrop(move)) {
    return roleToWestern(move.role).toUpperCase() + '*' + makeNumberSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleToWestern(piece.role).toUpperCase();
      const ambStr = piecesAiming(pos, piece, move.to).without(move.from).isEmpty() ? '' : makeNumberSquare(move.from);
      const capture = pos.board.get(move.to);
      const actionStr = !!capture ? 'x' : '-';
      const promStr = move.promotion ? '+' : pieceCanPromote(pos.rules)(piece, move.from, move.to, capture) ? '=' : '';
      return `${roleStr}${ambStr}${actionStr}${makeNumberSquare(move.to)}${promStr}`;
    } else return undefined;
  }
}
