import { Result } from '@badrap/result';
import { between, rookAttacks } from '../attacks.js';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { SquareSet } from '../squareSet.js';
import { Color, Move, Outcome, Piece, Role, Setup, Square, isDrop, isNormal } from '../types.js';
import { opposite } from '../util.js';
import { Context, IllegalSetup, Position, PositionError } from './position.js';
import { allRoles, fullSquareSet } from './util.js';

export class Hasamishogi extends Position {
  private constructor() {
    super('hasamishogi');
  }

  static default(): Hasamishogi {
    const pos = new this();
    pos.board = hasamishogiBoard();
    pos.hands = Hands.empty();
    pos.turn = 'sente';
    pos.moveNumber = 1;
    return pos;
  }

  static from(setup: Setup, strict: boolean): Result<Hasamishogi, PositionError> {
    const pos = new this();
    pos.fromSetup(setup);
    return pos.validate(strict).map(_ => pos);
  }

  validate(strict: boolean): Result<undefined, PositionError> {
    if (!this.board.occupied.intersect(fullSquareSet(this.rules)).equals(this.board.occupied))
      return Result.err(new PositionError(IllegalSetup.PiecesOutsideBoard));

    if (this.hands.count()) return Result.err(new PositionError(IllegalSetup.InvalidPiecesHand));

    if (this.board.color(opposite(this.turn)).size() < 2)
      return Result.err(new PositionError(IllegalSetup.OppositeTurnEnd));

    for (const role of this.board.presentRoles())
      if (!allRoles(this.rules).includes(role)) return Result.err(new PositionError(IllegalSetup.InvalidPieces));

    if (!strict) return Result.ok(undefined);

    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    return Result.ok(undefined);
  }

  squareAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const board = this.board;
    return board.color(attacker).intersect(rookAttacks(square, occupied).intersect(board.role('rook')));
  }

  squareSnipers(square: number, attacker: Color): SquareSet {
    const empty = SquareSet.empty();
    return rookAttacks(square, empty).intersect(this.board.role('rook')).intersect(this.board.color(attacker));
  }

  moveDests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    const piece = this.board.get(square);
    if (!piece || piece.color !== ctx.color) return SquareSet.empty();

    let pseudo = rookAttacks(square, this.board.occupied);
    pseudo = pseudo.diff(this.board.occupied);

    return pseudo.intersect(fullSquareSet(this.rules));
  }

  dropDests(_piece: Piece, _ctx?: Context): SquareSet {
    return SquareSet.empty();
  }

  isDraw(_ctx?: Context | undefined): boolean {
    return false;
  }

  lastManStanding(_ctx?: Context | undefined): boolean {
    return this.board.color(this.turn).size() <= 1;
  }

  outcome(_ctx?: Context): Outcome | undefined {
    if (this.lastManStanding())
      return {
        result: 'lastmanstanding',
        winner: opposite(this.turn),
      };
    else return;
  }

  play(move: Move): void {
    const turn = this.turn,
      captures = hasamishogiCapturedSquares(this, move);

    this.moveNumber += 1;
    this.turn = opposite(turn);
    this.lastMove = move;
    this.lastLionCapture = undefined;

    if (isNormal(move)) {
      const piece = this.board.take(move.from);
      if (piece) {
        this.board.set(move.to, piece);
        for (const sq of captures) {
          this.board.take(sq);
        }
      }
    }
  }
}

const hasamishogiBoard = (): Board => {
  const occupied = new SquareSet([0x1ff, 0x0, 0x0, 0x0, 0x1ff, 0x0, 0x0, 0x0]);
  const colorIter: [Color, SquareSet][] = [
    ['sente', new SquareSet([0x0, 0x0, 0x0, 0x0, 0x1ff, 0x0, 0x0, 0x0])],
    ['gote', new SquareSet([0x1ff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
  ];
  const roleIter: [Role, SquareSet][] = [['rook', new SquareSet([0x1ff, 0x0, 0x0, 0x0, 0x1ff, 0x0, 0x0, 0x0])]];
  return Board.from(occupied, colorIter, roleIter);
};

// Returns squareset with all the sandwiched moves after move
export const hasamishogiCapturedSquares = (before: Hasamishogi, move: Move): SquareSet => {
  if (isDrop(move) || before.board.has(move.to) || !before.board.has(move.from)) return SquareSet.empty();

  let captures = SquareSet.empty();
  const candidates = rookAttacks(move.to, before.board.color(before.turn)).intersect(
    before.board.color(before.turn).without(move.from)
  );
  for (const sq of candidates) {
    const b = between(move.to, sq);
    if (b.equals(b.intersect(before.board.color(opposite(before.turn))))) captures = captures.union(b);
  }

  // edge case
  const corners: [number, number[]][] = [
    [0, [1, 16]],
    [8, [7, 24]],
    [128, [112, 129]],
    [136, [120, 135]],
  ];
  for (const c of corners) {
    const corner = c[0],
      cornerEdges = c[1];
    if (
      cornerEdges.includes(move.to) &&
      before.board.color(opposite(before.turn)).has(corner) &&
      cornerEdges.filter(sq => sq !== move.to).every(sq => before.board.color(before.turn).has(sq))
    )
      captures = captures.with(corner);
  }

  return captures;
};
