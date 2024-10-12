import { kingAttacks } from '../attacks.js';
import { SquareSet } from '../squareSet.js';
import { MoveOrDrop, Piece, Role, Rules, Square, isDrop } from '../types.js';
import { defined, squareDist, squareFile, squareRank } from '../util.js';
import { Position } from '../variant/position.js';
import { pieceCanPromote } from '../variant/util.js';
import { aimingAt, makeJapaneseSquare, roleKanjiDuplicates, roleToKanji } from './util.js';

// ７六歩
export function makeJapaneseMoveOrDrop(pos: Position, md: MoveOrDrop, lastDest?: Square): string | undefined {
  if (isDrop(md)) {
    const ambStr = aimingAt(
      pos,
      pos.board.roles(md.role, ...roleKanjiDuplicates(pos.rules)(md.role)).intersect(pos.board.color(pos.turn)),
      md.to
    ).isEmpty()
      ? ''
      : '打';
    return `${makeJapaneseSquare(md.to)}${roleToKanji(md.role)}${ambStr}`;
  } else {
    const piece = pos.board.get(md.from);
    if (piece) {
      const roleStr = roleToKanji(piece.role),
        ambPieces = aimingAt(
          pos,
          pos.board
            .roles(piece.role, ...roleKanjiDuplicates(pos.rules)(piece.role))
            .intersect(pos.board.color(piece.color)),
          md.to
        ).without(md.from),
        ambStr = ambPieces.isEmpty() ? '' : disambiguate(pos.rules, piece, md.from, md.to, ambPieces);

      if (defined(md.midStep)) {
        const midCapture = pos.board.get(md.midStep),
          igui = !!midCapture && md.to === md.from;
        if (igui) return `${makeJapaneseSquare(md.midStep)}居喰い`;
        else if (md.to === md.from) return 'じっと';
        else return `${makeJapaneseSquare(md.midStep)}・${makeJapaneseSquare(md.to)}${roleStr}${ambStr}`;
      } else {
        const destStr = (lastDest ?? pos.lastMoveOrDrop?.to) === md.to ? '同　' : makeJapaneseSquare(md.to),
          promStr = md.promotion
            ? '成'
            : pieceCanPromote(pos.rules)(piece, md.from, md.to, pos.board.get(md.to))
              ? '不成'
              : '';
        return `${destStr}${roleStr}${ambStr}${promStr}`;
      }
    } else return undefined;
  }
}
const silverGoldRoles: Role[] = [
  'gold',
  'silver',
  'promotedlance',
  'promotedknight',
  'promotedsilver',
  'promotedpawn',
  'tokin',
];
const majorRoles: Role[] = ['bishop', 'rook', 'horse', 'dragon'];

function disambiguate(rules: Rules, piece: Piece, orig: Square, dest: Square, others: SquareSet): string {
  const myRank = squareRank(orig),
    myFile = squareFile(orig);

  const destRank = squareRank(dest),
    destFile = squareFile(dest);

  const movingUp = myRank > destRank,
    movingDown = myRank < destRank;

  const jumpsButShouldnt =
    rules === 'annanshogi' &&
    piece.role !== 'knight' &&
    Math.abs(myFile - destFile) === 1 &&
    Math.abs(myRank - destRank) === 2;

  // special case - gold-like/silver piece is moving directly forward
  if (
    myFile === destFile &&
    (piece.color === 'sente') === movingUp &&
    (silverGoldRoles.includes(piece.role) || (rules === 'annanshogi' && majorRoles.includes(piece.role))) &&
    others.intersect(SquareSet.fromRank(myRank)).nonEmpty()
  )
    return '直';

  // special case for lion moves on the same file
  if (
    ['lion', 'lionpromoted', 'falcon'].includes(piece.role) &&
    destFile === myFile &&
    kingAttacks(orig).intersects(others)
  ) {
    return squareDist(orig, dest) === 2 ? '跳' : '直';
  }

  // is this the only piece moving in certain vertical direction (up, down, none - horizontally)
  if (![...others].map(squareRank).some(r => r < destRank === movingDown && r > destRank === movingUp))
    return verticalDisambiguation(rules, piece, movingUp, movingDown, jumpsButShouldnt);

  const othersFiles = [...others].map(squareFile),
    rightest = othersFiles.reduce((prev, cur) => (prev < cur ? prev : cur)),
    leftest = othersFiles.reduce((prev, cur) => (prev > cur ? prev : cur));

  // is this piece positioned most on one side or in the middle
  if (rightest > myFile || leftest < myFile || (others.size() === 2 && rightest < myFile && leftest > myFile))
    return sideDisambiguation(piece, rightest > myFile, leftest < myFile);

  return (
    sideDisambiguation(piece, rightest >= myFile, leftest <= myFile) +
    verticalDisambiguation(rules, piece, movingUp, movingDown, jumpsButShouldnt)
  );
}

function verticalDisambiguation(rules: Rules, piece: Piece, up: boolean, down: boolean, jumpOver: boolean): string {
  if (jumpOver) return '跳';
  else if (up === down) return '寄';
  else if ((piece.color === 'sente' && up) || (piece.color === 'gote' && down))
    return rules !== 'chushogi' && ['horse', 'dragon'].includes(piece.role) ? '行' : '上';
  else return '引';
}

function sideDisambiguation(piece: Piece, right: boolean, left: boolean): string {
  if (left === right) return '中';
  else if ((piece.color === 'sente' && right) || (piece.color === 'gote' && left)) return '右';
  else return '左';
}
