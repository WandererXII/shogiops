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
import { Color, Piece, Role, Setup, Square } from '../types.js';
import { defined, opposite, squareFile } from '../util.js';
import { Context, Position, PositionError } from './position.js';
import { dimensions, fullSquareSet } from './util.js';

export class Shogi extends Position {
  private constructor() {
    super('standard');
  }

  static default(): Shogi {
    const pos = new this();
    pos.board = standardBoard();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static from(setup: Setup, strict: boolean): Result<Shogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map(_ => pos);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    return standardSquareAttacks(square, attacker, this.board, occupied);
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    return standardSquareSnipers(square, attacker, this.board);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    return standardDropDests(this, piece, ctx);
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }
}

export const standardBoard = (): Board => {
  const occupied = new SquareSet([0x8201ff, 0x1ff, 0x0, 0x8201ff, 0x1ff, 0x0, 0x0, 0x0]);
  const colorIter: [Color, SquareSet][] = [
    ['sente', new SquareSet([0x0, 0x0, 0x0, 0x8201ff, 0x1ff, 0x0, 0x0, 0x0])],
    ['gote', new SquareSet([0x8201ff, 0x1ff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  const roleIter: [Role, SquareSet][] = [
    ['rook', new SquareSet([0x800000, 0x0, 0x0, 0x20000, 0x0, 0x0, 0x0, 0x0])],
    ['bishop', new SquareSet([0x20000, 0x0, 0x0, 0x800000, 0x0, 0x0, 0x0, 0x0])],
    ['gold', new SquareSet([0x28, 0x0, 0x0, 0x0, 0x28, 0x0, 0x0, 0x0])],
    ['silver', new SquareSet([0x44, 0x0, 0x0, 0x0, 0x44, 0x0, 0x0, 0x0])],
    ['knight', new SquareSet([0x82, 0x0, 0x0, 0x0, 0x82, 0x0, 0x0, 0x0])],
    ['lance', new SquareSet([0x101, 0x0, 0x0, 0x0, 0x101, 0x0, 0x0, 0x0])],
    ['pawn', new SquareSet([0x0, 0x1ff, 0x0, 0x1ff, 0x0, 0x0, 0x0, 0x0])],
    ['king', new SquareSet([0x10, 0x0, 0x0, 0x0, 0x10, 0x0, 0x0, 0x0])],
  ];
  return Board.from(occupied, colorIter, roleIter);
};

export const standardSquareAttacks = (
  square: Square,
  attacker: Color,
  board: Board,
  occupied: SquareSet
): SquareSet => {
  const defender = opposite(attacker);
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
};

export const standardSquareSnipers = (square: number, attacker: Color, board: Board): SquareSet => {
  const empty = SquareSet.empty();
  return rookAttacks(square, empty)
    .intersect(board.roles('rook', 'dragon'))
    .union(bishopAttacks(square, empty).intersect(board.roles('bishop', 'horse')))
    .union(lanceAttacks(square, opposite(attacker), empty).intersect(board.role('lance')))
    .intersect(board.color(attacker));
};

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
        if (pos.squareAttackers(to, opposite(ctx.color), occ).nonEmpty())
          pseudo = pseudo.without(to);
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
    mask = mask.diff(
      ctx.color === 'sente' ? SquareSet.ranksAbove(2) : SquareSet.ranksBelow(dims.ranks - 3)
    );

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
      kingFront = defined(kingSquare)
        ? ctx.color === 'sente'
          ? kingSquare + 16
          : kingSquare - 16
        : undefined;
    if (defined(kingFront) && mask.has(kingFront)) {
      const child = pos.clone();
      child.play({ role: 'pawn', to: kingFront });
      const childCtx = child.ctx(),
        checkmateOrStalemate = child.isCheckmate(childCtx) || child.isStalemate(childCtx);
      if (checkmateOrStalemate) mask = mask.without(kingFront);
    }
  }

  return mask.intersect(fullSquareSet(pos.rules));
};
