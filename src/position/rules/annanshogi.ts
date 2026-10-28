import type { Result } from '@badrap/result';
import { attacks, between, ray } from '../../attacks.js';
import { Board } from '../../board.js';
import { SquareSet } from '../../square-set.js';
import type { Color, Piece, Setup, Square } from '../../types.js';
import { defined, opposite, squareFile } from '../../util.js';
import type { Context, PositionError } from '../position.js';
import { Position } from '../position.js';
import { fullSquareSet } from '../util.js';
import { standardSquareAttacks, standardSquareSnipers } from './shogi.js';

export class Annanshogi extends Position {
  private constructor(setup: Setup) {
    super('annanshogi', setup);
  }

  static from(setup: Setup, strict: boolean): Result<Annanshogi, PositionError> {
    const pos = new Annanshogi(setup);
    return pos.validate(strict).map(() => pos);
  }

  validation = {
    doublePawn: false,
    oppositeCheck: true,
    unpromotedForcedPromotion: true,
    maxNumberOfRoyalPieces: 1,
  };

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    return standardSquareAttacks(square, attacker, annanAttackBoard(this.board), occupied);
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    return standardSquareSnipers(square, attacker, annanAttackBoard(this.board));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    const realPiece = this.board.pieceAt(square);
    if (!realPiece || realPiece.color !== ctx.color) return SquareSet.empty();
    const pieceBehind = this.board.pieceAt(directlyBehind(realPiece.color, square));

    let pseudo = attacks(
      pieceBehind?.color === realPiece.color ? pieceBehind : realPiece,
      square,
      this.board.occupied,
    );
    pseudo = pseudo.diff(this.board.byColor(ctx.color));

    if (defined(ctx.king)) {
      if (realPiece.role === 'king') {
        const occ = this.board.occupied.without(square);
        for (const to of pseudo) {
          if (
            standardSquareAttacks(
              to,
              opposite(ctx.color),
              annanAttackBoard(this.board.withoutPieceAt(to)),
              occ,
            ).nonEmpty()
          )
            pseudo = pseudo.without(to);
        }
      } else {
        for (const to of pseudo.intersect(this.board.byColor(opposite(ctx.color)))) {
          const boardUpdated = this.board.withoutPieceAt(square).withPieceAt(to, realPiece);
          if (
            standardSquareAttacks(
              ctx.king,
              opposite(ctx.color),
              annanAttackBoard(boardUpdated),
              boardUpdated.occupied,
            ).nonEmpty()
          )
            pseudo = pseudo.without(to);
        }
        if (ctx.checkers.nonEmpty()) {
          if (ctx.checkers.size() > 2) return SquareSet.empty();
          const singularChecker = ctx.checkers.singleSquare();
          const moveGivers = (
            ctx.color === 'sente' ? ctx.checkers.shr256(16) : ctx.checkers.shl256(16)
          ).intersect(pseudo);

          if (defined(singularChecker))
            pseudo = pseudo.intersect(between(singularChecker, ctx.king).with(singularChecker));
          else pseudo = SquareSet.empty();

          for (const moveGiver of moveGivers) {
            const boardUpdated = this.board
              .withoutPieceAt(square)
              .withPieceAt(moveGiver, realPiece);
            if (
              standardSquareAttacks(
                ctx.king,
                opposite(ctx.color),
                annanAttackBoard(boardUpdated),
                boardUpdated.occupied,
              ).isEmpty()
            ) {
              pseudo = pseudo.with(moveGiver);
            }
          }
        }
        if (ctx.blockers.has(square)) {
          let rayed = pseudo.intersect(ray(square, ctx.king));
          const occ = this.board.occupied.without(square);
          for (const to of pseudo.diff(rayed)) {
            if (this.board.colorAt(to) !== ctx.color) {
              if (
                standardSquareAttacks(
                  ctx.king,
                  opposite(ctx.color),
                  annanAttackBoard(this.board.withoutPieceAt(square).withPieceAt(to, realPiece)),
                  occ,
                ).isEmpty()
              ) {
                rayed = rayed.with(to);
                break;
              }
            }
          }
          pseudo = rayed;
        }
      }
    }
    return pseudo.intersect(fullSquareSet(this.rules));
  }

  dropDests(piece: Piece, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    if (piece.color !== ctx.color) return SquareSet.empty();
    const role = piece.role;
    let mask = this.board.occupied.complement();

    if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
      const checker = ctx.checkers.singleSquare();
      if (!defined(checker)) return SquareSet.empty();
      mask = mask.intersect(between(checker, ctx.king));
    }

    if (role === 'pawn') {
      // Checking for double pawns
      const pawns = this.board.byRole('pawn').intersect(this.board.byColor(ctx.color));
      for (const pawn of pawns) {
        const file = SquareSet.fromFile(squareFile(pawn));
        mask = mask.diff(file);
      }
      // Checking for a pawn checkmate
      const kingSquare = this.kingsOf(opposite(ctx.color)).singleSquare();
      if (defined(kingSquare)) {
        const kingFront = directlyBehind(ctx.color, kingSquare);
        for (const to of mask.intersect(fullSquareSet(this.rules))) {
          const pieceBehind = this.board.pieceAt(directlyBehind(ctx.color, to));
          // The dropped pawn can also check using borrowed movement.
          if (
            to !== kingFront &&
            !(
              pieceBehind?.color === ctx.color &&
              attacks(pieceBehind, to, this.board.occupied).has(kingSquare)
            )
          )
            continue;
          const child = this.update({ turn: ctx.color }).play({ role: 'pawn', to });
          if (child.outcome()?.result === 'checkmate') mask = mask.without(to);
        }
      }
    }

    return mask.intersect(fullSquareSet(this.rules));
  }
}

export const directlyBehind = (color: Color, square: Square): Square => {
  return color === 'sente' ? square + 16 : square - 16;
};

// Changes the pieces in front of other friendly piece to said pieces
export const annanAttackBoard = (board: Board): Board => {
  let newBoard = Board.empty();
  for (const [sq, piece] of board) {
    const pieceBehind = board.pieceAt(directlyBehind(piece.color, sq));
    const role = pieceBehind?.color === piece.color ? pieceBehind.role : piece.role;
    newBoard = newBoard.withPieceAt(sq, { role, color: piece.color });
  }
  return newBoard;
};
