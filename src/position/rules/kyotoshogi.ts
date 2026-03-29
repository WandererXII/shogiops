import type { Result } from '@badrap/result';
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
} from '../../attacks.js';
import { SquareSet } from '../../square-set.js';
import type { Color, MoveOrDrop, Piece, Setup, Square } from '../../types.js';
import { defined, isDrop, opposite } from '../../util.js';
import type { Context, PositionError } from '../position.js';
import { Position } from '../position.js';
import { fullSquareSet, handRoles, unpromote } from '../util.js';
import { standardMoveDests } from './shogi.js';

export class Kyotoshogi extends Position {
  private constructor(setup: Setup) {
    super('kyotoshogi', setup);
  }

  static from(setup: Setup, strict: boolean): Result<Kyotoshogi, PositionError> {
    const pos = new Kyotoshogi(setup);
    return pos.validate(strict).map((_) => pos);
  }

  validation = {
    doublePawn: false,
    oppositeCheck: true,
    unpromotedForcedPromotion: false,
    maxNumberOfRoyalPieces: 1,
  };

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker);
    const board = this.board;
    return board.byColor(attacker).intersect(
      rookAttacks(square, occupied)
        .intersect(board.byRole('rook'))
        .union(bishopAttacks(square, occupied).intersect(board.byRole('bishop')))
        .union(lanceAttacks(square, defender, occupied).intersect(board.byRole('lance')))
        .union(knightAttacks(square, defender).intersect(board.byRole('knight')))
        .union(goldAttacks(square, defender).intersect(board.byRoles('gold', 'tokin')))
        .union(silverAttacks(square, defender).intersect(board.byRole('silver')))
        .union(pawnAttacks(square, defender).intersect(board.byRole('pawn')))
        .union(kingAttacks(square).intersect(board.byRole('king'))),
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.byRole('rook'))
      .union(bishopAttacks(square, empty).intersect(this.board.byRole('bishop')))
      .union(lanceAttacks(square, opposite(attacker), empty).intersect(this.board.byRole('lance')))
      .intersect(this.board.byColor(attacker));
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
