import { Result } from '@badrap/result';
import { Color, Role, RulesTypeMap, Square } from './types.js';
import { PositionError, Position, Context } from './position.js';
import { pseudoDropDests, pseudoMoveDests, Shogi } from './shogi.js';
import { SquareSet } from './squareSet.js';
import { Board } from './board.js';
import { Hands } from './hand.js';
import { opposite } from './util.js';
import { bishopAttacks, goldAttacks, kingAttacks, pawnAttacks, rookAttacks, silverAttacks } from './attacks.js';

export function defaultPosition<R extends keyof RulesTypeMap>(rules: R): RulesTypeMap[R] {
  switch (rules) {
    case 'minishogi':
      return Minishogi.default();
    default:
      return Shogi.default();
  }
}

export function initializePosition<R extends keyof RulesTypeMap>(
  rules: R,
  board: Board,
  hands: Hands,
  turn: Color,
  moveNumber: number,
  strict = true
): Result<RulesTypeMap[R], PositionError> {
  switch (rules) {
    case 'minishogi':
      return Minishogi.initialize(board, hands, turn, moveNumber, strict);
    default:
      return Shogi.initialize(board, hands, turn, moveNumber, strict);
  }
}

export class Minishogi extends Position {
  private constructor() {
    super('minishogi');
    this.fullSquareSet = new SquareSet([0x1f001f, 0x1f001f, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
  }

  static default(): Minishogi {
    const pos = new this();
    pos.board = Board.minishogi();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static initialize(
    board: Board,
    hands: Hands,
    turn: Color,
    moveNumber: number,
    strict?: boolean
  ): Result<Minishogi, PositionError> {
    const pos = new this();
    pos.board = board.clone();
    pos.hands = hands.clone();
    pos.turn = turn;
    pos.moveNumber = moveNumber;
    return pos.validate(strict).map(_ => pos);
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.rook.union(this.board.dragon))
      .union(bishopAttacks(square, empty).intersect(this.board.bishop.union(this.board.horse)))
      .intersect(this.board[attacker]);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker),
      board = this.board;
    return board[attacker].intersect(
      rookAttacks(square, occupied)
        .intersect(board.rook.union(board.dragon))
        .union(bishopAttacks(square, occupied).intersect(board.bishop.union(board.horse)))
        .union(goldAttacks(defender, square).intersect(board.gold.union(board.tokin).union(board.promotedsilver)))
        .union(silverAttacks(defender, square).intersect(board.silver))
        .union(pawnAttacks(defender, square).intersect(board.pawn))
        .union(kingAttacks(square).intersect(board.king.union(board.dragon).union(board.horse)))
    );
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return pseudoMoveDests(this, square, ctx).intersect(this.fullSquareSet);
  }

  dropDests(role: Role, ctx?: Context): SquareSet {
    return pseudoDropDests(this, role, ctx).intersect(this.fullSquareSet);
  }

  hasInsufficientMaterial(color: Color): boolean {
    return this.board[color].size() + this.hands[color].count() < 2;
  }
}
