import { Result } from '@badrap/result';
import { between } from '../attacks.js';
import type { Board } from '../board.js';
import { COLORS } from '../constants.js';
import type { Hands } from '../hands.js';
import { SquareSet } from '../square-set.js';
import type {
  Color,
  MoveOrDrop,
  Outcome,
  Piece,
  PieceName,
  Rules,
  Setup,
  Square,
} from '../types.js';
import { defined, isDrop, lionRoles, makePieceName, opposite, squareFile } from '../util.js';
import {
  allRoles,
  fullSquareSet,
  handRoles,
  pieceCanPromote,
  pieceForcePromote,
  promote,
  unpromoteForHand,
} from './util.js';

export const IllegalSetup = {
  Empty: 'ERR_EMPTY',
  OppositeCheck: 'ERR_OPPOSITE_CHECK',
  PiecesOutsideBoard: 'ERR_PIECES_OUTSIDE_BOARD',
  InvalidPieces: 'ERR_INVALID_PIECE',
  InvalidPiecesHand: 'ERR_INVALID_PIECE_IN_HAND',
  InvalidPiecesPromotionZone: 'ERR_PIECES_MUST_PROMOTE',
  InvalidPiecesDoublePawns: 'ERR_PIECES_DOUBLE_PAWNS',
  Kings: 'ERR_KINGS',
} as const;

export class PositionError extends Error {}

export interface Context {
  color: Color;
  king: Square | undefined;
  blockers: SquareSet;
  checkers: SquareSet;
}

export abstract class Position {
  readonly board: Board;
  readonly hands: Hands;
  readonly turn: Color;
  readonly moveNumber: number;
  readonly lastMoveOrDrop: MoveOrDrop | { to: Square } | undefined;
  readonly lastLionCapture: Square | undefined;

  protected constructor(
    readonly rules: Rules,
    readonly setup: Setup,
  ) {
    this.board = setup.board;
    this.hands = setup.hands;
    this.turn = setup.turn;
    this.moveNumber = setup.moveNumber;
    this.lastMoveOrDrop = setup.lastMoveOrDrop;
    this.lastLionCapture = setup.lastLionCapture;
  }

  update(setup: Partial<Setup>): this {
    const Constructor = this.constructor as new (setup: Setup) => this;

    return new Constructor({
      board: setup.board ?? this.board,
      hands: setup.hands ?? this.hands,
      turn: setup.turn ?? this.turn,
      moveNumber: setup.moveNumber ?? this.moveNumber,
      lastMoveOrDrop: 'lastMoveOrDrop' in setup ? setup.lastMoveOrDrop : this.lastMoveOrDrop,
      lastLionCapture: 'lastLionCapture' in setup ? setup.lastLionCapture : this.lastLionCapture,
    });
  }

  abstract moveDests(square: Square, ctx?: Context): SquareSet;
  abstract dropDests(piece: Piece, ctx?: Context): SquareSet;

  // Doesn't consider safety of the king
  illegalMoveDests(square: Square): SquareSet {
    return this.moveDests(square, {
      king: undefined,
      color: this.turn,
      blockers: SquareSet.empty(),
      checkers: SquareSet.empty(),
    });
  }

  // Doesn't consider safety of the king
  illegalDropDests(piece: Piece): SquareSet {
    return this.dropDests(piece, {
      king: undefined,
      color: this.turn,
      blockers: SquareSet.empty(),
      checkers: SquareSet.empty(),
    });
  }

  // Attackers' pieces attacking square - useful for checks for example
  abstract squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet;

  // Attackers' long-range pieces at least x-raying square - for finding blockers
  protected abstract squareSnipers(square: Square, attacker: Color): SquareSet;

  validation: {
    doublePawn: boolean;
    oppositeCheck: boolean;
    unpromotedForcedPromotion: boolean;
    maxNumberOfRoyalPieces: number;
  } = {
    doublePawn: true,
    oppositeCheck: true,
    unpromotedForcedPromotion: true,
    maxNumberOfRoyalPieces: 1,
  };

  validate(strict: boolean): Result<undefined, PositionError> {
    if (!this.board.occupied.intersect(fullSquareSet(this.rules)).equals(this.board.occupied))
      return Result.err(new PositionError(IllegalSetup.PiecesOutsideBoard));

    for (const [r] of this.hands.color('sente'))
      if (!handRoles(this.rules).includes(r))
        return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));
    for (const [r] of this.hands.color('gote'))
      if (!handRoles(this.rules).includes(r))
        return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));

    for (const role of this.board.presentRoles())
      if (!allRoles(this.rules).includes(role))
        return Result.err(new PositionError(IllegalSetup.InvalidPieces));

    if (this.validation.oppositeCheck) {
      const otherKing = this.kingsOf(opposite(this.turn)).singleSquare();
      if (
        defined(otherKing) &&
        this.squareAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()
      )
        return Result.err(new PositionError(IllegalSetup.OppositeCheck));
    }

    if (!strict) return Result.ok(undefined);

    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));

    if (this.validation.doublePawn) {
      for (const color of COLORS) {
        const files: number[] = [];
        const pawns = this.board.byRole('pawn').intersect(this.board.byColor(color));
        for (const pawn of pawns) {
          const file = squareFile(pawn);
          if (files.includes(file))
            return Result.err(new PositionError(IllegalSetup.InvalidPiecesDoublePawns));
          files.push(file);
        }
      }
    }

    if (
      this.kingsOf('sente').size() > this.validation.maxNumberOfRoyalPieces ||
      this.kingsOf('gote').size() > this.validation.maxNumberOfRoyalPieces
    )
      return Result.err(new PositionError(IllegalSetup.Kings));

    if (this.kingsOf('sente').isEmpty() && this.kingsOf('gote').isEmpty())
      return Result.err(new PositionError(IllegalSetup.Kings));

    if (this.validation.unpromotedForcedPromotion) {
      for (const [sq, piece] of this.board)
        if (pieceForcePromote(this.rules)(piece, sq))
          return Result.err(new PositionError(IllegalSetup.InvalidPiecesPromotionZone));
    }

    return Result.ok(undefined);
  }

  ctx(color?: Color): Context {
    color = color || this.turn;
    const king = this.kingsOf(color).singleSquare();
    if (!defined(king))
      return {
        color,
        king,
        blockers: SquareSet.empty(),
        checkers: SquareSet.empty(),
      };
    const snipers = this.squareSnipers(king, opposite(color));
    let blockers = SquareSet.empty();
    for (const sniper of snipers) {
      const b = between(king, sniper).intersect(this.board.occupied);
      if (!b.moreThanOne()) blockers = blockers.union(b);
    }
    const checkers = this.squareAttackers(king, opposite(color), this.board.occupied);
    return {
      color,
      king,
      blockers,
      checkers,
    };
  }

  kingsOf(color: Color): SquareSet {
    return this.board.byRole('king').intersect(this.board.byColor(color));
  }

  isCheck(color?: Color): boolean {
    color = color || this.turn;

    for (const king of this.kingsOf(color)) {
      if (this.squareAttackers(king, opposite(color), this.board.occupied).nonEmpty()) return true;
    }
    return false;
  }

  checks(): SquareSet {
    let checks = SquareSet.empty();
    COLORS.forEach((color) => {
      for (const king of this.kingsOf(color)) {
        if (this.squareAttackers(king, opposite(color), this.board.occupied).nonEmpty())
          checks = checks.with(king);
      }
    });
    return checks;
  }

  isEnd(ctx?: Context): boolean {
    return !!this.outcome(ctx);
  }

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();

    if (!this.hasDests(ctx)) {
      return {
        result: ctx.checkers.nonEmpty() ? 'checkmate' : 'stalemate',
        winner: opposite(ctx.color),
      };
    } else if (
      COLORS.every(
        (color) => this.board.byColor(color).size() + this.hands.color(color).count() < 2,
      )
    ) {
      return {
        result: 'draw',
        winner: undefined,
      };
    } else return;
  }

  allMoveDests(ctx?: Context): Map<Square, SquareSet> {
    ctx = ctx || this.ctx();
    const d: Map<Square, SquareSet> = new Map();
    for (const square of this.board.byColor(ctx.color)) {
      d.set(square, this.moveDests(square, ctx));
    }
    return d;
  }

  allDropDests(ctx?: Context): Map<PieceName, SquareSet> {
    ctx = ctx || this.ctx();
    const d: Map<PieceName, SquareSet> = new Map();
    for (const role of handRoles(this.rules)) {
      const piece = { color: ctx.color, role };
      if (this.hands[ctx.color].get(role) > 0) {
        d.set(makePieceName(piece), this.dropDests(piece, ctx));
      } else d.set(makePieceName(piece), SquareSet.empty());
    }
    return d;
  }

  hasDests(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    for (const square of this.board.byColor(ctx.color)) {
      if (this.moveDests(square, ctx).nonEmpty()) return true;
    }
    for (const [role] of this.hands[ctx.color]) {
      if (this.dropDests({ color: ctx.color, role }, ctx).nonEmpty()) return true;
    }
    return false;
  }

  isLegal(md: MoveOrDrop, ctx?: Context): boolean {
    const turn = ctx?.color || this.turn;
    if (isDrop(md)) {
      const role = md.role;
      if (!handRoles(this.rules).includes(role) || this.hands[turn].get(role) <= 0) return false;
      return this.dropDests({ color: turn, role }, ctx).has(md.to);
    } else {
      const piece = this.board.pieceAt(md.from);
      if (!piece || !allRoles(this.rules).includes(piece.role)) return false;

      // Checking whether we can promote
      if (
        md.promotion &&
        !pieceCanPromote(this.rules)(piece, md.from, md.to, this.board.pieceAt(md.to))
      )
        return false;
      if (!md.promotion && pieceForcePromote(this.rules)(piece, md.to)) return false;

      return this.moveDests(md.from, ctx).has(md.to);
    }
  }

  private storeCapture(hands: Hands, capture: Piece): Hands {
    const unpromotedRole = unpromoteForHand(this.rules)(capture.role);
    if (unpromotedRole && handRoles(this.rules).includes(unpromotedRole)) {
      return hands.increment({ color: opposite(capture.color), role: unpromotedRole });
    }
    return hands;
  }

  // doesn't care about validity, just tries to play the move/drop
  // Returns a new instance with the updated state
  play(md: MoveOrDrop): this {
    const nextTurn = opposite(this.turn);
    let nextBoard = this.board;
    let nextHands = this.hands;
    let nextLastLionCapture: Square | undefined;

    if (isDrop(md)) {
      nextBoard = nextBoard.withPieceAt(md.to, { role: md.role, color: this.turn });
      nextHands = nextHands.decrement({
        color: this.turn,
        role: unpromoteForHand(this.rules)(md.role) || md.role,
      });
    } else {
      const piece = nextBoard.pieceAt(md.from);
      const role = piece?.role;
      if (!piece || !role) return this;

      const movedPiece = { ...piece };

      nextBoard = nextBoard.withoutPieceAt(md.from);

      if (
        (md.promotion &&
          pieceCanPromote(this.rules)(piece, md.from, md.to, nextBoard.pieceAt(md.to))) ||
        pieceForcePromote(this.rules)(piece, md.to)
      ) {
        movedPiece.role = promote(this.rules)(role) || role;
      }

      const capture = nextBoard.pieceAt(md.to);
      nextBoard = nextBoard.withPieceAt(md.to, movedPiece);

      let midCapture: Piece | undefined;
      if (defined(md.midStep)) {
        midCapture = nextBoard.pieceAt(md.midStep);
        nextBoard = nextBoard.withoutPieceAt(md.midStep);
      }

      if (defined(midCapture)) {
        if (
          !lionRoles.includes(role) &&
          midCapture.color === nextTurn &&
          lionRoles.includes(midCapture.role)
        ) {
          nextLastLionCapture = md.midStep;
        }
        nextHands = this.storeCapture(nextHands, midCapture);
      }

      if (capture) {
        if (
          !lionRoles.includes(role) &&
          capture.color === nextTurn &&
          lionRoles.includes(capture.role)
        ) {
          nextLastLionCapture = md.to;
        }
        nextHands = this.storeCapture(nextHands, capture);
      }
    }

    return this.update({
      turn: nextTurn,
      moveNumber: this.moveNumber + 1,
      board: nextBoard,
      hands: nextHands,
      lastMoveOrDrop: md,
      lastLionCapture: nextLastLionCapture,
    });
  }
}
