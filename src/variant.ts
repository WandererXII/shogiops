import { Result } from '@badrap/result';
import { Color, HandRole, Rules, Square } from './types';
import { Setup } from './setup';
import { PositionError, Position, IllegalSetup, Context, Shogi } from './shogi';
import { SquareSet } from './squareSet';
import { Board } from './board';
import { Hands } from './hand';

export { Position, PositionError, IllegalSetup, Context, Shogi };

export function defaultPosition(rules: Rules): Position {
  switch (rules) {
    case 'minishogi':
      return Minishogi.default();
    default:
      return Shogi.default();
  }
}

export function setupPosition(rules: Rules, setup: Setup, strict = true): Result<Position, PositionError> {
  switch (rules) {
    case 'minishogi':
      return Minishogi.fromSetup(setup, strict);
    default:
      return Shogi.fromSetup(setup, strict);
  }
}

export class Minishogi extends Shogi {
  protected constructor() {
    super('minishogi');
  }

  static default(): Minishogi {
    const pos = new this();
    pos.board = Board.minishogi();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.fullmoves = 1;
    return pos;
  }

  static fromSetup(setup: Setup, strict: boolean): Result<Minishogi, PositionError> {
    return super.fromSetup(setup, strict) as Result<Minishogi, PositionError>;
  }

  clone(): Minishogi {
    return super.clone() as Minishogi;
  }

  dests(square: Square, ctx?: Context): SquareSet {
    return super.dests(square, ctx).intersect(new SquareSet(0x0, 0x7c3e000, 0x7c3e1f0));
  }

  dropDests(role: HandRole, ctx?: Context): SquareSet {
    return super.dropDests(role, ctx).intersect(new SquareSet(0x0, 0x7c3e000, 0x7c3e1f0));
  }

  promotionZone(color: Color): SquareSet {
    if (color === 'sente') return SquareSet.fromRank(8);
    return SquareSet.fromRank(4);
  }

  backrank(color: Color): SquareSet {
    return this.promotionZone(color);
  }
}
