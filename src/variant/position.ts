import { Result } from '@badrap/result';
import { between, ray } from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { COLORS, Color, Move, Outcome, Piece, PieceName, Rules, Square, isDrop } from '../types.js';
import { defined, makePieceName, opposite } from '../util.js';
import { allRoles, handRoles, pieceCanPromote, pieceForcePromote, promote, unpromote } from './util.js';

export enum IllegalSetup {
  Empty = 'ERR_EMPTY',
  OppositeCheck = 'ERR_OPPOSITE_CHECK',
  ImpossibleCheck = 'ERR_IMPOSSIBLE_CHECK',
  InvalidPieces = 'ERR_INVALID_PIECE',
  InvalidPiecesHand = 'ERR_INVALID_PIECE_IN_HAND',
  InvalidPiecesPromotionZone = 'ERR_PIECES_MUST_PROMOTE',
  Kings = 'ERR_KINGS',
}

export class PositionError extends Error {}

export interface Context {
  king: Square | undefined;
  blockers: SquareSet;
  checkers: SquareSet;
}

export abstract class Position {
  board: Board;
  hands: Hands;
  turn: Color;
  moveNumber: number;
  lastMove: Move | undefined;
  lastCapture: Piece | undefined;

  fullSquareSet: SquareSet;

  protected constructor(readonly rules: Rules) {}

  // When subclassing:
  // - private constructor()
  // - static default()
  // - static from(
  //     board: Board,
  //     hands: Hands,
  //     turn: Color,
  //     moveNumber: number,
  //     strict: boolean
  //   )

  abstract moveDests(square: Square, ctx?: Context): SquareSet;
  abstract dropDests(piece: Piece, ctx?: Context): SquareSet;

  abstract hasInsufficientMaterial(color: Color): boolean;
  // Attackers' pieces attacking square - useful for checks for example
  abstract squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet;

  // Attackers' long-range pieces at least x-raying square - for finding blockers
  protected abstract squareSnipers(square: Square, attacker: Color): SquareSet;

  protected validate(strict: boolean): Result<undefined, PositionError> {
    for (const [r] of this.hands.color('sente'))
      if (!handRoles(this.rules).includes(r)) return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));
    for (const [r] of this.hands.color('gote'))
      if (!handRoles(this.rules).includes(r)) return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));
    for (const role of this.board.roles())
      if (!allRoles(this.rules).includes(role)) return Result.err(new PositionError(IllegalSetup.InvalidPieces));

    if (!strict) return Result.ok(undefined);

    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    if (this.board.role('king').size() < 1) return Result.err(new PositionError(IllegalSetup.Kings));

    const otherKing = this.board.kingOf(opposite(this.turn));
    if (defined(otherKing) && this.squareAttackers(otherKing, this.turn, this.board.occupied).nonEmpty())
      return Result.err(new PositionError(IllegalSetup.OppositeCheck));

    for (const [sq, piece] of this.board)
      if (pieceForcePromote(this.rules)(piece, sq))
        return Result.err(new PositionError(IllegalSetup.InvalidPiecesPromotionZone));

    return this.validateCheckers();
  }

  protected validateCheckers(): Result<undefined, PositionError> {
    const ourKing = this.board.kingOf(this.turn);
    if (defined(ourKing)) {
      // Multiple sliding checkers aligned with king.
      const checkers = this.squareAttackers(ourKing, opposite(this.turn), this.board.occupied);
      if (checkers.size() > 2 || (checkers.size() === 2 && ray(checkers.first()!, checkers.last()!).has(ourKing)))
        return Result.err(new PositionError(IllegalSetup.ImpossibleCheck));
    }
    return Result.ok(undefined);
  }

  ctx(): Context {
    const king = this.board.kingOf(this.turn);
    if (!defined(king))
      return {
        king,
        blockers: SquareSet.empty(),
        checkers: SquareSet.empty(),
      };
    const snipers = this.squareSnipers(king, opposite(this.turn));
    let blockers = SquareSet.empty();
    for (const sniper of snipers) {
      const b = between(king, sniper).intersect(this.board.occupied);
      if (!b.moreThanOne()) blockers = blockers.union(b);
    }
    const checkers = this.squareAttackers(king, opposite(this.turn), this.board.occupied);
    return {
      king,
      blockers,
      checkers,
    };
  }

  clone(): this {
    const pos = new (this as any).constructor();
    pos.board = this.board.clone();
    pos.hands = this.hands.clone();
    pos.turn = this.turn;
    pos.moveNumber = this.moveNumber;
    pos.lastMove = this.lastMove;
    return pos;
  }

  isInsufficientMaterial(): boolean {
    return COLORS.every(color => this.hasInsufficientMaterial(color));
  }

  hasDests(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    for (const square of this.board.color(this.turn)) {
      if (this.moveDests(square, ctx).nonEmpty()) return true;
    }
    for (const [role] of this.hands[this.turn]) {
      if (this.dropDests({ color: this.turn, role }, ctx).nonEmpty()) return true;
    }
    return false;
  }

  isLegal(move: Move, ctx?: Context): boolean {
    if (isDrop(move)) {
      const role = move.role;
      if (!handRoles(this.rules).includes(role) || this.hands[this.turn].get(role) <= 0) return false;
      return this.dropDests({ color: this.turn, role }, ctx).has(move.to);
    } else {
      const piece = this.board.get(move.from);
      if (!piece || !allRoles(this.rules).includes(piece.role)) return false;

      // Checking whether we can promote
      if (move.promotion && !pieceCanPromote(this.rules)(piece, move.from, move.to, this.board.get(move.to)))
        return false;
      if (!move.promotion && pieceForcePromote(this.rules)(piece, move.to)) return false;

      const moveDests = this.moveDests(move.from, ctx);
      return moveDests.has(move.to);
    }
  }

  isCheck(ctx?: Context): boolean {
    if (ctx) return ctx.checkers.nonEmpty();
    const king = this.board.kingOf(this.turn);
    return defined(king) && this.squareAttackers(king, opposite(this.turn), this.board.occupied).nonEmpty();
  }

  isEnd(ctx?: Context): boolean {
    return this.isInsufficientMaterial() || !this.hasDests(ctx);
  }

  isCheckmate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return ctx.checkers.nonEmpty() && !this.hasDests(ctx);
  }

  isStalemate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return ctx.checkers.isEmpty() && !this.hasDests(ctx);
  }

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();
    if (this.isCheckmate(ctx) || this.isStalemate(ctx)) return { winner: opposite(this.turn) };
    else if (this.isInsufficientMaterial()) return { winner: undefined };
    else return;
  }

  allMoveDests(ctx?: Context): Map<Square, SquareSet> {
    ctx = ctx || this.ctx();
    const d: Map<Square, SquareSet> = new Map();
    for (const square of this.board.color(this.turn)) {
      d.set(square, this.moveDests(square, ctx));
    }
    return d;
  }

  allDropDests(ctx?: Context): Map<PieceName, SquareSet> {
    ctx = ctx || this.ctx();
    const d: Map<PieceName, SquareSet> = new Map();
    for (const role of handRoles(this.rules)) {
      const piece = { color: this.turn, role };
      if (this.hands[this.turn].get(role) > 0) {
        d.set(makePieceName(piece), this.dropDests(piece, ctx));
      } else d.set(makePieceName(piece), SquareSet.empty());
    }
    return d;
  }

  // doesn't care about validity, just tries to play the move
  play(move: Move): void {
    const turn = this.turn;

    this.moveNumber += 1;
    this.turn = opposite(turn);
    this.lastMove = move;

    if (isDrop(move)) {
      this.board.set(move.to, { role: move.role, color: turn });
      this.hands[turn].drop(move.role);
    } else {
      const piece = this.board.take(move.from);
      if (!piece) return;
      if (
        (move.promotion && pieceCanPromote(this.rules)(piece, move.from, move.to, this.board.get(move.to))) ||
        pieceForcePromote(this.rules)(piece, move.to)
      )
        piece.role = promote(this.rules)(piece.role) || piece.role;

      const capture = this.board.set(move.to, piece);
      this.lastCapture = capture;
      if (capture) {
        const unpromotedRole = unpromote(this.rules)(capture.role) || capture.role;
        if (handRoles(this.rules).includes(unpromotedRole)) this.hands[opposite(capture.color)].capture(unpromotedRole);
      }
    }
  }
}
