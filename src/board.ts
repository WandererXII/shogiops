import { Square, Color, Role, Piece, COLORS, ROLES } from './types';
import { SquareSet } from './squareSet';

export class Board implements Iterable<[Square, Piece]> {
  occupied: SquareSet;

  gote: SquareSet;
  sente: SquareSet;

  pawn: SquareSet;
  lance: SquareSet;
  knight: SquareSet;
  silver: SquareSet;
  gold: SquareSet;
  bishop: SquareSet;
  rook: SquareSet;
  tokin: SquareSet;
  promotedLance: SquareSet;
  promotedKnight: SquareSet;
  promotedSilver: SquareSet;
  horse: SquareSet;
  dragon: SquareSet;
  king: SquareSet;

  private constructor() {}

  static default(): Board {
    const board = new Board();
    board.reset();
    return board;
  }

  reset(): void {
    this.occupied = new SquareSet(0x7fd05ff, 0x0, 0x7fd05ff);
    this.sente = new SquareSet(0x7fd05ff, 0x0, 0x0);
    this.gote = new SquareSet(0x0, 0x0, 0x7fd05ff);
    this.pawn = new SquareSet(0x7fc0000, 0x0, 0x1ff);
    this.lance = new SquareSet(0x101, 0x0, 0x4040000);
    this.knight = new SquareSet(0x82, 0x0, 0x2080000);
    this.silver = new SquareSet(0x44, 0x0, 0x1100000);
    this.gold = new SquareSet(0x28, 0x0, 0xa00000);
    this.bishop = new SquareSet(0x400, 0x0, 0x10000);
    this.rook = new SquareSet(0x10000, 0x0, 0x400);
    this.king = new SquareSet(0x10, 0x0, 0x400000);
    this.tokin = SquareSet.empty();
    this.promotedLance = SquareSet.empty();
    this.promotedKnight = SquareSet.empty();
    this.promotedSilver = SquareSet.empty();
    this.horse = SquareSet.empty();
    this.dragon = SquareSet.empty();
  }

  static empty(): Board {
    const board = new Board();
    board.clear();
    return board;
  }

  clear(): void {
    this.occupied = SquareSet.empty();
    for (const color of COLORS) this[color] = SquareSet.empty();
    for (const role of ROLES) this[role] = SquareSet.empty();
  }

  clone(): Board {
    const board = new Board();
    board.occupied = this.occupied;
    for (const color of COLORS) board[color] = this[color];
    for (const role of ROLES) board[role] = this[role];
    return board;
  }

  equals(other: Board): boolean {
    if (!this.gote.equals(other.gote)) return false;
    return ROLES.every(role => this[role].equals(other[role]));
  }

  getColor(square: Square): Color | undefined {
    if (this.sente.has(square)) return 'sente';
    if (this.gote.has(square)) return 'gote';
    return;
  }

  getRole(square: Square): Role | undefined {
    for (const role of ROLES) {
      if (this[role].has(square)) return role;
    }
    return;
  }

  get(square: Square): Piece | undefined {
    const color = this.getColor(square);
    if (!color) return;
    const role = this.getRole(square)!;
    return { color, role };
  }

  take(square: Square): Piece | undefined {
    const piece = this.get(square);
    if (piece) {
      this.occupied = this.occupied.without(square);
      this[piece.color] = this[piece.color].without(square);
      this[piece.role] = this[piece.role].without(square);
    }
    return piece;
  }

  set(square: Square, piece: Piece): Piece | undefined {
    const old = this.take(square);
    this.occupied = this.occupied.with(square);
    this[piece.color] = this[piece.color].with(square);
    this[piece.role] = this[piece.role].with(square);
    return old;
  }

  has(square: Square): boolean {
    return this.occupied.has(square);
  }

  *[Symbol.iterator](): Iterator<[Square, Piece]> {
    for (const square of this.occupied) {
      yield [square, this.get(square)!];
    }
  }

  pieces(color: Color, role: Role): SquareSet {
    return this[color].intersect(this[role]);
  }

  kingOf(color: Color): Square | undefined {
    return this.king.intersect(this[color]).singleSquare();
  }
}
