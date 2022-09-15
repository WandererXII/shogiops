import { Result } from '@badrap/result';
import {
  attacks,
  between,
  bishopAttacks,
  goldAttacks,
  kingAttacks,
  knightAttacks,
  lanceAttacks,
  pawnAttacks,
  ray,
  rookAttacks,
  silverAttacks,
} from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { Color, Piece, Square } from '../types.js';
import { defined, opposite, squareFile } from '../util.js';
import { Context, Position, PositionError } from './position.js';
import { dimensions, fullSquareSet } from './util.js';

export class Shogi extends Position {
  private constructor() {
    super('standard');
  }

  static default(): Shogi {
    const pos = new this();
    pos.board = Board.standard();
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
  ): Result<Shogi, PositionError> {
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
        .intersect(board.roles('rook', 'dragon'))
        .union(bishopAttacks(square, occupied).intersect(board.roles('bishop', 'horse')))
        .union(lanceAttacks(square, defender, occupied).intersect(board.role('lance')))
        .union(knightAttacks(square, defender).intersect(board.role('knight')))
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(
          goldAttacks(square, defender).intersect(
            board.roles('gold', 'tokin', 'promotedlance', 'promotedknight', 'promotedsilver')
          )
        )
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.roles('king', 'dragon', 'horse')))
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.roles('rook', 'dragon'))
      .union(bishopAttacks(square, empty).intersect(this.board.roles('bishop', 'horse')))
      .union(lanceAttacks(square, opposite(attacker), empty).intersect(this.board.role('lance')))
      .intersect(this.board.color(attacker));
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return standardDropDests(this, piece, ctx);
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }
}

export const standardMoveDests = (pos: Position, square: Square, ctx?: Context): SquareSet => {
  ctx = ctx || pos.ctx();
  const piece = pos.board.get(square);
  if (!piece || piece.color !== ctx.color) return SquareSet.empty();

  let pseudo = attacks(piece, square, pos.board.occupied);
  pseudo = pseudo.diff(pos.board.color(ctx.color));

  if (defined(ctx.king)) {
    if (piece.role === 'king') {
      const occ = pos.board.occupied.without(square);
      for (const to of pseudo) {
        if (pos.squareAttackers(to, opposite(ctx.color), occ).nonEmpty()) pseudo = pseudo.without(to);
      }
    } else {
      if (ctx.checkers.nonEmpty()) {
        const checker = ctx.checkers.singleSquare();
        if (!defined(checker)) return SquareSet.empty();
        pseudo = pseudo.intersect(between(checker, ctx.king).with(checker));
      }

      if (ctx.blockers.has(square)) pseudo = pseudo.intersect(ray(square, ctx.king));
    }
  }
  return pseudo.intersect(fullSquareSet(pos.rules));
};

export const standardDropDests = (pos: Position, piece: Piece, ctx?: Context): SquareSet => {
  ctx = ctx || pos.ctx();
  if (piece.color !== ctx.color) return SquareSet.empty();
  const role = piece.role;
  let mask = pos.board.occupied.complement();
  // Removing backranks, where no legal drop would be possible
  const dims = dimensions(pos.rules);
  if (role === 'pawn' || role === 'lance')
    mask = mask.diff(SquareSet.fromRank(ctx.color === 'sente' ? 0 : dims.ranks - 1));
  else if (role === 'knight')
    mask = mask.diff(ctx.color === 'sente' ? SquareSet.ranksAbove(2) : SquareSet.ranksBelow(dims.ranks - 3));

  if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
    const checker = ctx.checkers.singleSquare();
    if (!defined(checker)) return SquareSet.empty();
    mask = mask.intersect(between(checker, ctx.king));
  }

  if (role === 'pawn') {
    // Checking for double pawns
    const pawns = pos.board.role('pawn').intersect(pos.board.color(ctx.color));
    for (const pawn of pawns) {
      const file = SquareSet.fromFile(squareFile(pawn));
      mask = mask.diff(file);
    }
    // Checking for a pawn checkmate
    const kingSquare = pos.kingsOf(opposite(ctx.color)).singleSquare(),
      kingFront = defined(kingSquare) ? (ctx.color === 'sente' ? kingSquare + 16 : kingSquare - 16) : undefined;
    if (defined(kingFront) && mask.has(kingFront)) {
      const child = pos.clone();
      child.play({ role: 'pawn', to: kingFront });
      if (defined(child.outcome())) mask = mask.without(kingFront);
    }
  }

  return mask.intersect(fullSquareSet(pos.rules));
};
