import { SquareSet } from './squareSet.js';
import { Color, ColorMap, Piece, ROLES, Role, RoleMap, Square } from './types.js';

export class Board implements Iterable<[Square, Piece]> {
  private constructor(public occupied: SquareSet, private colorMap: ColorMap, private roleMap: RoleMap) {}

  static empty(): Board {
    return new Board(SquareSet.empty(), new Map(), new Map());
  }

  static from(
    occupied: SquareSet,
    colorsIter: Iterable<[Color, SquareSet]>,
    rolesIter: Iterable<[Role, SquareSet]>
  ): Board {
    return new Board(occupied, new Map(colorsIter), new Map(rolesIter));
  }

  static standard(): Board {
    const occupied = new SquareSet([0x8201ff, 0x1ff, 0x0, 0x8201ff, 0x1ff, 0x0, 0x0, 0x0]);
    const colorIter: [Color, SquareSet][] = [
      ['sente', new SquareSet([0x0, 0x0, 0x0, 0x8201ff, 0x1ff, 0x0, 0x0, 0x0])],
      ['gote', new SquareSet([0x8201ff, 0x1ff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ];
    const roleIter: [Role, SquareSet][] = [
      ['rook', new SquareSet([0x800000, 0x0, 0x0, 0x20000, 0x0, 0x0, 0x0, 0x0])],
      ['bishop', new SquareSet([0x20000, 0x0, 0x0, 0x800000, 0x0, 0x0, 0x0, 0x0])],
      ['gold', new SquareSet([0x28, 0x0, 0x0, 0x0, 0x28, 0x0, 0x0, 0x0])],
      ['silver', new SquareSet([0x44, 0x0, 0x0, 0x0, 0x44, 0x0, 0x0, 0x0])],
      ['knight', new SquareSet([0x82, 0x0, 0x0, 0x0, 0x82, 0x0, 0x0, 0x0])],
      ['lance', new SquareSet([0x101, 0x0, 0x0, 0x0, 0x101, 0x0, 0x0, 0x0])],
      ['pawn', new SquareSet([0x0, 0x1ff, 0x0, 0x1ff, 0x0, 0x0, 0x0, 0x0])],
      ['king', new SquareSet([0x10, 0x0, 0x0, 0x0, 0x10, 0x0, 0x0, 0x0])],
    ];
    return Board.from(occupied, colorIter, roleIter);
  }

  static minishogi(): Board {
    const occupied = new SquareSet([0x1001f, 0x100000, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
    const colorMap: [Color, SquareSet][] = [
      ['sente', new SquareSet([0x0, 0x100000, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0])],
      ['gote', new SquareSet([0x1001f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ];
    const roleMap: [Role, SquareSet][] = [
      ['rook', new SquareSet([0x10, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0])],
      ['bishop', new SquareSet([0x8, 0x0, 0x2, 0x0, 0x0, 0x0, 0x0, 0x0])],
      ['gold', new SquareSet([0x2, 0x0, 0x8, 0x0, 0x0, 0x0, 0x0, 0x0])],
      ['silver', new SquareSet([0x4, 0x0, 0x4, 0x0, 0x0, 0x0, 0x0, 0x0])],
      ['pawn', new SquareSet([0x10000, 0x100000, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
      ['king', new SquareSet([0x1, 0x0, 0x10, 0x0, 0x0, 0x0, 0x0, 0x0])],
    ];
    return Board.from(occupied, colorMap, roleMap);
  }

  clone(): Board {
    return Board.from(this.occupied, this.colorMap, this.roleMap);
  }

  role(role: Role): SquareSet {
    return this.roleMap.get(role) || SquareSet.empty();
  }
  color(color: Color): SquareSet {
    return this.colorMap.get(color) || SquareSet.empty();
  }

  equals(other: Board): boolean {
    if (!this.color('gote').equals(other.color('gote'))) return false;
    return ROLES.every(role => this.role(role).equals(other.role(role)));
  }

  getColor(square: Square): Color | undefined {
    if (this.color('sente').has(square)) return 'sente';
    if (this.color('gote').has(square)) return 'gote';
    return;
  }

  getRole(square: Square): Role | undefined {
    for (const [role, sqs] of this.roleMap) if (sqs.has(square)) return role;
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
      this.colorMap.set(piece.color, this.color(piece.color).without(square));
      this.roleMap.set(piece.role, this.role(piece.role).without(square));
    }
    return piece;
  }

  set(square: Square, piece: Piece): Piece | undefined {
    const old = this.take(square);
    this.occupied = this.occupied.with(square);
    this.colorMap.set(piece.color, this.color(piece.color).with(square));
    this.roleMap.set(piece.role, this.role(piece.role).with(square));
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

  roles(): Role[] {
    return Array.from(this.roleMap)
      .filter(([_, sqs]) => sqs.nonEmpty())
      .map(([r]) => r);
  }

  pieces(color: Color, role: Role): SquareSet {
    return this.color(color).intersect(this.role(role));
  }

  kingOf(color: Color): Square | undefined {
    return this.role('king').intersect(this.color(color)).singleSquare();
  }
}
