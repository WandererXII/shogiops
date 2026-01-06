import { Result } from '@badrap/result';
import {
  between,
  bishopAttacks,
  goldAttacks,
  kingAttacks,
  knightAttacks,
  lanceAttacks,
  pawnAttacks,
  rookAttacks,
  silverAttacks,
} from '../attacks.js';
import { SquareSet } from '../square-set.js';
import type { Color, MoveOrDrop, Piece, Setup, Square } from '../types.js';
import { defined, isDrop, opposite } from '../util.js';
import type { Context, PositionError } from './position.js';
import { IllegalSetup, Position } from './position.js';
import { standardMoveDests } from './shogi.js';
import { fullSquareSet, handRoles, unpromote } from './util.js';

export class Kyotoshogi extends Position {
  private constructor() {
    super('kyotoshogi');
  }

  static from(setup: Setup, strict: boolean): Result<Kyotoshogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map((_) => pos);
  }

  validate(strict: boolean): Result<undefined, PositionError> {
    const validated = super.validate(strict);
    const acceptableErrors: string[] = [
      IllegalSetup.InvalidPiecesPromotionZone,
      IllegalSetup.InvalidPiecesDoublePawns,
    ];
    if (validated.isErr && acceptableErrors.includes(validated.error.message))
      return Result.ok(undefined);
    else return validated;
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker),
      board = this.board;
    return board.color(attacker).intersect(
      rookAttacks(square, occupied)
        .intersect(board.role('rook'))
        .union(bishopAttacks(square, occupied).intersect(board.role('bishop')))
        .union(lanceAttacks(square, defender, occupied).intersect(board.role('lance')))
        .union(knightAttacks(square, defender).intersect(board.role('knight')))
        .union(goldAttacks(square, defender).intersect(board.roles('gold', 'tokin')))
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.role('king'))),
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.role('rook'))
      .union(bishopAttacks(square, empty).intersect(this.board.role('bishop')))
      .union(lanceAttacks(square, opposite(attacker), empty).intersect(this.board.role('lance')))
      .intersect(this.board.color(attacker));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    if (piece.color !== ctx.color) return SquareSet.empty();
    let mask = this.board.occupied.complement();

    if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
      const checker = ctx.checkers.singleSquare();
      if (!defined(checker)) return SquareSet.empty();
      mask = mask.intersect(between(checker, ctx.king));
    }

    return mask.intersect(fullSquareSet(this.rules));
  }

  isLegal(md: MoveOrDrop, ctx?: Context): boolean {
    const turn = ctx?.color || this.turn;
    if (isDrop(md)) {
      const roleInHand = !handRoles(this.rules).includes(md.role)
        ? unpromote(this.rules)(md.role)
        : md.role;
      if (
        !roleInHand ||
        !handRoles(this.rules).includes(roleInHand) ||
        this.hands[turn].get(roleInHand) <= 0
      )
        return false;
      return this.dropDests({ color: turn, role: md.role }, ctx).has(md.to);
    } else {
      return super.isLegal(md, ctx);
    }
  }
}
