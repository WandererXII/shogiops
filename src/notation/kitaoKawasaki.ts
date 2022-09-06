import { Move, Square, isDrop } from '../types.js';
import { roleTo2Kanji } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { makeNumberSquare, piecesAiming } from './util.js';

// 歩-76
export function makeKitaoKawasakiMove(pos: Position, move: Move, lastDest?: Square): string | undefined {
  if (isDrop(move)) {
    return roleTo2Kanji(move.role) + '*' + makeNumberSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleTo2Kanji(piece.role).replace('成', '+');
      const ambStr = piecesAiming(pos, piece, move.to).without(move.from).isEmpty()
        ? ''
        : `(${makeNumberSquare(move.from)})`;
      const actionStr = pos.board.has(move.to) ? 'x' : '-';
      const destStr = lastDest === move.to ? '' : makeNumberSquare(move.to);
      const promStr = move.promotion ? '+' : pieceCanPromote(pos.rules)(piece, move.from, move.to) ? '=' : '';
      return `${roleStr}${ambStr}${actionStr}${destStr}${promStr}`;
    } else return undefined;
  }
}
