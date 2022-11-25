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

  clone(): Board {
    return Board.from(this.occupied, this.colorMap, this.roleMap);
  }

  role(role: Role): SquareSet {
    return this.roleMap.get(role) || SquareSet.empty();
  }
  roles(role: Role, ...roles: Role[]): SquareSet {
    return roles.reduce((acc, r) => acc.union(this.role(r)), this.role(role));
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

  presentRoles(): Role[] {
    return Array.from(this.roleMap)
      .filter(([_, sqs]) => sqs.nonEmpty())
      .map(([r]) => r);
  }

  pieces(color: Color, role: Role): SquareSet {
    return this.color(color).intersect(this.role(role));
  }
}
