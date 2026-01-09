import type { Result } from '@badrap/result';
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
import { SquareSet } from '../square-set.js';
import type { Color, MoveOrDrop, Outcome, Piece, Setup, Square } from '../types.js';
import { defined, isMove, lionRoles, opposite, squareDist } from '../util.js';
import type { Context } from './position.js';
import { Position, type PositionError } from './position.js';
import { dimensions, fullSquareSet } from './util.js';

export class Chushogi extends Position {
  private constructor() {
    super('chushogi');
  }

  static from(setup: Setup, strict: boolean): Result<Chushogi, PositionError> {
    const pos = new Chushogi();
    pos.fromSetup(setup);
    return pos.validate(strict).map((_) => pos);
  }

  validation = {
    doublePawn: false,
    oppositeCheck: false,
    unpromotedForcedPromotion: false,
    maxNumberOfRoyalPieces: 2,
  };

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const defender = opposite(attacker);
    const board = this.board;
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

    const oppColor = opposite(ctx.color);
    const oppLions = this.board.color(oppColor).intersect(this.board.roles('lion', 'lionpromoted'));

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

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();
    if (this.kingsOf(ctx.color).isEmpty())
      return {
        result: 'kingsLost',
        winner: opposite(ctx.color),
      };
    else if (!this.hasDests(ctx)) {
      return {
        result: 'stalemate',
        winner: opposite(ctx.color),
      };
    } else if (isBareKing(this, 'sente')) {
      return {
        result: 'bareKing',
        winner: 'gote',
      };
    } else if (isBareKing(this, 'gote')) {
      return {
        result: 'bareKing',
        winner: 'sente',
      };
    } else if (isDraw(this)) {
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

// chushogi position before piece is moved from initial square
export function secondLionStepDests(before: Chushogi, initialSq: Square, midSq: Square): SquareSet {
  const piece = before.board.get(initialSq);
  if (!piece || piece.color !== before.turn) return SquareSet.empty();

  if (lionRoles.includes(piece.role)) {
    if (!kingAttacks(initialSq).has(midSq)) return SquareSet.empty();
    let pseudoDests = kingAttacks(midSq)
      .diff(before.board.color(before.turn).without(initialSq))
      .intersect(fullSquareSet(before.rules));
    const oppColor = opposite(before.turn);
    const oppLions = before.board
      .color(oppColor)
      .intersect(before.board.roles('lion', 'lionpromoted'))
      .intersect(pseudoDests);
    const capture = before.board.get(midSq);
    const clearOccupied = before.board.occupied.withoutMany(initialSq, midSq);

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
  const oppColor = opposite(pos.turn);
  const oppLions = pos.board
    .color(oppColor)
    .intersect(pos.board.roles('lion', 'lionpromoted'))
    .intersect(dests);
  for (const lion of oppLions) {
    if (lion !== pos.lastLionCapture) dests = dests.without(lion);
  }
  return dests;
}

function isBareKing(pos: Chushogi, color: Color): boolean {
  // was our king bared
  const theirColor = opposite(color);
  const ourKing = pos.kingsOf(color).singleSquare();
  const ourPieces = pos.board
    .color(color)
    .diff(
      pos.board
        .roles('pawn', 'lance')
        .intersect(SquareSet.fromRank(color === 'sente' ? 0 : dimensions(pos.rules).ranks - 1)),
    );
  const theirKing = pos.kingsOf(theirColor).singleSquare();
  const theirPieces = pos.board
    .color(theirColor)
    .diff(
      pos.board
        .roles('pawn', 'gobetween')
        .union(
          pos.board
            .role('lance')
            .intersect(
              SquareSet.fromRank(theirColor === 'sente' ? 0 : dimensions(pos.rules).ranks - 1),
            ),
        ),
    );

  return (
    ourPieces.size() === 1 &&
    defined(ourKing) &&
    theirPieces.size() > 1 &&
    defined(theirKing) &&
    !pos.isCheck(theirColor) &&
    (theirPieces.size() > 2 || kingAttacks(ourKing).intersect(theirPieces).isEmpty())
  );
}

function isDraw(pos: Chushogi): boolean {
  const oneWayRoles = pos.board.roles('pawn', 'lance');
  const occ = pos.board.occupied.diff(
    oneWayRoles
      .intersect(pos.board.color('sente').intersect(SquareSet.fromRank(0)))
      .union(
        oneWayRoles.intersect(
          pos.board.color('gote').intersect(SquareSet.fromRank(dimensions(pos.rules).ranks - 1)),
        ),
      ),
  );
  return (
    occ.size() === 2 &&
    pos.kingsOf('sente').isSingleSquare() &&
    !pos.isCheck('sente') &&
    pos.kingsOf('gote').isSingleSquare() &&
    !pos.isCheck('gote')
  );
}
