import { Square, Color, Role, Piece, COLORS, ROLES, Dimensions } from './types.js';
import { SquareSet } from './squareSet.js';

export class Board implements Iterable<[Square, Piece]> {
  dimensions: Dimensions;

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
  promotedlance: SquareSet;
  promotedknight: SquareSet;
  promotedsilver: SquareSet;
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
    this.dimensions = { files: 9, ranks: 9 };
    this.occupied = new SquareSet([0x8201ff, 0x1ff, 0x0, 0x8201ff, 0x1ff, 0x0, 0x0, 0x0]);
    this.sente = new SquareSet([0x0, 0x0, 0x0, 0x8201ff, 0x1ff, 0x0, 0x0, 0x0]);
    this.gote = new SquareSet([0x8201ff, 0x1ff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
    this.pawn = new SquareSet([0x0, 0x1ff, 0x0, 0x1ff, 0x0, 0x0, 0x0, 0x0]);
    this.lance = new SquareSet([0x101, 0x0, 0x0, 0x0, 0x101, 0x0, 0x0, 0x0]);
    this.knight = new SquareSet([0x82, 0x0, 0x0, 0x0, 0x82, 0x0, 0x0, 0x0]);
    this.silver = new SquareSet([0x44, 0x0, 0x0, 0x0, 0x44, 0x0, 0x0, 0x0]);
    this.gold = new SquareSet([0x28, 0x0, 0x0, 0x0, 0x28, 0x0, 0x0, 0x0]);
    this.bishop = new SquareSet([0x20000, 0x0, 0x0, 0x800000, 0x0, 0x0, 0x0, 0x0]);
    this.rook = new SquareSet([0x800000, 0x0, 0x0, 0x20000, 0x0, 0x0, 0x0, 0x0]);
    this.king = new SquareSet([0x10, 0x0, 0x0, 0x0, 0x10, 0x0, 0x0, 0x0]);
    this.tokin = SquareSet.empty();
    this.promotedlance = SquareSet.empty();
    this.promotedknight = SquareSet.empty();
    this.promotedsilver = SquareSet.empty();
    this.horse = SquareSet.empty();
    this.dragon = SquareSet.empty();
  }

  static minishogi(): Board {
    const board = new Board();
    board.dimensions = { files: 5, ranks: 5 };
    board.occupied = new SquareSet([0x1001f, 0x100000, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.sente = new SquareSet([0x0, 0x100000, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.gote = new SquareSet([0x1001f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.pawn = new SquareSet([0x10000, 0x100000, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.lance = SquareSet.empty();
    board.knight = SquareSet.empty();
    board.silver = new SquareSet([0x4, 0x0, 0x4, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.gold = new SquareSet([0x2, 0x0, 0x8, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.bishop = new SquareSet([0x8, 0x0, 0x2, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.rook = new SquareSet([0x10, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.king = new SquareSet([0x1, 0x0, 0x10, 0x0, 0x0, 0x0, 0x0, 0x0]);
    board.tokin = SquareSet.empty();
    board.promotedlance = SquareSet.empty();
    board.promotedknight = SquareSet.empty();
    board.promotedsilver = SquareSet.empty();
    board.horse = SquareSet.empty();
    board.dragon = SquareSet.empty();
    return board;
  }

  static empty(dims: Dimensions): Board {
    const board = new Board();
    board.dimensions = dims;
    board.occupied = SquareSet.empty();
    for (const color of COLORS) board[color] = SquareSet.empty();
    for (const role of ROLES) board[role] = SquareSet.empty();
    return board;
  }

  clone(): Board {
    const board = new Board();
    board.occupied = this.occupied;
    board.dimensions = this.dimensions;
    for (const color of COLORS) board[color] = this[color];
    for (const role of ROLES) board[role] = this[role];
    return board;
  }

  equals(other: Board): boolean {
    if (!this.gote.equals(other.gote)) return false;
    if (this.dimensions.files !== other.dimensions.files || this.dimensions.ranks !== other.dimensions.ranks)
      return false;
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
