import { Result } from '@badrap/result';
import { bishopAttacks, goldAttacks, kingAttacks, pawnAttacks, rookAttacks, silverAttacks } from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { Color, Piece, Square } from '../types.js';
import { opposite } from '../util.js';
import { Context, Position, PositionError } from './position.js';
import { pseudoDropDests, pseudoMoveDests } from './shogi.js';

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

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.role('rook').union(this.board.role('dragon')))
      .union(bishopAttacks(square, empty).intersect(this.board.role('bishop').union(this.board.role('horse'))))
      .intersect(this.board.color(attacker));
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

  moveDests(square: Square, ctx?: Context): SquareSet {
    return pseudoMoveDests(this, square, ctx).intersect(this.fullSquareSet);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return pseudoDropDests(this, piece, ctx).intersect(this.fullSquareSet);
  }

  hasInsufficientMaterial(color: Color): boolean {
    return this.board.color(color).size() + this.hands[color].count() < 2;
  }
}
