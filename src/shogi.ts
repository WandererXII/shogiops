import { Result } from '@badrap/result';
import { Rules, Color, Square, Outcome, Role } from './types.js';
import { SquareSet } from './squareSet.js';
import { Board } from './board.js';
import { between, ray, attacks } from './attacks.js';
import { opposite, defined } from './util.js';
import { Hands } from './hand.js';
import { allRoles, backrank, handRoles, pieceInDeadZone, secondBackrank } from './variantUtil.js';
import { Context, IllegalSetup, Position, PositionError } from './position.js';

export class Shogi extends Position {
  protected constructor(rules?: Rules) {
    super(rules || 'standard');
  }

  static default(): Shogi {
    const pos = new this();
    pos.board = Board.default();
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
    strict = true
  ): Result<Shogi, PositionError> {
    const pos = new this();
    pos.board = board.clone();
    pos.hands = hands.clone();
    pos.turn = turn;
    pos.fullmoves = moveNumber;
    return pos.validate(strict).map(_ => pos);
  }

  clone(): Shogi {
    return super.clone() as Shogi;
  }

  protected validate(strict: boolean): Result<undefined, PositionError> {
    if (!strict) return Result.ok(undefined);
    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    if (this.board.king.size() < 1) return Result.err(new PositionError(IllegalSetup.Kings));

    const otherKing = this.board.kingOf(opposite(this.turn));
    if (defined(otherKing) && this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty())
      return Result.err(new PositionError(IllegalSetup.OppositeCheck));

    for (const rn of this.hands.sente)
      if (!handRoles(this.rules).includes(rn[0])) return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));
    for (const rn of this.hands.gote)
      if (!handRoles(this.rules).includes(rn[0])) return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));

    for (const sp of this.board) {
      if (!allRoles(this.rules).includes(sp[1].role)) return Result.err(new PositionError(IllegalSetup.InvalidPieces));
      if (pieceInDeadZone(this.rules)(sp[1], sp[0]))
        return Result.err(new PositionError(IllegalSetup.InvalidPiecesPromotionZone));
    }

    return this.validateCheckers();
  }

  protected validateCheckers(): Result<undefined, PositionError> {
    const ourKing = this.board.kingOf(this.turn);
    if (defined(ourKing)) {
      // Multiple sliding checkers aligned with king.
      const checkers = this.kingAttackers(ourKing, opposite(this.turn), this.board.occupied);
      if (checkers.size() > 2 || (checkers.size() === 2 && ray(checkers.first()!, checkers.last()!).has(ourKing)))
        return Result.err(new PositionError(IllegalSetup.ImpossibleCheck));
    }
    return Result.ok(undefined);
  }

  dropDests(role: Role, ctx?: Context): SquareSet {
    let mask = this.board.occupied
      .complement()
      .intersect(new SquareSet([0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]));
    ctx = ctx || this.ctx();
    // Removing backranks, where no legal drop would be possible
    if (role === 'pawn' || role === 'lance' || role === 'knight') mask = mask.diff(backrank(this.rules)(this.turn));
    if (role === 'knight') mask = mask.diff(secondBackrank(this.rules)(this.turn));

    // Checking for double pawns
    if (role === 'pawn') {
      const pawns = this.board.pawn.intersect(this.board[this.turn]);
      for (let i = 0; i < 9; i++) {
        const file = SquareSet.fromFile(i);
        if (pawns.intersect(file).nonEmpty()) mask = mask.diff(file);
      }
    }

    // Checking for a pawn checkmate
    if (role === 'pawn') {
      const king = this.board.pieces(opposite(this.turn), 'king');
      const kingFront = (this.turn === 'sente' ? king.shl256(16) : king.shr256(16)).singleSquare();
      if (kingFront && mask.has(kingFront)) {
        const child = this.clone();
        child.play({ role: 'pawn', to: kingFront });
        if (defined(child.outcome())) mask = mask.diff(SquareSet.fromSquare(kingFront));
      }
    }

    if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
      const checker = ctx.checkers.singleSquare();
      if (!defined(checker)) return SquareSet.empty();
      return mask.intersect(between(checker, ctx.king));
    } else return mask;
  }

  dests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    if (ctx.variantEnd) return SquareSet.empty();
    const piece = this.board.get(square);
    if (!piece || piece.color !== this.turn) return SquareSet.empty();

    let pseudo = attacks(piece, square, this.board.occupied);
    pseudo = pseudo.diff(this.board[this.turn]);

    if (defined(ctx.king)) {
      if (piece.role === 'king') {
        const occ = this.board.occupied.without(square);
        for (const to of pseudo) {
          if (this.kingAttackers(to, opposite(this.turn), occ).nonEmpty()) pseudo = pseudo.without(to);
        }
        return pseudo.intersect(new SquareSet([0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]));
      }

      if (ctx.checkers.nonEmpty()) {
        const checker = ctx.checkers.singleSquare();
        if (!defined(checker)) return SquareSet.empty();
        pseudo = pseudo.intersect(between(checker, ctx.king).with(checker));
      }

      if (ctx.blockers.has(square)) pseudo = pseudo.intersect(ray(square, ctx.king));
    }
    return pseudo.intersect(new SquareSet([0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]));
  }

  isVariantEnd(): boolean {
    return false;
  }

  variantOutcome(_ctx?: Context): Outcome | undefined {
    return;
  }

  hasInsufficientMaterial(color: Color): boolean {
    return this.board.occupied.intersect(this.board[color]).size() + this.hands[color].count() < 2; // sente king, gote king and one other piece
  }
}
