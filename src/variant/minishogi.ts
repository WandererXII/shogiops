import { Result } from '@badrap/result';
import {
  bishopAttacks,
  goldAttacks,
  kingAttacks,
  pawnAttacks,
  rookAttacks,
  silverAttacks,
} from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { Color, Piece, Role, Setup, Square } from '../types.js';
import { opposite } from '../util.js';
import { Context, Position, PositionError } from './position.js';
import { standardDropDests, standardMoveDests } from './shogi.js';

export class Minishogi extends Position {
  private constructor() {
    super('minishogi');
  }

  static default(): Minishogi {
    const pos = new this();
    pos.board = minishogiBoard();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static from(setup: Setup, strict: boolean): Result<Minishogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map(_ => pos);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker),
      board = this.board;
    return board.color(attacker).intersect(
      rookAttacks(square, occupied)
        .intersect(board.roles('rook', 'dragon'))
        .union(bishopAttacks(square, occupied).intersect(board.roles('bishop', 'horse')))
        .union(
          goldAttacks(square, defender).intersect(board.roles('gold', 'tokin', 'promotedsilver'))
        )
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.roles('king', 'dragon', 'horse')))
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

const minishogiBoard = (): Board => {
  const occupied = new SquareSet([0x1001f, 0x100000, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
  const colorIter: [Color, SquareSet][] = [
    ['sente', new SquareSet([0x0, 0x100000, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['gote', new SquareSet([0x1001f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  const roleIter: [Role, SquareSet][] = [
    ['rook', new SquareSet([0x10, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['bishop', new SquareSet([0x8, 0x0, 0x2, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['gold', new SquareSet([0x2, 0x0, 0x8, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['silver', new SquareSet([0x4, 0x0, 0x4, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['pawn', new SquareSet([0x10000, 0x100000, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['king', new SquareSet([0x1, 0x0, 0x10, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  return Board.from(occupied, colorIter, roleIter);
};
