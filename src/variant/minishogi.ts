import type { Result } from '@badrap/result';
import {
  bishopAttacks,
  goldAttacks,
  kingAttacks,
  pawnAttacks,
  rookAttacks,
  silverAttacks,
} from '../attacks.js';
import { SquareSet } from '../square-set.js';
import type { Color, Piece, Setup, Square } from '../types.js';
import { opposite } from '../util.js';
import type { Context, PositionError } from './position.js';
import { Position } from './position.js';
import { standardDropDests, standardMoveDests } from './shogi.js';

export class Minishogi extends Position {
  private constructor() {
    super('minishogi');
  }

  static from(setup: Setup, strict: boolean): Result<Minishogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map((_) => pos);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker),
      board = this.board;
    return board.color(attacker).intersect(
      rookAttacks(square, occupied)
        .intersect(board.roles('rook', 'dragon'))
        .union(bishopAttacks(square, occupied).intersect(board.roles('bishop', 'horse')))
        .union(
          goldAttacks(square, defender).intersect(board.roles('gold', 'tokin', 'promotedsilver')),
        )
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.roles('king', 'dragon', 'horse'))),
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.roles('rook', 'dragon'))
      .union(bishopAttacks(square, empty).intersect(this.board.roles('bishop', 'horse')))
      .intersect(this.board.color(attacker));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return standardDropDests(this, piece, ctx);
  }
}
