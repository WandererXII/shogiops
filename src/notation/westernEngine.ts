import { Move, isDrop } from '../types.js';
import { makeSquare } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { piecesAiming, roleToWestern } from './util.js';

// P-7f
export function makeWesternEngineMove(pos: Position, move: Move): string | undefined {
  if (isDrop(move)) {
    return roleToWestern(move.role).toUpperCase() + '*' + makeSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleToWestern(piece.role).toUpperCase(),
        ambStr = piecesAiming(pos, piece, move.to).without(move.from).isEmpty() ? '' : makeSquare(move.from),
        capture = pos.board.get(move.to),
        actionStr = !!capture ? 'x' : '-',
        promStr = move.promotion ? '+' : pieceCanPromote(pos.rules)(piece, move.from, move.to, capture) ? '=' : '';
      return `${roleStr}${ambStr}${actionStr}${makeSquare(move.to)}${promStr}`;
    } else return undefined;
  }
}
