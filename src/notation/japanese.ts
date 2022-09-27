import { SquareSet } from '../squareSet.js';
import { Move, Piece, Square, isDrop } from '../types.js';
import { defined, squareFile, squareRank } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { makeJapaneseSquare, piecesAiming, roleToKanji } from './util.js';

// ７六歩
export function makeJapaneseMove(pos: Position, move: Move, lastDest?: Square): string | undefined {
  if (isDrop(move)) {
    const ambStr = piecesAiming(pos, { role: move.role, color: pos.turn }, move.to).isEmpty() ? '' : '打';
    return `${makeJapaneseSquare(move.to)}${roleToKanji(move.role)}${ambStr}`;
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const roleStr = roleToKanji(piece.role),
        ambPieces = piecesAiming(pos, piece, move.to).without(move.from),
        ambStr = ambPieces.isEmpty() ? '' : disambiguate(piece, move.from, move.to, ambPieces);

      if (defined(move.midStep)) {
        const midCapture = pos.board.get(move.midStep),
          igui = !!midCapture && move.to === move.from;
        if (igui) return `${makeJapaneseSquare(move.midStep)}居喰い`;
        else if (move.to === move.from) return 'じっと';
        else return `${makeJapaneseSquare(move.midStep)}・${makeJapaneseSquare(move.to)}${roleStr}${ambStr}`;
      } else {
        const destStr = (lastDest ?? pos.lastMove?.to) === move.to ? '同　' : makeJapaneseSquare(move.to),
          promStr = move.promotion
            ? '成'
            : pieceCanPromote(pos.rules)(piece, move.from, move.to, pos.board.get(move.to))
            ? '不成'
            : '';
        return `${destStr}${roleStr}${ambStr}${promStr}`;
      }
    } else return undefined;
  }
}

function disambiguate(piece: Piece, orig: Square, dest: Square, others: SquareSet): string {
  const myRank = squareRank(orig),
    myFile = squareFile(orig);

  const destRank = squareRank(dest),
    destFile = squareFile(dest);

  const movingUp = myRank > destRank,
    movingDown = myRank < destRank;

  // special case if gold/silver like piece is moving directly forward
  if (
    myFile === destFile &&
    (piece.color === 'sente') === movingUp &&
    ['gold', 'silver', 'promotedlance', 'promotedknight', 'promotedsilver', 'tokin'].includes(piece.role)
  )
    return '直';

  // is this the only piece moving in certain vertical direction (up, down, horizontally)
  if (![...others].map(squareRank).some(r => r < destRank === movingDown && r > destRank === movingUp))
    return verticalDisambiguation(piece, movingUp, movingDown);

  const othersFiles = [...others].map(squareFile),
    rightest = othersFiles.reduce((prev, cur) => (prev < cur ? prev : cur)),
    leftest = othersFiles.reduce((prev, cur) => (prev > cur ? prev : cur));

  // is this piece positioned most on one side, not in the middle
  if (rightest > myFile || leftest < myFile || (others.size() === 2 && rightest < myFile && leftest > myFile))
    return sideDisambiguation(piece, rightest > squareFile(orig), leftest < squareFile(orig));

  return (
    sideDisambiguation(piece, rightest >= squareFile(orig), leftest <= squareFile(orig)) +
    verticalDisambiguation(piece, movingUp, movingDown)
  );
}

function verticalDisambiguation(piece: Piece, up: boolean, down: boolean): string {
  return up === down
    ? '寄'
    : (piece.color === 'sente') === up
    ? ['horse', 'dragon'].includes(piece.role)
      ? '行'
      : '上'
    : '引';
}

function sideDisambiguation(piece: Piece, right: boolean, left: boolean): string {
  return !left && !right ? '中' : (piece.color === 'sente') === right ? '右' : '左';
}
