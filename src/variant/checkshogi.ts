import type { Result } from '@badrap/result';
import { SquareSet } from '../square-set.js';
import type { Color, Outcome, Piece, Setup, Square } from '../types.js';
import { opposite } from '../util.js';
import type { Context, PositionError } from './position.js';
import { Position } from './position.js';
import {
  standardDropDests,
  standardMoveDests,
  standardSquareAttacks,
  standardSquareSnipers,
} from './shogi.js';

export class Checkshogi extends Position {
  private constructor() {
    super('checkshogi');
  }

  static from(setup: Setup, strict: boolean): Result<Checkshogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map((_) => pos);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    return standardSquareAttacks(square, attacker, this.board, occupied);
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    return standardSquareSnipers(square, attacker, this.board);
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return standardDropDests(this, piece, ctx);
  }

  isCheckmate(_ctx?: Context): boolean {
    return false;
  }

  isSpecialVariantEnd(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return ctx.checkers.nonEmpty();
  }

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();

    if (this.isSpecialVariantEnd(ctx))
      return {
        result: 'specialVariantEnd',
        winner: opposite(ctx.color),
      };
    else if (this.isStalemate(ctx)) {
      return {
        result: 'stalemate',
        winner: opposite(ctx.color),
      };
    } else if (this.isDraw(ctx)) {
      return {
        result: 'draw',
        winner: undefined,
      };
    } else return;
  }
}
