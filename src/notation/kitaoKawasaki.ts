import { Move, Square, isDrop } from '../types.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { makeNumberSquare, piecesAiming, roleTo2Kanji } from './util.js';

// 歩-76
export function makeKitaoKawasakiMove(pos: Position, move: Move, lastDest?: Square): string | undefined {
  if (isDrop(move)) {
    return roleTo2Kanji(move.role) + '*' + makeNumberSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleTo2Kanji(piece.role).replace('成', '+'),
        ambStr = piecesAiming(pos, piece, move.to).without(move.from).isEmpty()
          ? ''
          : `(${makeNumberSquare(move.from)})`,
        capture = pos.board.get(move.to),
        actionStr = !!capture ? 'x' : '-',
        destStr = lastDest === move.to ? '' : makeNumberSquare(move.to),
        promStr = move.promotion ? '+' : pieceCanPromote(pos.rules)(piece, move.from, move.to, capture) ? '=' : '';
      return `${roleStr}${ambStr}${actionStr}${destStr}${promStr}`;
    } else return undefined;
  }
}
