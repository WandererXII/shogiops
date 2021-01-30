import { isDrop, Move, PocketRole, PROMOTABLE_ROLES } from './types';
import { defined, roleToChar, parseSquare, makeSquare, opposite } from './util';
import { SquareSet } from './squareSet';
import { Position } from './shogi';
import { attacks, kingAttacks, rookAttacks, bishopAttacks, silverAttacks, knightAttacks, goldAttacks, horseAttacks, dragonAttacks } from './attacks';
import { shogiCoord, lishogiCharToRole, shogiCoordToChessCord, parseChessSquare } from './compat';

function makeSanWithoutSuffix(pos: Position, move: Move): string {
  let san = '';
  if (isDrop(move)) {
      san = roleToChar(move.role).toUpperCase() + '*' + shogiCoordToChessCord(makeSquare(move.to));
  } else {
    const role = pos.board.getRole(move.from);
    if (!role) return '--';
	const capture = pos.board.occupied.has(move.to);
	san = roleToChar(role).toUpperCase();

    if (role !== 'pawn' && role !== 'lance') {
		
		// Disambiguation
		let others;
		if (role === 'king') others = kingAttacks(move.to).intersect(pos.board.king);
		else if (role === 'rook') others = rookAttacks(move.to, pos.board.occupied).intersect(pos.board.rook);
		else if (role === 'bishop') others = bishopAttacks(move.to, pos.board.occupied).intersect(pos.board.bishop);
		else if (role === 'gold') others = goldAttacks(pos.turn, move.to).intersect(pos.board.gold);
		else if (role === 'silver') others = silverAttacks(pos.turn, move.to).intersect(pos.board.silver);
		else if (role === 'knight') others = knightAttacks(pos.turn, move.to).intersect(pos.board.knight);
		else if (role === 'tokin') others = goldAttacks(pos.turn, move.to).intersect(pos.board.tokin);
		else if (role === 'promoted_lance') others = goldAttacks(pos.turn, move.to).intersect(pos.board.promoted_lance);
		else if (role === 'promoted_knight') others = goldAttacks(pos.turn, move.to).intersect(pos.board.promoted_knight);
		else if (role === 'promoted_silver') others = goldAttacks(pos.turn, move.to).intersect(pos.board.promoted_silver);
		else if (role === 'horse') others = horseAttacks(move.to, pos.board.occupied).intersect(pos.board.horse);
		else others = dragonAttacks(move.to, pos.board.occupied).intersect(pos.board.dragon);

		others = others.intersect(pos.board[pos.turn]).without(move.from);
		if (others.nonEmpty()) {
			san += shogiCoordToChessCord(makeSquare(move.from));
		}
    }
    if (capture) san += 'x';
	san += shogiCoordToChessCord(makeSquare(move.to));
	if (move.promotion) san += '+';
	else if (SquareSet.promotionZone(pos.turn).has(move.to)) san += "=";
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
  const match = san.match(/^([PLNSGKBRTUMAHD])([a-i][1-9])?[x]?([a-i][1-9])[\+\=]?$/);
  if (!match) {
    // Drop
    const match = san.match(/^([PLNSGBRplsgbr])\*([a-i][1-9])$/);
    if (!match) return;
    const move = {
      role: lishogiCharToRole(match[1]) as PocketRole,
      to: parseSquare(match[2])!,
    };
    return pos.isLegal(move, ctx) ? move : undefined;
  }
  const role = lishogiCharToRole(match[1])!;
  const to = parseSquare(match[3])!;

  const promotionStr = match[4];
  let promotion = !!promotionStr;
  if (promotion && promotionStr === '+' && (!((PROMOTABLE_ROLES as ReadonlyArray<string>).includes(role)) || !SquareSet.promotionZone(pos.turn).has(to))) return; // can't promote
  else if((!promotion || promotionStr === '=') &&
	  (((role === 'pawn' || role === 'lance') && SquareSet.backrank(pos.turn).has(to)) ||
	  (role === 'knight' && SquareSet.backrank2(pos.turn).has(to))))
	  promotion = true; // force promotion

  const fromStr = match[2];
  let candidates = pos.board.pieces(pos.turn, role);
  if (fromStr) candidates = candidates.intersect(SquareSet.fromSquare(parseChessSquare(fromStr)!));
  else candidates = candidates.intersect(attacks({color: opposite(pos.turn), role}, to, pos.board.occupied));

  // Check uniqueness and legality
  let from;
  for (const candidate of candidates) {
    if (pos.dests(candidate, ctx).has(to)) {
      if (defined(from)) return; // Ambiguous
      from = candidate;
    }
  }
  if (!defined(from)) return; // Illegal

  return {
    from,
    to,
    promotion,
  };
}
