import { Move, Square, isDrop } from '../types.js';
import { defined } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { makeNumberSquare, piecesAiming, roleToKanji } from './util.js';

// 歩-76
export function makeKitaoKawasakiMove(pos: Position, move: Move, lastDest?: Square): string | undefined {
  if (isDrop(move)) {
    return roleToKanji(move.role) + '*' + makeNumberSquare(move.to);
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleToKanji(piece.role).replace('成', '+'),
        ambStr = piecesAiming(pos, piece, move.to).without(move.from).isEmpty()
          ? ''
          : `(${makeNumberSquare(move.from)})`,
        capture = pos.board.get(move.to),
        actionStr = !!capture ? 'x' : '-';
      if (defined(move.midStep)) {
        const midCapture = pos.board.get(move.midStep),
          igui = !!midCapture && move.to === move.from;
        if (igui) return `${roleStr}${ambStr}!${makeNumberSquare(move.midStep)}`;
        else if (move.to === move.from) return `--`;
        else
          return `${roleStr}${ambStr}${!!midCapture ? 'x' : '-'}${makeNumberSquare(
            move.midStep
          )}${actionStr}${makeNumberSquare(move.to)}`;
      } else {
        const destStr = (lastDest ?? pos.lastMove?.to) === move.to ? '' : makeNumberSquare(move.to),
          promStr = move.promotion ? '+' : pieceCanPromote(pos.rules)(piece, move.from, move.to, capture) ? '=' : '';
        return `${roleStr}${ambStr}${actionStr}${destStr}${promStr}`;
      }
    } else return undefined;
  }
}
