import { roleToString } from '../util';
import { Position } from '../shogi';
import { Move, isDrop } from '../types';
import { pieceCanPromote } from '../variantUtil';
import { makeNumberSquare, piecesAiming } from './notationUtil';

// P-76
export function makeWesternMove(pos: Position, move: Move): string | undefined {
  if (isDrop(move)) {
    return roleToString(move.role).toUpperCase() + '*' + makeNumberSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleToString(piece.role).toUpperCase();
      const ambStr = piecesAiming(pos, piece, move.to).without(move.from).isEmpty() ? '' : makeNumberSquare(move.from);
      const actionStr = pos.board.has(move.to) ? 'x' : '-';
      const promStr = move.promotion ? '+' : pieceCanPromote(pos.rules)(piece, move.from, move.to) ? '=' : '';
      return `${roleStr}${ambStr}${actionStr}${makeNumberSquare(move.to)}${promStr}`;
    } else return undefined;
  }
}
