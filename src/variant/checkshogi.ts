import type { Result } from '@badrap/result';
import type { SquareSet } from '../square-set.js';
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
    const pos = new Checkshogi();
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

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();
    if (ctx.checkers.nonEmpty()) {
      return {
        result: 'check',
        winner: opposite(ctx.color),
      };
    } else return super.outcome(ctx);
  }
}
