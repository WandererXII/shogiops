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
import { Color, Piece, Square } from '../types.js';
import { opposite } from '../util.js';
import { Context, Position, PositionError } from './position.js';

export class Chushogi extends Position {
  private constructor() {
    super('chushogi');
    this.fullSquareSet = new SquareSet([0xfff0fff, 0xfff0fff, 0xfff0fff, 0xfff0fff, 0xfff0fff, 0xfff0fff, 0x0, 0x0]);
  }

  static default(): Chushogi {
    const pos = new this();
    pos.board = Board.chushogi();
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
        .union(goldAttacks(square, defender).intersect(board.role('gold').union(board.role('tokin'))))
        .union(
          kingAttacks(square).intersect(
            board
              .role('king')
              .union(board.role('prince'))
              .union(board.role('dragon'))
              .union(board.role('promoteddragon'))
              .union(board.role('horse'))
              .union(board.role('promotedhorse'))
          )
        )
        .union(
          elephantAttacks(square, defender).intersect(board.role('elephant').union(board.role('promotedelephant')))
        )
        .union(chariotAttacks(square, occupied).intersect(board.role('chariot')))
        .union(
          bishopAttacks(square, occupied).intersect(
            board
              .role('bishop')
              .union(board.role('promotedbishop'))
              .union(board.role('horse'))
              .union(board.role('promotedhorse'))
          )
        )
        .union(tigerAttacks(square, defender).intersect(board.role('tiger')))
        .union(kirinAttacks(square).intersect(board.role('kirin')))
        .union(phoenixAttacks(square).intersect(board.role('phoenix')))
        .union(
          sideMoverAttacks(square, occupied).intersect(board.role('sidemover').union(board.role('promotedsidemover')))
        )
        .union(
          verticalMoverAttacks(square, occupied).intersect(
            board.role('verticalmover').union(board.role('promotedverticalmover'))
          )
        )
        .union(
          rookAttacks(square, occupied).intersect(
            board
              .role('rook')
              .union(board.role('promotedrook'))
              .union(board.role('dragon'))
              .union(board.role('promoteddragon'))
          )
        )
        .union(lionAttacks(square).intersect(board.role('lion').union(board.role('promotedlion'))))
        .union(queenAttacks(square, occupied).intersect(board.role('queen').union(board.role('promotedqueen'))))
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

  moveDests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    const piece = this.board.get(square);
    if (!piece || piece.color !== this.turn) return SquareSet.empty();

    let pseudoDests = attacks(piece, square, this.board.occupied)
      .diff(this.board.color(this.turn))
      .intersect(this.fullSquareSet);

    const oppColor = opposite(this.turn),
      oppLions = this.board.color(oppColor).intersect(this.board.role('lion').union(this.board.role('promotedlion')));

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

  hasInsufficientMaterial(_color: Color): boolean {
    return false;
  }
}

// expects position before piece moves to it's first destination
export function secondLionStepDests(before: Chushogi, initialSq: Square, midSq: Square): SquareSet {
  const piece = before.board.get(initialSq);
  if (!piece || piece.color !== before.turn) return SquareSet.empty();

  if (piece.role === 'lion' || piece.role === 'promotedlion') {
    if (!kingAttacks(initialSq).has(midSq)) return SquareSet.empty();
    let pseudoDests = kingAttacks(midSq)
      .diff(before.board.color(before.turn).without(initialSq))
      .intersect(before.fullSquareSet);
    const oppColor = opposite(before.turn),
      oppLions = before.board
        .color(oppColor)
        .intersect(before.board.role('lion').union(before.board.role('promotedlion'))),
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
      .intersect(before.fullSquareSet);
  } else if (piece.role === 'eagle') {
    const pseudoDests = eagleLionAttacks(initialSq, piece.color)
      .diff(before.board.color(before.turn))
      .intersect(before.fullSquareSet);
    if (!pseudoDests.has(midSq)) return SquareSet.empty();

    return pseudoDests.intersect(kingAttacks(midSq)).with(initialSq);
  } else return SquareSet.empty();
}
