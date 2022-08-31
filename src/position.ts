import { Rules, Color, COLORS, Square, Move, isDrop, Piece, Outcome, Role } from './types.js';
import { SquareSet } from './squareSet.js';
import { Board } from './board.js';
import {
  bishopAttacks,
  rookAttacks,
  knightAttacks,
  kingAttacks,
  pawnAttacks,
  between,
  lanceAttacks,
  silverAttacks,
  goldAttacks,
} from './attacks.js';
import { opposite, defined } from './util.js';
import { Hands } from './hand.js';
import { allRoles, handRoles, pieceCanPromote, pieceInDeadZone, promote, unpromote } from './variantUtil.js';

export enum IllegalSetup {
  Empty = 'ERR_EMPTY',
  OppositeCheck = 'ERR_OPPOSITE_CHECK',
  ImpossibleCheck = 'ERR_IMPOSSIBLE_CHECK',
  InvalidPieces = 'ERR_INVALID_PIECE',
  InvalidPiecesHand = 'ERR_INVALID_PIECE_IN_HAND',
  InvalidPiecesPromotionZone = 'ERR_PIECES_MUST_PROMOTE',
  Kings = 'ERR_KINGS',
  Variant = 'ERR_VARIANT',
}

export class PositionError extends Error {}

function attacksTo(square: Square, attacker: Color, board: Board, occupied: SquareSet): SquareSet {
  const defender = opposite(attacker);
  return board[attacker].intersect(
    rookAttacks(square, occupied)
      .intersect(board.rook.union(board.dragon))
      .union(bishopAttacks(square, occupied).intersect(board.bishop.union(board.horse)))
      .union(lanceAttacks(defender, square, occupied).intersect(board.lance))
      .union(knightAttacks(defender, square).intersect(board.knight))
      .union(silverAttacks(defender, square).intersect(board.silver))
      .union(
        goldAttacks(defender, square).intersect(
          board.gold
            .union(board.tokin)
            .union(board.promotedlance)
            .union(board.promotedknight)
            .union(board.promotedsilver)
        )
      )
      .union(kingAttacks(square).intersect(board.king.union(board.horse).union(board.dragon)))
      .union(pawnAttacks(defender, square).intersect(board.pawn))
  );
}

export interface Context {
  king: Square | undefined;
  blockers: SquareSet;
  checkers: SquareSet;
  variantEnd: boolean;
  mustCapture: boolean;
}

export abstract class Position {
  board: Board;
  hands: Hands;
  turn: Color;
  fullmoves: number;
  lastMove: Move | undefined;

  protected constructor(readonly rules: Rules) {}

  // When subclassing:

  // - static default()
  // - static initialize()
  // - Proper signature for clone()

  abstract dropDests(role: Role, ctx?: Context): SquareSet;
  abstract dests(square: Square, ctx?: Context): SquareSet;
  abstract isVariantEnd(): boolean;
  abstract variantOutcome(ctx?: Context): Outcome | undefined;
  abstract hasInsufficientMaterial(color: Color): boolean;

  protected kingAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    return attacksTo(square, attacker, this.board, occupied);
  }

  protected playCaptureAt(captured: Piece): void {
    const unpromotedRole = unpromote(this.rules)(captured.role) || captured.role;
    this.hands[opposite(captured.color)][unpromotedRole]++;
  }

  ctx(): Context {
    const variantEnd = this.isVariantEnd();
    const king = this.board.kingOf(this.turn);
    if (!defined(king))
      return {
        king,
        blockers: SquareSet.empty(),
        checkers: SquareSet.empty(),
        variantEnd,
        mustCapture: false,
      };
    const snipers = rookAttacks(king, SquareSet.empty())
      .intersect(this.board.rook.union(this.board.dragon))
      .union(bishopAttacks(king, SquareSet.empty()).intersect(this.board.bishop.union(this.board.horse)))
      .union(lanceAttacks(this.turn, king, SquareSet.empty()).intersect(this.board.lance))
      .intersect(this.board[opposite(this.turn)]);
    let blockers = SquareSet.empty();
    for (const sniper of snipers) {
      const b = between(king, sniper).intersect(this.board.occupied);
      if (!b.moreThanOne()) blockers = blockers.union(b);
    }
    const checkers = this.kingAttackers(king, opposite(this.turn), this.board.occupied);
    return {
      king,
      blockers,
      checkers,
      variantEnd,
      mustCapture: false,
    };
  }

  // The following should be identical in all subclasses

  clone(): Position {
    const pos = new (this as any).constructor();
    pos.board = this.board.clone();
    pos.hands = this.hands.clone();
    pos.turn = this.turn;
    pos.fullmoves = this.fullmoves;
    pos.lastMove = this.lastMove;
    return pos;
  }

  equalsIgnoreMoves(other: Position): boolean {
    return (
      this.rules === other.rules &&
      this.board.equals(other.board) &&
      this.hands.equals(other.hands) &&
      this.turn === other.turn
    );
  }

  isInsufficientMaterial(): boolean {
    return COLORS.every(color => this.hasInsufficientMaterial(color));
  }

  hasDests(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    for (const square of this.board[this.turn]) {
      if (this.dests(square, ctx).nonEmpty()) return true;
    }
    for (const prole of handRoles(this.rules)) {
      if (this.hands[this.turn][prole] > 0 && this.dropDests(prole, ctx).nonEmpty()) return true;
    }
    return false;
  }

  isLegal(move: Move, ctx?: Context): boolean {
    if (isDrop(move)) {
      const role = move.role;
      if (!defined(role) || !handRoles(this.rules).includes(role) || this.hands[this.turn][role] <= 0) return false;
      return this.dropDests(role, ctx).has(move.to);
    } else {
      const piece = this.board.get(move.from);
      if (!piece || !allRoles(this.rules).includes(piece.role)) return false;

      // Checking whether we can promote
      if (move.promotion && !pieceCanPromote(this.rules)(piece, move.from, move.to)) return false;
      if (!move.promotion && pieceInDeadZone(this.rules)(piece, move.to)) return false;

      const dests = this.dests(move.from, ctx);
      return dests.has(move.to);
    }
  }

  isCheck(): boolean {
    const king = this.board.kingOf(this.turn);
    return defined(king) && this.kingAttackers(king, opposite(this.turn), this.board.occupied).nonEmpty();
  }

  isEnd(ctx?: Context): boolean {
    if (ctx ? ctx.variantEnd : this.isVariantEnd()) return true;
    return this.isInsufficientMaterial() || !this.hasDests(ctx);
  }

  isCheckmate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return !ctx.variantEnd && ctx.checkers.nonEmpty() && !this.hasDests(ctx);
  }

  isStalemate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return !ctx.variantEnd && ctx.checkers.isEmpty() && !this.hasDests(ctx);
  }

  outcome(ctx?: Context): Outcome | undefined {
    const variantOutcome = this.variantOutcome(ctx);
    if (defined(variantOutcome)) return variantOutcome;
    ctx = ctx || this.ctx();
    const checkmateStalemate = this.isCheckmate(ctx) || this.isStalemate(ctx);
    if (checkmateStalemate && !(this.lastMove && isDrop(this.lastMove) && this.lastMove.role === 'pawn'))
      return { winner: opposite(this.turn) };
    else if (checkmateStalemate) return { winner: this.turn };
    else if (this.isInsufficientMaterial()) return { winner: undefined };
    else return;
  }

  allDests(ctx?: Context): Map<Square, SquareSet> {
    ctx = ctx || this.ctx();
    const d = new Map();
    if (ctx.variantEnd) return d;
    for (const square of this.board[this.turn]) {
      d.set(square, this.dests(square, ctx));
    }
    return d;
  }

  allDropDests(ctx?: Context): Map<Role, SquareSet> {
    ctx = ctx || this.ctx();
    const d = new Map();
    if (ctx.variantEnd) return d;
    for (const prole of handRoles(this.rules)) {
      if (this.hands[this.turn][prole] > 0) d.set(prole, this.dropDests(prole, ctx));
      else d.set(prole, SquareSet.empty());
    }
    return d;
  }

  play(move: Move): void {
    const turn = this.turn;

    this.fullmoves += 1;
    this.turn = opposite(turn);
    this.lastMove = move;

    if (isDrop(move)) {
      this.board.set(move.to, { role: move.role, color: turn });
      this.hands[turn][move.role]--;
    } else {
      const piece = this.board.take(move.from);
      if (!piece) return;
      if (
        (move.promotion && pieceCanPromote(this.rules)(piece, move.from, move.to)) ||
        pieceInDeadZone(this.rules)(piece, move.to)
      )
        piece.role = promote(this.rules)(piece.role) || piece.role;

      const capture = this.board.set(move.to, piece);
      if (capture) this.playCaptureAt(capture);
    }
  }
}
