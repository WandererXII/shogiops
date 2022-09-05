import { Result } from '@badrap/result';
import { Color, Square, Piece } from './types.js';
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
import { dimensions } from './variantUtil.js';
import { Context, Position, PositionError } from './position.js';

export class Shogi extends Position {
  private constructor() {
    super('standard');
    this.fullSquareSet = new SquareSet([0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]);
  }

  static default(): Shogi {
    const pos = new this();
    pos.board = Board.standard();
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
        .intersect(board.role('rook').union(board.role('dragon')))
        .union(bishopAttacks(square, occupied).intersect(board.role('bishop').union(board.role('horse'))))
        .union(lanceAttacks(square, defender, occupied).intersect(board.role('lance')))
        .union(knightAttacks(square, defender).intersect(board.role('knight')))
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(
          goldAttacks(square, defender).intersect(
            board
              .role('gold')
              .union(board.role('tokin'))
              .union(board.role('promotedlance'))
              .union(board.role('promotedknight'))
              .union(board.role('promotedsilver'))
          )
        )
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.role('king').union(board.role('dragon')).union(board.role('horse'))))
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.role('rook').union(this.board.role('dragon')))
      .union(bishopAttacks(square, empty).intersect(this.board.role('bishop').union(this.board.role('horse'))))
      .union(lanceAttacks(square, opposite(attacker), empty).intersect(this.board.role('lance')))
      .intersect(this.board.color(attacker));
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return pseudoDropDests(this, piece, ctx).intersect(this.fullSquareSet);
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return pseudoMoveDests(this, square, ctx).intersect(this.fullSquareSet);
  }

  hasInsufficientMaterial(color: Color): boolean {
    return this.board.color(color).size() + this.hands[color].count() < 2;
  }
}

export const pseudoMoveDests = (pos: Position, square: Square, ctx?: Context): SquareSet => {
  ctx = ctx || pos.ctx();
  const piece = pos.board.get(square);
  if (!piece || piece.color !== pos.turn) return SquareSet.empty();

  let pseudo = attacks(piece, square, pos.board.occupied);
  pseudo = pseudo.diff(pos.board.color(pos.turn));

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

export const pseudoDropDests = (pos: Position, piece: Piece, ctx?: Context): SquareSet => {
  ctx = ctx || pos.ctx();
  if (piece.color !== pos.turn) return SquareSet.empty();
  const role = piece.role;
  let mask = pos.board.occupied.complement();
  // Removing backranks, where no legal drop would be possible
  const dims = dimensions(pos.rules);
  if (role === 'pawn' || role === 'lance')
    mask = mask.diff(SquareSet.fromRank(pos.turn === 'sente' ? 0 : dims.ranks - 1));
  else if (role === 'knight')
    mask = mask.diff(pos.turn === 'sente' ? SquareSet.ranksAbove(2) : SquareSet.ranksBelow(dims.ranks - 3));

  if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
    const checker = ctx.checkers.singleSquare();
    if (!defined(checker)) return SquareSet.empty();
    mask = mask.intersect(between(checker, ctx.king));
  }

  if (role === 'pawn') {
    // Checking for double pawns
    const pawns = pos.board.role('pawn').intersect(pos.board.color(pos.turn));
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
