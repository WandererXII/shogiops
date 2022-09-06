import { SquareSet } from '../squareSet.js';
import { Move, Piece, Square, isDrop } from '../types.js';
import { roleTo2Kanji, squareFile, squareRank } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { makeJapaneseSquare, piecesAiming } from './util.js';

// ７六歩
export function makeJapaneseMove(pos: Position, move: Move, lastDest?: Square): string | undefined {
  if (isDrop(move)) {
    const ambStr = piecesAiming(pos, { role: move.role, color: pos.turn }, move.to).isEmpty() ? '' : '打';
    return `${makeJapaneseSquare(move.to)}${roleTo2Kanji(move.role)}${ambStr}`;
  } else {
    const piece = pos.board.get(move.from);
    if (piece) {
      const destStr = lastDest === move.to ? '同　' : makeJapaneseSquare(move.to);
      const roleStr = roleTo2Kanji(piece.role);
      const ambPieces = piecesAiming(pos, piece, move.to).without(move.from);
      const ambStr = ambPieces.isEmpty() ? '' : disambiguate(piece, move.from, move.to, ambPieces);
      const promStr = move.promotion ? '成' : pieceCanPromote(pos.rules)(piece, move.from, move.to) ? '不成' : '';
      return `${destStr}${roleStr}${ambStr}${promStr}`;
    } else return undefined;
  }
}

function disambiguate(piece: Piece, orig: Square, dest: Square, others: SquareSet): string {
  const myRank = squareRank(orig);
  const myFile = squareFile(orig);

  const destRank = squareRank(dest);
  const destFile = squareFile(dest);

  const movingUp = myRank > destRank;
  const movingDown = myRank < destRank;

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

  const othersFiles = [...others].map(squareFile);
  const rightest = othersFiles.reduce((prev, cur) => (prev < cur ? prev : cur));
  const leftest = othersFiles.reduce((prev, cur) => (prev > cur ? prev : cur));

  // is this piece positioned most on one side, not in the middle
  if (rightest > myFile || leftest < myFile || (others.size() === 2 && rightest < myFile && leftest > myFile))
    return sideDisambiguation(piece, rightest > squareFile(orig), leftest < squareFile(orig));

  return (
    sideDisambiguation(piece, rightest >= squareFile(orig), leftest <= squareFile(orig)) +
    verticalDisambiguation(piece, movingUp, movingDown)
  );
}

function verticalDisambiguation(piece: Piece, up: Boolean, down: Boolean): string {
  return up === down
    ? '寄'
    : (piece.color === 'sente') === up
    ? ['horse', 'dragon'].includes(piece.role)
      ? '行'
      : '上'
    : '引';
}

function sideDisambiguation(piece: Piece, right: Boolean, left: Boolean): string {
  return !left && !right ? '中' : (piece.color === 'sente') === right ? '右' : '左';
}
