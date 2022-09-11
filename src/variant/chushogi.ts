import { Result } from '@badrap/result';
import {
  attacks,
  bishopAttacks,
  boarAttacks,
  chariotAttacks,
  copperAttacks,
  eagleAttacks,
  elephantAttacks,
  falconAttacks,
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
      rookAttacks(square, occupied)
        .intersect(
          board
            .role('rook')
            .union(board.role('promotedrook'))
            .union(board.role('dragon'))
            .union(board.role('promoteddragon'))
        )
        .union(
          bishopAttacks(square, occupied).intersect(
            board
              .role('bishop')
              .union(board.role('promotedbishop'))
              .union(board.role('horse'))
              .union(board.role('promotedhorse'))
          )
        )
        .union(
          elephantAttacks(square, defender).intersect(board.role('elephant').union(board.role('promotedelephant')))
        )
        .union(
          sideMoverAttacks(square, occupied).intersect(board.role('sidemover').union(board.role('promotedsidemover')))
        )
        .union(falconAttacks(square, defender, occupied).intersect(board.role('falcon')))
        .union(eagleAttacks(square, defender, occupied).intersect(board.role('eagle')))
        .union(boarAttacks(square, occupied).intersect(board.role('boar')))
        .union(
          verticalMoverAttacks(square, occupied).intersect(
            board.role('verticalmover').union(board.role('promotedverticalmover'))
          )
        )
        .union(oxAttacks(square, occupied).intersect(board.role('ox')))
        .union(goldAttacks(square, defender).intersect(board.role('gold').union(board.role('tokin'))))
        .union(silverAttacks(square, defender).intersect(board.role('silver')))
        .union(lionAttacks(square).intersect(board.role('lion').union(board.role('promotedlion'))))
        .union(queenAttacks(square, occupied).intersect(board.role('queen').union(board.role('promotedqueen'))))
        .union(chariotAttacks(square, occupied).intersect(board.role('chariot')))
        .union(whaleAttacks(square, defender, occupied).intersect(board.role('whale')))
        .union(tigerAttacks(square, defender).intersect(board.role('tiger')))
        .union(kirinAttacks(square).intersect(board.role('kirin')))
        .union(phoenixAttacks(square).intersect(board.role('phoenix')))
        .union(lanceAttacks(square, defender, occupied).intersect(board.role('lance')))
        .union(whiteHorseAttacks(square, defender, occupied).intersect(board.role('whitehorse')))
        .union(leopardAttacks(square).intersect(board.role('leopard')))
        .union(stagAttacks(square, occupied).intersect(board.role('stag')))
        .union(copperAttacks(square, defender).intersect(board.role('copper')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
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

    return attacks(piece, square, this.board.occupied).diff(this.board.color(this.turn)).intersect(this.fullSquareSet);
  }

  dropDests(_piece: Piece, _ctx?: Context): SquareSet {
    return SquareSet.empty();
  }

  hasInsufficientMaterial(_color: Color): boolean {
    return false;
  }
}
