import { Result } from '@badrap/result';
import { Color, Square, Role } from './types.js';
import { SquareSet } from './squareSet.js';
import { Board } from './board.js';
import {
  between,
  ray,
  attacks,
  rookAttacks,
  bishopAttacks,
  lanceAttacks,
  silverAttacks,
  knightAttacks,
  goldAttacks,
  kingAttacks,
  pawnAttacks,
} from './attacks.js';
import { opposite, defined, squareFile } from './util.js';
import { Hands } from './hands.js';
import { backrank, secondBackrank } from './variantUtil.js';
import { Context, Position, PositionError } from './position.js';

export class Shogi extends Position {
  private constructor() {
    super('standard');
    this.fullSquareSet = new SquareSet([0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]);
  }

  static default(): Shogi {
    const pos = new this();
    pos.board = Board.default();
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
    return board[attacker].intersect(
      rookAttacks(square, occupied)
        .intersect(board.rook.union(board.dragon))
        .union(bishopAttacks(square, occupied).intersect(board.bishop.union(board.horse)))
        .union(lanceAttacks(square, defender, occupied).intersect(board.lance))
        .union(knightAttacks(square, defender).intersect(board.knight))
        .union(silverAttacks(square, defender).intersect(board.silver))
        .union(
          goldAttacks(square, defender).intersect(
            board.gold
              .union(board.tokin)
              .union(board.promotedlance)
              .union(board.promotedknight)
              .union(board.promotedsilver)
          )
        )
        .union(kingAttacks(square).intersect(board.king.union(board.dragon).union(board.horse)))
        .union(pawnAttacks(square, defender).intersect(board.pawn))
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.rook.union(this.board.dragon))
      .union(bishopAttacks(square, empty).intersect(this.board.bishop.union(this.board.horse)))
      .union(lanceAttacks(square, opposite(attacker), empty).intersect(this.board.lance))
      .intersect(this.board[attacker]);
  }

  dropDests(role: Role, ctx?: Context): SquareSet {
    return pseudoDropDests(this, role, ctx).intersect(this.fullSquareSet);
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return pseudoMoveDests(this, square, ctx).intersect(this.fullSquareSet);
  }

  hasInsufficientMaterial(color: Color): boolean {
    return this.board[color].size() + this.hands[color].count() < 2;
  }
}

export const pseudoMoveDests = (pos: Position, square: Square, ctx?: Context) => {
  ctx = ctx || pos.ctx();
  const piece = pos.board.get(square);
  if (!piece || piece.color !== pos.turn) return SquareSet.empty();

  let pseudo = attacks(piece, square, pos.board.occupied);
  pseudo = pseudo.diff(pos.board[pos.turn]);

  if (defined(ctx.king)) {
    if (piece.role === 'king') {
      const occ = pos.board.occupied.without(square);
      for (const to of pseudo) {
        if (pos.squareAttackers(to, opposite(pos.turn), occ).nonEmpty()) pseudo = pseudo.without(to);
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
  return pseudo;
};

export const pseudoDropDests = (pos: Position, role: Role, ctx?: Context) => {
  ctx = ctx || pos.ctx();
  let mask = pos.board.occupied.complement();
  // Removing backranks, where no legal drop would be possible
  if (role === 'pawn' || role === 'lance' || role === 'knight') mask = mask.diff(backrank(pos.rules)(pos.turn));
  if (role === 'knight') mask = mask.diff(secondBackrank(pos.rules)(pos.turn));

  if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
    const checker = ctx.checkers.singleSquare();
    if (!defined(checker)) return SquareSet.empty();
    mask = mask.intersect(between(checker, ctx.king));
  }

  if (role === 'pawn') {
    // Checking for double pawns
    const pawns = pos.board.pawn.intersect(pos.board[pos.turn]);
    for (const pawn of pawns) {
      const file = SquareSet.fromFile(squareFile(pawn));
      mask = mask.diff(file);
    }
    // Checking for a pawn checkmate
    const king = pos.board.pieces(opposite(pos.turn), 'king');
    const kingFront = (pos.turn === 'sente' ? king.shl256(16) : king.shr256(16)).singleSquare();
    if (kingFront && mask.has(kingFront)) {
      const child = pos.clone();
      child.play({ role: 'pawn', to: kingFront });
      if (defined(child.outcome())) mask = mask.without(kingFront);
    }
  }

  return mask;
};
