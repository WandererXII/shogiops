import type { Result } from '@badrap/result';
import {
  bishopAttacks,
  goldAttacks,
  kingAttacks,
  pawnAttacks,
  rookAttacks,
  silverAttacks,
} from '../../attacks.js';
import { SquareSet } from '../../square-set.js';
import type { Color, Piece, Setup, Square } from '../../types.js';
import { opposite } from '../../util.js';
import type { Context, PositionError } from '../position.js';
import { Position } from '../position.js';
import { standardDropDests, standardMoveDests } from './shogi.js';

export class Minishogi extends Position {
  private constructor(setup: Setup) {
    super('minishogi', setup);
  }

  static from(setup: Setup, strict: boolean): Result<Minishogi, PositionError> {
    const pos = new Minishogi(setup);
    return pos.validate(strict).map((_) => pos);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker);
    const board = this.board;
    return board.byColor(attacker).intersect(
      rookAttacks(square, occupied)
        .intersect(board.byRoles('rook', 'dragon'))
        .union(bishopAttacks(square, occupied).intersect(board.byRoles('bishop', 'horse')))
        .union(
          goldAttacks(square, defender).intersect(board.byRoles('gold', 'tokin', 'promotedsilver')),
        )
        .union(silverAttacks(square, defender).intersect(board.byRole('silver')))
        .union(pawnAttacks(square, defender).intersect(board.byRole('pawn')))
        .union(kingAttacks(square).intersect(board.byRoles('king', 'dragon', 'horse'))),
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.byRoles('rook', 'dragon'))
      .union(bishopAttacks(square, empty).intersect(this.board.byRoles('bishop', 'horse')))
      .intersect(this.board.byColor(attacker));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return standardDropDests(this, piece, ctx);
  }
}
