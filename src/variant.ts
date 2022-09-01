import { Result } from '@badrap/result';
import { Color, Role, Rules, Square } from './types.js';
import { PositionError, Position, IllegalSetup, Context } from './position.js';
import { Shogi } from './shogi.js';
import { SquareSet } from './squareSet.js';
import { Board } from './board.js';
import { Hands } from './hand.js';

export { Position, PositionError, IllegalSetup, Context, Shogi };

export function defaultPosition(rules: Rules): Position {
  switch (rules) {
    case 'minishogi':
      return Minishogi.default();
    default:
      return Shogi.default();
  }
}

export function initializePosition(
  rules: Rules,
  board: Board,
  hands: Hands,
  turn: Color,
  moveNumber: number,
  strict = true
): Result<Position, PositionError> {
  switch (rules) {
    case 'minishogi':
      return Minishogi.initialize(board, hands, turn, moveNumber, strict);
    default:
      return Shogi.initialize(board, hands, turn, moveNumber, strict);
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

  static initialize(
    board: Board,
    hands: Hands,
    turn: Color,
    moveNumber: number,
    strict: boolean
  ): Result<Minishogi, PositionError> {
    return super.initialize(board, hands, turn, moveNumber, strict) as Result<Minishogi, PositionError>;
  }

  clone(): Minishogi {
    return super.clone() as Minishogi;
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return super.moveDests(square, ctx).intersect(new SquareSet([0x1f001f, 0x1f001f, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]));
  }

  dropDests(role: Role, ctx?: Context): SquareSet {
    return super.dropDests(role, ctx).intersect(new SquareSet([0x1f001f, 0x1f001f, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]));
  }
}
