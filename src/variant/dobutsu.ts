import type { Result } from '@badrap/result';
import { attacks, goldAttacks, kingAttacks, pawnAttacks } from '../attacks.js';
import { SquareSet } from '../square-set.js';
import type { Color, Outcome, Piece, Setup, Square } from '../types.js';
import { defined, opposite } from '../util.js';
import type { Context, PositionError } from './position.js';
import { Position } from './position.js';
import { fullSquareSet, promotionZone } from './util.js';

export class Dobutsu extends Position {
  private constructor() {
    super('dobutsu');
  }

  static from(setup: Setup, strict: boolean): Result<Dobutsu, PositionError> {
    const pos = new Dobutsu();
    pos.fromSetup(setup);
    return pos.validate(strict).map((_) => pos);
  }

  validation = {
    doublePawn: false,
    oppositeCheck: false,
    unpromotedForcedPromotion: false,
    maxNumberOfRoyalPieces: 1,
  };

  squareAttackers(square: Square, attacker: Color, _occupied: SquareSet): SquareSet {
    const defender = opposite(attacker);
    const board = this.board;
    return board.color(attacker).intersect(
      limitedAttacks({ role: 'rook', color: attacker }, square)
        .intersect(board.roles('rook'))
        .union(
          limitedAttacks({ role: 'bishop', color: attacker }, square).intersect(
            board.roles('bishop'),
          ),
        )
        .union(goldAttacks(square, defender).intersect(board.roles('tokin')))
        .union(pawnAttacks(square, defender).intersect(board.role('pawn')))
        .union(kingAttacks(square).intersect(board.roles('king'))),
    );
  }

  squareSnipers(_square: number, _attacker: Color): SquareSet {
    return SquareSet.empty();
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();

    const piece = this.board.get(square);
    if (!piece || piece.color !== ctx.color) return SquareSet.empty();

    let pseudo = limitedAttacks(piece, square).intersect(fullSquareSet(this.rules));
    pseudo = pseudo.diff(this.board.color(ctx.color));

    return pseudo.intersect(fullSquareSet(this.rules));
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();

    if (piece.color !== ctx.color) return SquareSet.empty();
    return this.board.occupied.complement().intersect(fullSquareSet(this.rules));
  }

  outcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();

    if (this.kingsOf(ctx.color).isEmpty()) {
      return {
        result: 'kingsLost',
        winner: opposite(ctx.color),
      };
    }

    const isTryRule = (color: Color): boolean => {
      const king = this.kingsOf(color).singleSquare();
      return defined(king) && promotionZone(this.rules)(color).has(king) && !this.isCheck(color);
    };

    const senteTryRule = isTryRule('sente');
    const goteTryRule = isTryRule('gote');
    if (senteTryRule && !goteTryRule) {
      return {
        result: 'tryRule',
        winner: 'sente',
      };
    } else if (goteTryRule && !senteTryRule) {
      return {
        result: 'tryRule',
        winner: 'gote',
      };
    } else if (!this.hasDests()) {
      return {
        result: 'stalemate',
        winner: opposite(ctx.color),
      };
    }

    return undefined;
  }
}

function limitedAttacks(piece: Piece, square: Square): SquareSet {
  switch (piece.role) {
    case 'bishop':
      return kingAttacks(square).withoutMany(square - 16, square + 16, square - 1, square + 1);
    case 'rook':
      return kingAttacks(square).withoutMany(square - 15, square - 17, square + 15, square + 17);
    default:
      return attacks(piece, square, SquareSet.empty());
  }
}
