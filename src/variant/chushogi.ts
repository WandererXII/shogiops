import { Result } from '@badrap/result';
import {
  attacks,
  bishopAttacks,
  boarAttacks,
  chariotAttacks,
  copperAttacks,
  eagleAttacks,
  eagleLionAttacks,
  elephantAttacks,
  falconAttacks,
  goBetweenAttacks,
  goldAttacks,
  kingAttacks,
  kirinAttacks,
  lanceAttacks,
  leopardAttacks,
  lionAttacks,
  oxAttacks,
  pawnAttacks,
  phoenixAttacks,
  rookAttacks,
  sideMoverAttacks,
  silverAttacks,
  stagAttacks,
  tigerAttacks,
  verticalMoverAttacks,
  whaleAttacks,
  whiteHorseAttacks,
} from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../square-set.js';
import type { Color, MoveOrDrop, Outcome, Piece, Role, Setup, Square } from '../types.js';
import { defined, isMove, lionRoles, opposite, squareDist } from '../util.js';
import type { Context } from './position.js';
import { IllegalSetup, Position, PositionError } from './position.js';
import { allRoles, dimensions, fullSquareSet } from './util.js';

export class Chushogi extends Position {
  private constructor() {
    super('chushogi');
  }

  static default(): Chushogi {
    const pos = new this();
    pos.board = chushogiBoard();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static from(setup: Setup, strict: boolean): Result<Chushogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map((_) => pos);
  }

  validate(strict: boolean): Result<undefined, PositionError> {
    if (!this.board.occupied.intersect(fullSquareSet(this.rules)).equals(this.board.occupied))
      return Result.err(new PositionError(IllegalSetup.PiecesOutsideBoard));

    if (this.hands.count() > 0)
      return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));

    for (const role of this.board.presentRoles())
      if (!allRoles(this.rules).includes(role))
        return Result.err(new PositionError(IllegalSetup.InvalidPieces));

    if (!strict) return Result.ok(undefined);

    if (
      this.board.pieces('sente', 'king').size() >= 2 ||
      this.board.pieces('gote', 'king').size() >= 2 ||
      this.board.pieces('sente', 'prince').size() >= 2 ||
      this.board.pieces('gote', 'prince').size() >= 2
    )
      return Result.err(new PositionError(IllegalSetup.Kings));

    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    if (this.kingsOf('sente').isEmpty() || this.kingsOf('gote').isEmpty())
      return Result.err(new PositionError(IllegalSetup.Kings));

    return Result.ok(undefined);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker),
      board = this.board;
    return board.color(attacker).intersect(
      lanceAttacks(square, defender, occupied)
        .intersect(board.role('lance'))
        .union(leopardAttacks(square).intersect(board.role('leopard')))
        .union(copperAttacks(square, defender).intersect(board.role('copper')))
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(goldAttacks(square, defender).intersect(board.roles('gold', 'promotedpawn')))
        .union(
          kingAttacks(square).intersect(
            board.roles('king', 'prince', 'dragon', 'dragonpromoted', 'horse', 'horsepromoted'),
          ),
        )
        .union(
          elephantAttacks(square, defender).intersect(board.roles('elephant', 'elephantpromoted')),
        )
        .union(chariotAttacks(square, occupied).intersect(board.role('chariot')))
        .union(
          bishopAttacks(square, occupied).intersect(
            board.roles(
              'bishop',
              'bishoppromoted',
              'horse',
              'horsepromoted',
              'queen',
              'queenpromoted',
            ),
          ),
        )
        .union(tigerAttacks(square, defender).intersect(board.role('tiger')))
        .union(kirinAttacks(square).intersect(board.role('kirin')))
        .union(phoenixAttacks(square).intersect(board.role('phoenix')))
        .union(
          sideMoverAttacks(square, occupied).intersect(
            board.roles('sidemover', 'sidemoverpromoted'),
          ),
        )
        .union(
          verticalMoverAttacks(square, occupied).intersect(
            board.roles('verticalmover', 'verticalmoverpromoted'),
          ),
        )
        .union(
          rookAttacks(square, occupied).intersect(
            board.roles(
              'rook',
              'rookpromoted',
              'dragon',
              'dragonpromoted',
              'queen',
              'queenpromoted',
            ),
          ),
        )
        .union(lionAttacks(square).intersect(board.roles('lion', 'lionpromoted')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(goBetweenAttacks(square).intersect(board.role('gobetween')))
        .union(whiteHorseAttacks(square, defender, occupied).intersect(board.role('whitehorse')))
        .union(whaleAttacks(square, defender, occupied).intersect(board.role('whale')))
        .union(stagAttacks(square, occupied).intersect(board.role('stag')))
        .union(boarAttacks(square, occupied).intersect(board.role('boar')))
        .union(oxAttacks(square, occupied).intersect(board.role('ox')))
        .union(falconAttacks(square, defender, occupied).intersect(board.role('falcon')))
        .union(eagleAttacks(square, defender, occupied).intersect(board.role('eagle'))),
    );
  }

  // we can move into check - not needed
  squareSnipers(_square: number, _attacker: Color): SquareSet {
    return SquareSet.empty();
  }

  kingsOf(color: Color): SquareSet {
    return this.board.roles('king', 'prince').intersect(this.board.color(color));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    const piece = this.board.get(square);
    if (!piece || piece.color !== ctx.color) return SquareSet.empty();

    let pseudo = attacks(piece, square, this.board.occupied).diff(this.board.color(ctx.color));

    const oppColor = opposite(ctx.color),
      oppLions = this.board.color(oppColor).intersect(this.board.roles('lion', 'lionpromoted'));

    // considers only the first step destinations, for second step - secondLionStepDests
    if (lionRoles.includes(piece.role)) {
      const neighbors = kingAttacks(square);
      // don't allow capture of a non-adjacent lion protected by an enemy piece
      for (const lion of pseudo.diff(neighbors).intersect(oppLions)) {
        if (this.squareAttackers(lion, oppColor, this.board.occupied.without(square)).nonEmpty())
          pseudo = pseudo.without(lion);
      }
    } else if (defined(this.lastLionCapture)) {
      // can't recapture lion on another square (allow capturing lion on the same square from kirin promotion)
      for (const lion of oppLions.intersect(pseudo)) {
        if (lion !== this.lastLionCapture) pseudo = pseudo.without(lion);
      }
    }

    return pseudo.intersect(fullSquareSet(this.rules));
  }

  dropDests(_piece: Piece, _ctx?: Context): SquareSet {
    return SquareSet.empty();
  }

  isCheckmate(_ctx?: Context): boolean {
    return false;
  }

  isStalemate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    return !this.hasDests(ctx);
  }

  isDraw(_ctx?: Context): boolean {
    const oneWayRoles = this.board.roles('pawn', 'lance'),
      occ = this.board.occupied.diff(
        oneWayRoles
          .intersect(this.board.color('sente').intersect(SquareSet.fromRank(0)))
          .union(
            oneWayRoles.intersect(
              this.board
                .color('gote')
                .intersect(SquareSet.fromRank(dimensions(this.rules).ranks - 1)),
            ),
          ),
      );
    return (
      occ.size() === 2 &&
      this.kingsOf('sente').isSingleSquare() &&
      !this.isCheck('sente') &&
      this.kingsOf('gote').isSingleSquare() &&
      !this.isCheck('gote')
    );
  }

  isBareKing(ctx?: Context): boolean {
    if (ctx) {
      // was our king bared
      const color = ctx.color,
        theirColor = opposite(color),
        ourKing = this.kingsOf(color).singleSquare(),
        ourPieces = this.board
          .color(color)
          .diff(
            this.board
              .roles('pawn', 'lance')
              .intersect(
                SquareSet.fromRank(color === 'sente' ? 0 : dimensions(this.rules).ranks - 1),
              ),
          ),
        theirKing = this.kingsOf(theirColor).singleSquare(),
        theirPieces = this.board
          .color(theirColor)
          .diff(
            this.board
              .roles('pawn', 'gobetween')
              .union(
                this.board
                  .role('lance')
                  .intersect(
                    SquareSet.fromRank(
                      theirColor === 'sente' ? 0 : dimensions(this.rules).ranks - 1,
                    ),
                  ),
              ),
          );

      return (
        ourPieces.size() === 1 &&
        defined(ourKing) &&
        theirPieces.size() > 1 &&
        defined(theirKing) &&
        !this.isCheck(theirColor) &&
        (theirPieces.size() > 2 || kingAttacks(ourKing).intersect(theirPieces).isEmpty())
      );
    } else
      return this.isBareKing(this.ctx(this.turn)) || this.isBareKing(this.ctx(opposite(this.turn)));
  }

  isWithoutKings(ctx?: Context): boolean {
    const color = ctx?.color || this.turn;
    return this.kingsOf(color).isEmpty();
  }

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();
    if (this.isWithoutKings(ctx))
      return {
        result: 'kingslost',
        winner: opposite(ctx.color),
      };
    else if (this.isStalemate(ctx)) {
      return {
        result: 'stalemate',
        winner: opposite(ctx.color),
      };
    } else if (this.isBareKing(ctx)) {
      return {
        result: 'bareking',
        winner: opposite(ctx.color),
      };
    } else if (this.isBareKing(this.ctx(opposite(ctx.color)))) {
      return {
        result: 'bareking',
        winner: ctx.color,
      };
    } else if (this.isDraw(ctx)) {
      return {
        result: 'draw',
        winner: undefined,
      };
    } else return;
  }

  isLegal(md: MoveOrDrop, ctx?: Context): boolean {
    return (
      isMove(md) &&
      ((!defined(md.midStep) && super.isLegal(md, ctx)) ||
        (defined(md.midStep) &&
          super.isLegal({ from: md.from, to: md.midStep }, ctx) &&
          secondLionStepDests(this, md.from, md.midStep).has(md.to)))
    );
  }
}

const chushogiBoard = (): Board => {
  const occupied = new SquareSet([
    0xaf50fff, 0xfff0fff, 0x108, 0x1080000, 0xfff0fff, 0xfff0af5, 0x0, 0x0,
  ]);
  const colorIter: [Color, SquareSet][] = [
    ['sente', new SquareSet([0x0, 0x0, 0x0, 0x1080000, 0xfff0fff, 0xfff0af5, 0x0, 0x0])],
    ['gote', new SquareSet([0xaf50fff, 0xfff0fff, 0x108, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  const roleIter: [Role, SquareSet][] = [
    ['lance', new SquareSet([0x801, 0x0, 0x0, 0x0, 0x0, 0x8010000, 0x0, 0x0])],
    ['leopard', new SquareSet([0x402, 0x0, 0x0, 0x0, 0x0, 0x4020000, 0x0, 0x0])],
    ['copper', new SquareSet([0x204, 0x0, 0x0, 0x0, 0x0, 0x2040000, 0x0, 0x0])],
    ['silver', new SquareSet([0x108, 0x0, 0x0, 0x0, 0x0, 0x1080000, 0x0, 0x0])],
    ['gold', new SquareSet([0x90, 0x0, 0x0, 0x0, 0x0, 0x900000, 0x0, 0x0])],
    ['elephant', new SquareSet([0x40, 0x0, 0x0, 0x0, 0x0, 0x200000, 0x0, 0x0])],
    ['king', new SquareSet([0x20, 0x0, 0x0, 0x0, 0x0, 0x400000, 0x0, 0x0])],
    ['chariot', new SquareSet([0x8010000, 0x0, 0x0, 0x0, 0x0, 0x801, 0x0, 0x0])],
    ['bishop', new SquareSet([0x2040000, 0x0, 0x0, 0x0, 0x0, 0x204, 0x0, 0x0])],
    ['tiger', new SquareSet([0x900000, 0x0, 0x0, 0x0, 0x0, 0x90, 0x0, 0x0])],
    ['phoenix', new SquareSet([0x400000, 0x0, 0x0, 0x0, 0x0, 0x20, 0x0, 0x0])],
    ['kirin', new SquareSet([0x200000, 0x0, 0x0, 0x0, 0x0, 0x40, 0x0, 0x0])],
    ['sidemover', new SquareSet([0x0, 0x801, 0x0, 0x0, 0x8010000, 0x0, 0x0, 0x0])],
    ['verticalmover', new SquareSet([0x0, 0x402, 0x0, 0x0, 0x4020000, 0x0, 0x0, 0x0])],
    ['rook', new SquareSet([0x0, 0x204, 0x0, 0x0, 0x2040000, 0x0, 0x0, 0x0])],
    ['horse', new SquareSet([0x0, 0x108, 0x0, 0x0, 0x1080000, 0x0, 0x0, 0x0])],
    ['dragon', new SquareSet([0x0, 0x90, 0x0, 0x0, 0x900000, 0x0, 0x0, 0x0])],
    ['queen', new SquareSet([0x0, 0x40, 0x0, 0x0, 0x200000, 0x0, 0x0, 0x0])],
    ['lion', new SquareSet([0x0, 0x20, 0x0, 0x0, 0x400000, 0x0, 0x0, 0x0])],
    ['pawn', new SquareSet([0x0, 0xfff0000, 0x0, 0x0, 0xfff, 0x0, 0x0, 0x0])],
    ['gobetween', new SquareSet([0x0, 0x0, 0x108, 0x1080000, 0x0, 0x0, 0x0, 0x0])],
  ];
  return Board.from(occupied, colorIter, roleIter);
};

// chushogi position before piece is moved from initial square
export function secondLionStepDests(before: Chushogi, initialSq: Square, midSq: Square): SquareSet {
  const piece = before.board.get(initialSq);
  if (!piece || piece.color !== before.turn) return SquareSet.empty();

  if (lionRoles.includes(piece.role)) {
    if (!kingAttacks(initialSq).has(midSq)) return SquareSet.empty();
    let pseudoDests = kingAttacks(midSq)
      .diff(before.board.color(before.turn).without(initialSq))
      .intersect(fullSquareSet(before.rules));
    const oppColor = opposite(before.turn),
      oppLions = before.board
        .color(oppColor)
        .intersect(before.board.roles('lion', 'lionpromoted'))
        .intersect(pseudoDests),
      capture = before.board.get(midSq),
      clearOccupied = before.board.occupied.withoutMany(initialSq, midSq);

    // can't capture a non-adjacent lion protected by an enemy piece,
    // unless we captured something valuable first (not a pawn or go-between)
    for (const lion of oppLions) {
      if (
        squareDist(initialSq, lion) > 1 &&
        before.squareAttackers(lion, oppColor, clearOccupied).nonEmpty() &&
        (!capture || capture.role === 'pawn' || capture.role === 'gobetween')
      )
        pseudoDests = pseudoDests.without(lion);
    }
    return pseudoDests;
  } else if (piece.role === 'falcon') {
    if (!pawnAttacks(initialSq, piece.color).has(midSq)) return SquareSet.empty();

    let pseudoDests = goBetweenAttacks(midSq)
      .diff(before.board.color(before.turn).without(initialSq))
      .intersect(fullSquareSet(before.rules));

    if (defined(before.lastLionCapture)) pseudoDests = removeLions(before, pseudoDests);

    return pseudoDests;
  } else if (piece.role === 'eagle') {
    let pseudoDests = eagleLionAttacks(initialSq, piece.color)
      .diff(before.board.color(before.turn))
      .with(initialSq);
    if (!pseudoDests.has(midSq) || squareDist(initialSq, midSq) > 1) return SquareSet.empty();

    pseudoDests = pseudoDests.intersect(kingAttacks(midSq)).intersect(fullSquareSet(before.rules));
    if (defined(before.lastLionCapture)) pseudoDests = removeLions(before, pseudoDests);

    return pseudoDests;
  } else return SquareSet.empty();
}

function removeLions(pos: Chushogi, dests: SquareSet): SquareSet {
  const oppColor = opposite(pos.turn),
    oppLions = pos.board
      .color(oppColor)
      .intersect(pos.board.roles('lion', 'lionpromoted'))
      .intersect(dests);
  for (const lion of oppLions) {
    if (lion !== pos.lastLionCapture) dests = dests.without(lion);
  }
  return dests;
}
