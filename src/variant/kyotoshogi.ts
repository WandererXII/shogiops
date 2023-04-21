import { Result } from '@badrap/result';
import {
  between,
  bishopAttacks,
  goldAttacks,
  kingAttacks,
  knightAttacks,
  lanceAttacks,
  pawnAttacks,
  rookAttacks,
  silverAttacks,
} from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { Color, Move, Piece, Role, Setup, Square, isDrop } from '../types.js';
import { defined, opposite } from '../util.js';
import { Context, IllegalSetup, Position, PositionError } from './position.js';
import { standardMoveDests } from './shogi.js';
import { allRoles, fullSquareSet, handRoles, promotableRoles, unpromote } from './util.js';

export class Kyotoshogi extends Position {
  private constructor() {
    super('kyotoshogi');
  }

  static default(): Kyotoshogi {
    const pos = new this();
    pos.board = kyotoBoard();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static from(setup: Setup, strict: boolean): Result<Kyotoshogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map(_ => pos);
  }

  validate(strict: boolean): Result<undefined, PositionError> {
    const validated = super.validate(strict);
    if (validated.isErr && validated.error.message === IllegalSetup.InvalidPiecesPromotionZone)
      return Result.ok(undefined);
    else return validated;
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker),
      board = this.board;
    return board.color(attacker).intersect(
      rookAttacks(square, occupied)
        .intersect(board.role('rook'))
        .union(bishopAttacks(square, occupied).intersect(board.role('bishop')))
        .union(lanceAttacks(square, defender, occupied).intersect(board.role('lance')))
        .union(knightAttacks(square, defender).intersect(board.role('knight')))
        .union(goldAttacks(square, defender).intersect(board.roles('gold', 'tokin')))
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.role('king')))
    );
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty)
      .intersect(this.board.role('rook'))
      .union(bishopAttacks(square, empty).intersect(this.board.role('bishop')))
      .union(lanceAttacks(square, opposite(attacker), empty).intersect(this.board.role('lance')))
      .intersect(this.board.color(attacker));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    return standardMoveDests(this, square, ctx);
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    if (piece.color !== ctx.color) return SquareSet.empty();
    let mask = this.board.occupied.complement();

    if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
      const checker = ctx.checkers.singleSquare();
      if (!defined(checker)) return SquareSet.empty();
      mask = mask.intersect(between(checker, ctx.king));
    }

    return mask.intersect(fullSquareSet(this.rules));
  }

  isLegal(move: Move, ctx?: Context | undefined): boolean {
    const turn = ctx?.color || this.turn;
    if (isDrop(move)) {
      const roleInHand = !handRoles(this.rules).includes(move.role) ? unpromote(this.rules)(move.role) : move.role;
      if (!roleInHand || !handRoles(this.rules).includes(roleInHand) || this.hands[turn].get(roleInHand) <= 0)
        return false;
      return this.dropDests({ color: turn, role: move.role }, ctx).has(move.to);
    } else {
      const piece = this.board.get(move.from);
      if (!piece || !allRoles(this.rules).includes(piece.role)) return false;
      if (move.promotion && !promotableRoles(this.rules).includes(piece.role)) return false;

      return this.moveDests(move.from, ctx).has(move.to);
    }
  }
}

const kyotoBoard = (): Board => {
  const occupied = new SquareSet([0x1f, 0x0, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
  const colorIter: [Color, SquareSet][] = [
    ['sente', new SquareSet([0x0, 0x0, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['gote', new SquareSet([0x1f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  const roleIter: [Role, SquareSet][] = [
    ['tokin', new SquareSet([0x1, 0x0, 0x10, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['silver', new SquareSet([0x2, 0x0, 0x8, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['gold', new SquareSet([0x8, 0x0, 0x2, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['pawn', new SquareSet([0x10, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ['king', new SquareSet([0x4, 0x0, 0x4, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  return Board.from(occupied, colorIter, roleIter);
};
