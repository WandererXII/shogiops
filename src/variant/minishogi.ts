import { Result } from '@badrap/result';
import { bishopAttacks, goldAttacks, kingAttacks, pawnAttacks, rookAttacks, silverAttacks } from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { Color, Piece, Square } from '../types.js';
import { opposite } from '../util.js';
import { Context, Position, PositionError } from './position.js';
import { standardDropDests, standardMoveDests } from './shogi.js';

export class Minishogi extends Position {
  private constructor() {
    super('minishogi');
  }

  static default(): Minishogi {
    const pos = new this();
    pos.board = Board.minishogi();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static from(
    board: Board,
    hands: Hands,
    turn: Color,
    moveNumber: number,
    strict: boolean
  ): Result<Minishogi, PositionError> {
    const pos = new this();
    pos.board = board.clone();
    pos.hands = hands.clone();
    pos.turn = turn;
    pos.moveNumber = moveNumber;
    return pos.validate(strict).map(_ => pos);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker),
      board = this.board;
    return board.color(attacker).intersect(
      rookAttacks(square, occupied)
        .intersect(board.role('rook').union(board.role('dragon')))
        .union(bishopAttacks(square, occupied).intersect(board.role('bishop').union(board.role('horse'))))
        .union(
          goldAttacks(square, defender).intersect(
            board.role('gold').union(board.role('tokin')).union(board.role('promotedsilver'))
          )
        )
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.role('king').union(board.role('dragon')).union(board.role('horse'))))
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.role('rook').union(this.board.role('dragon')))
      .union(bishopAttacks(square, empty).intersect(this.board.role('bishop').union(this.board.role('horse'))))
      .intersect(this.board.color(attacker));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return standardDropDests(this, piece, ctx);
  }
}
