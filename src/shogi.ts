import { Result } from '@badrap/result';
import { Rules, Color, COLORS, Square, Move, isDrop, Piece, Outcome, HAND_ROLES, HandRole } from './types';
import { SquareSet } from './squareSet';
import { Board } from './board';
import { Setup } from './setup';
import {
  bishopAttacks,
  rookAttacks,
  knightAttacks,
  kingAttacks,
  pawnAttacks,
  between,
  ray,
  lanceAttacks,
  silverAttacks,
  goldAttacks,
  horseAttacks,
  dragonAttacks,
} from './attacks';
import { opposite, defined, unpromote, promote } from './util';
import { Hands } from './hand';

export enum IllegalSetup {
  Empty = 'ERR_EMPTY',
  OppositeCheck = 'ERR_OPPOSITE_CHECK',
  ImpossibleCheck = 'ERR_IMPOSSIBLE_CHECK',
  InvalidPiecesPromotionZone = 'ERR_PIECES_MUST_PROMOTE',
  Kings = 'ERR_KINGS',
  Variant = 'ERR_VARIANT',
}

export class PositionError extends Error {}

function attacksTo(square: Square, attacker: Color, board: Board, occupied: SquareSet): SquareSet {
  return board[attacker].intersect(
    rookAttacks(square, occupied)
      .intersect(board.rook)
      .union(bishopAttacks(square, occupied).intersect(board.bishop))
      .union(lanceAttacks(opposite(attacker), square, occupied).intersect(board.lance))
      .union(knightAttacks(opposite(attacker), square).intersect(board.knight))
      .union(silverAttacks(opposite(attacker), square).intersect(board.silver))
      .union(goldAttacks(opposite(attacker), square).intersect(board.gold))
      .union(goldAttacks(opposite(attacker), square).intersect(board.tokin))
      .union(goldAttacks(opposite(attacker), square).intersect(board.promotedlance))
      .union(goldAttacks(opposite(attacker), square).intersect(board.promotedknight))
      .union(goldAttacks(opposite(attacker), square).intersect(board.promotedsilver))
      .union(horseAttacks(square, occupied).intersect(board.horse))
      .union(dragonAttacks(square, occupied).intersect(board.dragon))
      .union(kingAttacks(square).intersect(board.king))
      .union(pawnAttacks(opposite(attacker), square).intersect(board.pawn))
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
  // - static fromSetup()
  // - static promote()
  // - static unpromote()
  // - static promotable
  // - static handRoles
  // - Proper signature for clone()

  abstract dropDests(role: HandRole, ctx?: Context): SquareSet;
  abstract dests(square: Square, ctx?: Context): SquareSet;
  abstract isVariantEnd(): boolean;
  abstract variantOutcome(ctx?: Context): Outcome | undefined;
  abstract hasInsufficientMaterial(color: Color): boolean;

  abstract promotionZone(color: Color): SquareSet;
  abstract backrank(color: Color): SquareSet;

  protected kingAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    return attacksTo(square, attacker, this.board, occupied);
  }

  protected playCaptureAt(captured: Piece): void {
    const unpromotedRole = unpromote(captured.role);
    if (unpromotedRole !== 'king') this.hands[opposite(captured.color)][unpromotedRole]++;
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
      .intersect(this.board.rook)
      .union(bishopAttacks(king, SquareSet.empty()).intersect(this.board.bishop))
      .union(lanceAttacks(this.turn, king, SquareSet.empty()).intersect(this.board.lance))
      .union(horseAttacks(king, SquareSet.empty()).intersect(this.board.horse))
      .union(dragonAttacks(king, SquareSet.empty()).intersect(this.board.dragon))
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

  toSetup(): Setup {
    return {
      board: this.board.clone(),
      hands: this.hands.clone(),
      turn: this.turn,
      fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999),
    };
  }

  isInsufficientMaterial(): boolean {
    return COLORS.every(color => this.hasInsufficientMaterial(color));
  }

  hasDests(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    for (const square of this.board[this.turn]) {
      if (this.dests(square, ctx).nonEmpty()) return true;
    }
    for (const prole of HAND_ROLES) {
      if (this.hands[this.turn][prole] > 0 && this.dropDests(prole, ctx).nonEmpty()) return true;
    }
    return false;
  }

  isLegal(move: Move, ctx?: Context): boolean {
    if (isDrop(move)) {
      const role = move.role as HandRole;
      if (!defined(role) || this.hands[this.turn][role] <= 0) return false;
      return this.dropDests(role, ctx).has(move.to);
    } else {
      const piece = this.board.get(move.from);
      if (!piece) return false;

      // Checking whether we can promote
      if (move.promotion && !this.canPromote(piece, move.from, move.to)) return false;

      if (!move.promotion && this.pieceInDeadZone(piece)) return false;

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

  isImpasse(): boolean {
    const allPiecesInPromotionZone = SquareSet.promotionZone(this.turn).intersect(this.board[this.turn]);
    const majorPiecesInPromotionZone = allPiecesInPromotionZone.intersect(
      this.board.bishop.union(this.board.rook).union(this.board.horse).union(this.board.dragon)
    );
    const king = this.board.kingOf(this.turn);

    const impasseValue =
      allPiecesInPromotionZone.size() -
      1 +
      majorPiecesInPromotionZone.size() * 4 +
      this.hands[this.turn].count() +
      (this.hands[this.turn].bishop + this.hands[this.turn].rook) * 4;

    return (
      defined(king) &&
      allPiecesInPromotionZone.has(king) &&
      allPiecesInPromotionZone.size() > 10 &&
      impasseValue >= (this.turn === 'sente' ? 28 : 27)
    );
  }

  outcome(ctx?: Context): Outcome | undefined {
    const variantOutcome = this.variantOutcome(ctx);
    if (variantOutcome) return variantOutcome;
    ctx = ctx || this.ctx();
    if (this.isCheckmate(ctx) && !(this.lastMove && isDrop(this.lastMove) && this.lastMove.role === 'pawn'))
      return { winner: opposite(this.turn) };
    else if (this.isCheckmate(ctx) || this.isStalemate(ctx)) return { winner: this.turn };
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

  allDropDests(ctx?: Context): Map<HandRole, SquareSet> {
    ctx = ctx || this.ctx();
    const d = new Map();
    if (ctx.variantEnd) return d;
    for (const prole of HAND_ROLES) {
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
      const role = piece.role;
      if ((move.promotion && this.canPromote(piece, move.from, move.to)) || this.pieceInDeadZone(piece))
        piece.role = promote(role);

      const capture = this.board.set(move.to, piece);
      if (capture) this.playCaptureAt(capture);
    }
  }
}

export class Shogi extends Position {
  protected constructor(rules?: Rules) {
    super(rules || 'shogi');
  }

  static default(): Shogi {
    const pos = new this();
    pos.board = Board.default();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.fullmoves = 1;
    return pos;
  }

  static fromSetup(setup: Setup, strict = true): Result<Shogi, PositionError> {
    const pos = new this();
    pos.board = setup.board.clone();
    pos.hands = setup.hands;
    pos.turn = setup.turn;
    pos.fullmoves = setup.fullmoves;
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

    const b1 = this.board.pawn.union(this.board.lance);

    if (
      this.backrank('sente').intersect(b1.intersect(this.board['sente'])).nonEmpty() ||
      this.backrank('gote').intersect(b1.intersect(this.board['gote'])).nonEmpty() ||
      SquareSet.backrank2('sente').intersect(this.board.knight.intersect(this.board['sente'])).nonEmpty() ||
      SquareSet.backrank2('gote').intersect(this.board.knight.intersect(this.board['gote'])).nonEmpty()
    )
      return Result.err(new PositionError(IllegalSetup.InvalidPiecesPromotionZone));

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

  dropDests(role: HandRole, ctx?: Context): SquareSet {
    let mask = this.board.occupied.complement();
    ctx = ctx || this.ctx();
    // Removing backranks, where no legal moves would be possible
    if (role === 'pawn' || role === 'lance') mask = mask.diff(this.backrank(this.turn));
    if (role === 'knight') mask = mask.diff(SquareSet.backrank2(this.turn));

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
      const kingFront = (this.turn === 'sente' ? king.shr81(9) : king.shl81(9)).singleSquare();
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

    let pseudo;
    if (piece.role === 'pawn') pseudo = pawnAttacks(this.turn, square);
    else if (piece.role === 'lance') pseudo = lanceAttacks(this.turn, square, this.board.occupied);
    else if (piece.role === 'knight') pseudo = knightAttacks(this.turn, square);
    else if (piece.role === 'silver') pseudo = silverAttacks(this.turn, square);
    else if (
      piece.role === 'gold' ||
      piece.role === 'tokin' ||
      piece.role === 'promotedlance' ||
      piece.role === 'promotedknight' ||
      piece.role === 'promotedsilver'
    )
      pseudo = goldAttacks(this.turn, square);
    else if (piece.role === 'bishop') pseudo = bishopAttacks(square, this.board.occupied);
    else if (piece.role === 'rook') pseudo = rookAttacks(square, this.board.occupied);
    else if (piece.role === 'horse') pseudo = horseAttacks(square, this.board.occupied);
    else if (piece.role === 'dragon') pseudo = dragonAttacks(square, this.board.occupied);
    else pseudo = kingAttacks(square);

    pseudo = pseudo.diff(this.board[this.turn]);

    if (defined(ctx.king)) {
      if (piece.role === 'king') {
        const occ = this.board.occupied.without(square);
        for (const to of pseudo) {
          if (this.kingAttackers(to, opposite(this.turn), occ).nonEmpty()) pseudo = pseudo.without(to);
        }
        return pseudo;
      }

      if (ctx.checkers.nonEmpty()) {
        const checker = ctx.checkers.singleSquare();
        if (!defined(checker)) return SquareSet.empty();
        pseudo = pseudo.intersect(between(checker, ctx.king).with(checker));
      }

      if (ctx.blockers.has(square)) pseudo = pseudo.intersect(ray(square, ctx.king));
    }
    return pseudo;
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

  promotionZone(color: Color): SquareSet {
    return SquareSet.promotionZone(color);
  }

  backrank(color: Color): SquareSet {
    return SquareSet.backrank(color);
  }
}
