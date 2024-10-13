import { Result } from '@badrap/result';
import { attacks, between, ray } from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { Color, Piece, Role, Setup, Square } from '../types.js';
import { defined, opposite, squareFile } from '../util.js';
import { Context, Position, PositionError } from './position.js';
import { standardSquareAttacks, standardSquareSnipers } from './shogi.js';
import { fullSquareSet } from './util.js';

export class Annanshogi extends Position {
  private constructor() {
    super('annanshogi');
  }

  static default(): Annanshogi {
    const pos = new this();
    pos.board = annanBoard();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static from(setup: Setup, strict: boolean): Result<Annanshogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map(_ => pos);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    return standardSquareAttacks(square, attacker, annanAttackBoard(this.board), occupied);
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    return standardSquareSnipers(square, attacker, annanAttackBoard(this.board));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    const realPiece = this.board.get(square);
    if (!realPiece || realPiece.color !== ctx.color) return SquareSet.empty();
    const pieceBehind = this.board.get(directlyBehind(realPiece.color, square));

    let pseudo = attacks(
      pieceBehind?.color === realPiece.color ? pieceBehind : realPiece,
      square,
      this.board.occupied
    );
    pseudo = pseudo.diff(this.board.color(ctx.color));

    if (defined(ctx.king)) {
      if (realPiece.role === 'king') {
        const occ = this.board.occupied.without(square);
        for (const to of pseudo) {
          const boardClone = this.board.clone();
          boardClone.take(to);
          if (
            standardSquareAttacks(
              to,
              opposite(ctx.color),
              annanAttackBoard(boardClone),
              occ
            ).nonEmpty()
          )
            pseudo = pseudo.without(to);
        }
      } else {
        const stdAttackers = standardSquareAttacks(
          ctx.king,
          opposite(ctx.color),
          this.board,
          this.board.occupied
        );
        pseudo = pseudo.diff(
          (ctx.color === 'sente' ? stdAttackers.shr256(16) : stdAttackers.shl256(16)).intersect(
            this.board.occupied
          )
        );
        if (ctx.checkers.nonEmpty()) {
          if (ctx.checkers.size() > 2) return SquareSet.empty();
          const singularChecker = ctx.checkers.singleSquare(),
            moveGivers = (
              ctx.color === 'sente' ? ctx.checkers.shr256(16) : ctx.checkers.shl256(16)
            ).intersect(pseudo);

          if (defined(singularChecker))
            pseudo = pseudo.intersect(between(singularChecker, ctx.king).with(singularChecker));
          else pseudo = SquareSet.empty();

          for (const moveGiver of moveGivers) {
            const boardClone = this.board.clone();
            boardClone.take(square);
            boardClone.set(moveGiver, realPiece);
            if (
              standardSquareAttacks(
                ctx.king,
                opposite(ctx.color),
                annanAttackBoard(boardClone),
                boardClone.occupied
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
            if (this.board.getColor(to) !== ctx.color) {
              const boardClone = this.board.clone();
              boardClone.take(square);
              boardClone.set(to, realPiece);
              if (
                standardSquareAttacks(
                  ctx.king,
                  opposite(ctx.color),
                  annanAttackBoard(boardClone),
                  occ
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
      const pawns = this.board.role('pawn').intersect(this.board.color(ctx.color));
      for (const pawn of pawns) {
        const file = SquareSet.fromFile(squareFile(pawn));
        mask = mask.diff(file);
      }
      // Checking for a pawn checkmate
      const kingSquare = this.kingsOf(opposite(ctx.color)).singleSquare(),
        kingFront = defined(kingSquare)
          ? ctx.color === 'sente'
            ? kingSquare + 16
            : kingSquare - 16
          : undefined;
      if (defined(kingFront) && mask.has(kingFront)) {
        const child = this.clone();
        child.play({ role: 'pawn', to: kingFront });
        const childCtx = child.ctx(),
          checkmateOrStalemate = child.isCheckmate(childCtx) || child.isStalemate(childCtx);
        if (checkmateOrStalemate) mask = mask.without(kingFront);
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
  const newBoard = Board.empty();
  for (const [sq, piece] of board) {
    const pieceBehind = board.get(directlyBehind(piece.color, sq)),
      role = pieceBehind?.color === piece.color ? pieceBehind.role : piece.role;
    newBoard.set(sq, { role, color: piece.color });
  }
  return newBoard;
};

const annanBoard = (): Board => {
  const occupied = new SquareSet([0x8201ff, 0x82017d, 0x820000, 0x82017d, 0x1ff, 0x0, 0x0, 0x0]);
  const colorMap: [Color, SquareSet][] = [
    ['sente', new SquareSet([0x0, 0x0, 0x820000, 0x82017d, 0x1ff, 0x0, 0x0, 0x0])],
    ['gote', new SquareSet([0x8201ff, 0x82017d, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  const roleMap: [Role, SquareSet][] = [
    ['rook', new SquareSet([0x800000, 0x0, 0x0, 0x20000, 0x0, 0x0, 0x0, 0x0])],
    ['bishop', new SquareSet([0x20000, 0x0, 0x0, 0x800000, 0x0, 0x0, 0x0, 0x0])],
    ['gold', new SquareSet([0x28, 0x0, 0x0, 0x0, 0x28, 0x0, 0x0, 0x0])],
    ['silver', new SquareSet([0x44, 0x0, 0x0, 0x0, 0x44, 0x0, 0x0, 0x0])],
    ['knight', new SquareSet([0x82, 0x0, 0x0, 0x0, 0x82, 0x0, 0x0, 0x0])],
    ['lance', new SquareSet([0x101, 0x0, 0x0, 0x0, 0x101, 0x0, 0x0, 0x0])],
    ['pawn', new SquareSet([0x0, 0x82017d, 0x820000, 0x17d, 0x0, 0x0, 0x0, 0x0])],
    ['king', new SquareSet([0x10, 0x0, 0x0, 0x0, 0x10, 0x0, 0x0, 0x0])],
  ];
  return Board.from(occupied, colorMap, roleMap);
};
