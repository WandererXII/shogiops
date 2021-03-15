import { isDrop, Move, PocketRole, PROMOTABLE_ROLES } from './types';
import { defined, makeSquare } from './util';
import { SquareSet } from './squareSet';
import { Position } from './shogi';
import { lishogiCharToRole, roleToLishogiChar, shogiCoordToChessCord, parseChessSquare } from './compat';

function makeSanWithoutSuffix(pos: Position, move: Move): string {
  let san = '';
  if (isDrop(move)) {
    san = roleToLishogiChar(move.role).toUpperCase() + '*' + shogiCoordToChessCord(makeSquare(move.to));
  } else {
    const role = pos.board.getRole(move.from);
    if (!role) return '--';
    const capture = pos.board.occupied.has(move.to);
    san = roleToLishogiChar(role).toUpperCase();

    if (role !== 'pawn' && role !== 'lance' && role !== 'king') {
      // Disambiguation
      let others = SquareSet.empty();
      for (const s of pos.board.pieces(pos.turn, role)) {
        if (pos.dests(s).has(move.to)) others = others.union(SquareSet.fromSquare(s));
      }
      others = others.without(move.from);
      if (others.nonEmpty()) {
        san += shogiCoordToChessCord(makeSquare(move.from));
      }
    }
    if (capture) san += 'x';
    san += shogiCoordToChessCord(makeSquare(move.to));
    if (move.promotion) san += '+';
    else if (
      (PROMOTABLE_ROLES as ReadonlyArray<string>).includes(role) &&
      SquareSet.promotionZone(pos.turn).has(move.to)
    )
      san += '=';
  }
  return san;
}

export function makeSanAndPlay(pos: Position, move: Move): string {
  const san = makeSanWithoutSuffix(pos, move);
  pos.play(move);
  return san;
}

export function makeSanVariation(pos: Position, variation: Move[]): string {
  pos = pos.clone();
  const line = [];
  for (let i = 0; i < variation.length; i++) {
    if (i !== 0) line.push(' ');
    line.push(pos.fullmoves, '. ');
    const san = makeSanWithoutSuffix(pos, variation[i]);
    pos.play(variation[i]);
    line.push(san);
    if (san === '--') return line.join('');
    if (i === variation.length - 1 && pos.outcome()?.winner) line.push('投了');
  }
  return line.join('');
}

export function makeSan(pos: Position, move: Move): string {
  return makeSanAndPlay(pos.clone(), move);
}

export function parseSan(pos: Position, san: string): Move | undefined {
  const ctx = pos.ctx();

  // Normal move
  const match = san.match(/^([PLNSGKBRTUMAHD])([a-i][1-9])?[x]?([a-i][1-9])(\+|\=)?$/);
  if (!match) {
    // Drop
    const match = san.match(/^([PLNSGBRplsgbr])\*([a-i][1-9])$/);
    if (!match) return;
    const move = {
      role: lishogiCharToRole(match[1]) as PocketRole,
      to: parseChessSquare(match[2])!,
    };
    return pos.isLegal(move, ctx) ? move : undefined;
  }
  const role = lishogiCharToRole(match[1])!;
  const to = parseChessSquare(match[3])!;
  const fromStr = match[2];

  let candidates = pos.board.pieces(pos.turn, role);
  if (fromStr) candidates = candidates.intersect(SquareSet.fromSquare(parseChessSquare(fromStr)!));

  // Check uniqueness and legality
  let from;
  for (const candidate of candidates) {
    if (pos.dests(candidate, ctx).has(to)) {
      if (defined(from)) return; // Ambiguous
      from = candidate;
    }
  }
  if (!defined(from)) return; // Illegal

  const promotionStr = match[4];
  let promotion: boolean;
  if (promotionStr === '+') promotion = true;
  else promotion = false;

  // Promotion needs to be specified in san
  if (
    promotionStr === undefined &&
    (PROMOTABLE_ROLES as ReadonlyArray<string>).includes(role) &&
    (SquareSet.promotionZone(pos.turn).has(to) || SquareSet.promotionZone(pos.turn).has(from))
  )
    return;

  // role can't be promoted/unpromoted or it isn't in/from the promotion zone
  if (
    promotionStr &&
    (!(PROMOTABLE_ROLES as ReadonlyArray<string>).includes(role) ||
      (!SquareSet.promotionZone(pos.turn).has(to) && !SquareSet.promotionZone(pos.turn).has(from)))
  )
    return;
	
  // force promotion
  else if (
    !promotion &&
    (((role === 'pawn' || role === 'lance') && SquareSet.backrank(pos.turn).has(to)) ||
      (role === 'knight' && SquareSet.backrank2(pos.turn).has(to)))
  )
    return;

  return {
    from,
    to,
    promotion,
  };
}
