import { Result } from '@badrap/result';
import {
  attacks,
  between,
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
  queenAttacks,
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
import { SquareSet } from '../squareSet.js';
import { Color, Piece, Role, Square } from '../types.js';
import { defined, opposite } from '../util.js';
import { Context, Position, PositionError } from './position.js';
import { fullSquareSet } from './util.js';

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

  static from(
    board: Board,
    hands: Hands,
    turn: Color,
    moveNumber: number,
    strict: boolean
  ): Result<Chushogi, PositionError> {
    const pos = new this();
    pos.board = board.clone();
    pos.hands = hands.clone();
    pos.turn = turn;
    pos.moveNumber = moveNumber;
    return pos.validate(strict).map(_ => pos);
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
        .union(goldAttacks(square, defender).intersect(board.roles('gold', 'tokin')))
        .union(
          kingAttacks(square).intersect(
            board.roles('king', 'prince', 'dragon', 'promoteddragon', 'horse', 'promotedhorse')
          )
        )
        .union(elephantAttacks(square, defender).intersect(board.roles('elephant', 'promotedelephant')))
        .union(chariotAttacks(square, occupied).intersect(board.role('chariot')))
        .union(
          bishopAttacks(square, occupied).intersect(board.roles('bishop', 'promotedbishop', 'horse', 'promotedhorse'))
        )
        .union(tigerAttacks(square, defender).intersect(board.role('tiger')))
        .union(kirinAttacks(square).intersect(board.role('kirin')))
        .union(phoenixAttacks(square).intersect(board.role('phoenix')))
        .union(sideMoverAttacks(square, occupied).intersect(board.roles('sidemover', 'promotedsidemover')))
        .union(verticalMoverAttacks(square, occupied).intersect(board.roles('verticalmover', 'promotedverticalmover')))
        .union(rookAttacks(square, occupied).intersect(board.roles('rook', 'promotedrook', 'dragon', 'promoteddragon')))
        .union(lionAttacks(square).intersect(board.roles('lion', 'promotedlion')))
        .union(queenAttacks(square, occupied).intersect(board.roles('queen', 'promotedqueen')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(goBetweenAttacks(square).intersect(board.role('gobetween')))
        .union(whiteHorseAttacks(square, defender, occupied).intersect(board.role('whitehorse')))
        .union(whaleAttacks(square, defender, occupied).intersect(board.role('whale')))
        .union(stagAttacks(square, occupied).intersect(board.role('stag')))
        .union(boarAttacks(square, occupied).intersect(board.role('boar')))
        .union(oxAttacks(square, occupied).intersect(board.role('ox')))
        .union(falconAttacks(square, defender, occupied).intersect(board.role('falcon')))
        .union(eagleAttacks(square, defender, occupied).intersect(board.role('eagle')))
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

    let pseudoDests = attacks(piece, square, this.board.occupied)
      .diff(this.board.color(ctx.color))
      .intersect(fullSquareSet(this.rules));

    const oppColor = opposite(ctx.color),
      oppLions = this.board.color(oppColor).intersect(this.board.roles('lion', 'promotedlion'));

    // considers only the first step destinations, for second step - secondLionStepDests
    if (piece.role === 'lion' || piece.role === 'promotedlion') {
      const neighbors = kingAttacks(square);
      // don't allow capture of a non-adjacent lion protected by an enemy piece
      for (const lion of pseudoDests.diff(neighbors).intersect(oppLions)) {
        if (this.squareAttackers(lion, oppColor, this.board.occupied.without(square)).nonEmpty())
          pseudoDests = pseudoDests.without(lion);
      }
    } else if (this.lastCapture && (this.lastCapture.role === 'lion' || this.lastCapture.role === 'promotedlion')) {
      const lastDest = this.lastMove?.to;
      // can't recapture lion on another square
      for (const lion of oppLions.intersect(pseudoDests)) {
        if (lion !== lastDest) pseudoDests = pseudoDests.without(lion);
      }
    }

    return pseudoDests;
  }

  dropDests(_piece: Piece, _ctx?: Context): SquareSet {
    return SquareSet.empty();
  }

  isCheckmate(ctx?: Context): boolean {
    ctx = ctx || this.ctx();
    const royal = this.kingsOf(ctx.color).singleSquare(), // undefined if more royal pieces are present
      color = ctx.color,
      checkers = ctx.checkers;
    if (!defined(royal)) return false;

    const canRoyalEscape = () => {
      // can royal escape
      let royalDests = kingAttacks(royal);
      const occ = this.board.occupied.without(royal);
      for (const to of royalDests) {
        if (this.squareAttackers(to, opposite(color), occ).nonEmpty()) royalDests = royalDests.without(to);
      }
      if (royalDests.nonEmpty()) return true;

      // can another piece block the check
      const checker = checkers.singleSquare();
      if (defined(checker)) {
        for (const square of this.board.color(color).without(royal)) {
          if (this.moveDests(square, ctx).intersect(between(checker, royal).with(checker)).nonEmpty()) {
            return true;
          }
        }
      }
      return false;
    };

    return ctx.checkers.nonEmpty() && canRoyalEscape();
  }
}

const chushogiBoard = (): Board => {
  const occupied = new SquareSet([0xaf50fff, 0xfff0fff, 0x108, 0x1080000, 0xfff0fff, 0xfff0af5, 0x0, 0x0]);
  const colorMap: [Color, SquareSet][] = [
    ['sente', new SquareSet([0x0, 0x0, 0x0, 0x1080000, 0xfff0fff, 0xfff0af5, 0x0, 0x0])],
    ['gote', new SquareSet([0xaf50fff, 0xfff0fff, 0x108, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  const roleMap: [Role, SquareSet][] = [
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
  return Board.from(occupied, colorMap, roleMap);
};

// expects position before piece moves to it's first destination
export function secondLionStepDests(before: Chushogi, initialSq: Square, midSq: Square): SquareSet {
  const piece = before.board.get(initialSq);
  if (!piece || piece.color !== before.turn) return SquareSet.empty();

  if (piece.role === 'lion' || piece.role === 'promotedlion') {
    if (!kingAttacks(initialSq).has(midSq)) return SquareSet.empty();
    let pseudoDests = kingAttacks(midSq)
      .diff(before.board.color(before.turn).without(initialSq))
      .intersect(fullSquareSet(before.rules));
    const oppColor = opposite(before.turn),
      oppLions = before.board.color(oppColor).intersect(before.board.roles('lion', 'promotedlion')),
      capture = before.board.get(midSq),
      clearOccupied = before.board.occupied.withoutMany([initialSq, midSq]);

    // can't capture lion protected by an enemy piece, unless we captured something valuable first (not a pawn or go-between)
    for (const lion of oppLions.intersect(pseudoDests)) {
      const lionProtected = before.squareAttackers(lion, oppColor, clearOccupied).nonEmpty();
      if (lionProtected && (!capture || capture.role === 'pawn' || capture.role === 'gobetween'))
        pseudoDests = pseudoDests.without(lion);
    }
    return pseudoDests;
  } else if (piece.role === 'falcon') {
    if (!pawnAttacks(initialSq, piece.color).has(midSq)) return SquareSet.empty();

    return goBetweenAttacks(midSq)
      .diff(before.board.color(before.turn).without(initialSq))
      .intersect(fullSquareSet(before.rules));
  } else if (piece.role === 'eagle') {
    const pseudoDests = eagleLionAttacks(initialSq, piece.color)
      .diff(before.board.color(before.turn))
      .intersect(fullSquareSet(before.rules));
    if (!pseudoDests.has(midSq)) return SquareSet.empty();

    return pseudoDests.intersect(kingAttacks(midSq)).with(initialSq);
  } else return SquareSet.empty();
}
