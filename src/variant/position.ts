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
  Role,
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
  unpromote,
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
  board: Board;
  hands: Hands;
  turn: Color;
  moveNumber: number;
  lastMoveOrDrop: MoveOrDrop | { to: Square } | undefined;
  lastLionCapture: Square | undefined; // by non-lion piece

  protected constructor(readonly rules: Rules) {}

  // When subclassing:
  // - private constructor()
  // - static default()
  // - static from(
  //     setup: Setup,
  //     strict: boolean
  //   )

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

  protected fromSetup(setup: Setup): void {
    this.board = setup.board.clone();
    this.hands = setup.hands.clone();
    this.turn = setup.turn;
    this.moveNumber = setup.moveNumber;
    this.lastMoveOrDrop = setup.lastMoveOrDrop;
    this.lastLionCapture = setup.lastLionCapture;
  }

  clone(): this {
    const pos = new (this.constructor as new () => this)();
    pos.board = this.board.clone();
    pos.hands = this.hands.clone();
    pos.turn = this.turn;
    pos.moveNumber = this.moveNumber;
    pos.lastMoveOrDrop = this.lastMoveOrDrop;
    pos.lastLionCapture = this.lastLionCapture;
    return pos;
  }

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

    const otherKing = this.kingsOf(opposite(this.turn)).singleSquare();
    if (
      defined(otherKing) &&
      this.squareAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()
    )
      return Result.err(new PositionError(IllegalSetup.OppositeCheck));

    if (!strict) return Result.ok(undefined);

    // double pawns
    for (const color of COLORS) {
      const files: number[] = [];
      const pawns = this.board.role('pawn').intersect(this.board.color(color));
      for (const pawn of pawns) {
        const file = squareFile(pawn);
        if (files.includes(file))
          return Result.err(new PositionError(IllegalSetup.InvalidPiecesDoublePawns));
        files.push(file);
      }
    }

    if (
      this.board.pieces('sente', 'king').size() >= 2 ||
      this.board.pieces('gote', 'king').size() >= 2
    )
      return Result.err(new PositionError(IllegalSetup.Kings));

    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    if (this.board.role('king').isEmpty()) return Result.err(new PositionError(IllegalSetup.Kings));

    for (const [sq, piece] of this.board)
      if (pieceForcePromote(this.rules)(piece, sq))
        return Result.err(new PositionError(IllegalSetup.InvalidPiecesPromotionZone));

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
    return this.board.role('king').intersect(this.board.color(color));
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

  isCheckmate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return ctx.checkers.nonEmpty() && !this.hasDests(ctx);
  }

  isStalemate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return ctx.checkers.isEmpty() && !this.hasDests(ctx);
  }

  isDraw(_ctx?: Context): boolean {
    return COLORS.every((color) => this.board.color(color).size() + this.hands[color].count() < 2);
  }

  isBareKing(_ctx?: Context): boolean {
    return false;
  }

  isWithoutKings(_ctx?: Context): boolean {
    return false;
  }

  isSpecialVariantEnd(_ctx?: Context): boolean {
    return false;
  }

  isEnd(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return (
      this.isCheckmate(ctx) ||
      this.isStalemate(ctx) ||
      this.isDraw(ctx) ||
      this.isBareKing(ctx) ||
      this.isWithoutKings(ctx) ||
      this.isSpecialVariantEnd(ctx)
    );
  }

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();

    if (this.isCheckmate(ctx))
      return {
        result: 'checkmate',
        winner: opposite(ctx.color),
      };
    else if (this.isStalemate(ctx)) {
      return {
        result: 'stalemate',
        winner: opposite(ctx.color),
      };
    } else if (this.isDraw(ctx)) {
      return {
        result: 'draw',
        winner: undefined,
      };
    } else return;
  }

  allMoveDests(ctx?: Context): Map<Square, SquareSet> {
    ctx = ctx || this.ctx();
    const d: Map<Square, SquareSet> = new Map();
    for (const square of this.board.color(ctx.color)) {
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
    for (const square of this.board.color(ctx.color)) {
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
      const piece = this.board.get(md.from);
      if (!piece || !allRoles(this.rules).includes(piece.role)) return false;

      // Checking whether we can promote
      if (
        md.promotion &&
        !pieceCanPromote(this.rules)(piece, md.from, md.to, this.board.get(md.to))
      )
        return false;
      if (!md.promotion && pieceForcePromote(this.rules)(piece, md.to)) return false;

      return this.moveDests(md.from, ctx).has(md.to);
    }
  }

  private unpromoteForHand(role: Role): Role | undefined {
    if (handRoles(this.rules).includes(role)) return role;
    const unpromotedRole = unpromote(this.rules)(role);
    if (unpromotedRole && handRoles(this.rules).includes(unpromotedRole)) return unpromotedRole;
    return;
  }

  private storeCapture(capture: Piece): void {
    const unpromotedRole = this.unpromoteForHand(capture.role);
    if (unpromotedRole && handRoles(this.rules).includes(unpromotedRole))
      this.hands[opposite(capture.color)].capture(unpromotedRole);
  }

  // doesn't care about validity, just tries to play the move/drop
  play(md: MoveOrDrop): void {
    const turn = this.turn;

    this.moveNumber += 1;
    this.turn = opposite(turn);
    this.lastMoveOrDrop = md;
    this.lastLionCapture = undefined;

    if (isDrop(md)) {
      this.board.set(md.to, { role: md.role, color: turn });
      this.hands[turn].drop(this.unpromoteForHand(md.role) || md.role);
    } else {
      const piece = this.board.take(md.from),
        role = piece?.role;
      if (!role) return;

      if (
        (md.promotion &&
          pieceCanPromote(this.rules)(piece, md.from, md.to, this.board.get(md.to))) ||
        pieceForcePromote(this.rules)(piece, md.to)
      )
        piece.role = promote(this.rules)(role) || role;

      const capture = this.board.set(md.to, piece),
        midCapture = defined(md.midStep) ? this.board.take(md.midStep) : undefined;

      // process midCapture (if exists) before final destination capture
      if (defined(midCapture)) {
        if (
          !lionRoles.includes(role) &&
          midCapture.color === this.turn &&
          lionRoles.includes(midCapture.role)
        )
          this.lastLionCapture = md.midStep;
        this.storeCapture(midCapture);
      }
      if (capture) {
        if (
          !lionRoles.includes(role) &&
          capture.color === this.turn &&
          lionRoles.includes(capture.role)
        )
          this.lastLionCapture = md.to;
        this.storeCapture(capture);
      }
    }
  }
}
