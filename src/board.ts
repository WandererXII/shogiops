import { ROLES } from './constants.js';
import { SquareSet } from './square-set.js';
import type { Color, Piece, Role, Square } from './types.js';

export class Board implements Iterable<[Square, Piece]> {
  private constructor(
    public readonly occupied: SquareSet,
    public readonly sente: SquareSet,
    public readonly gote: SquareSet,
    private readonly roleMap: ReadonlyMap<Role, SquareSet>,
  ) {}

  static empty(): Board {
    return new Board(SquareSet.empty(), SquareSet.empty(), SquareSet.empty(), new Map());
  }

  static from(
    occupied: SquareSet,
    sente: SquareSet,
    gote: SquareSet,
    rolesIter: Iterable<[Role, SquareSet]>,
  ): Board {
    return new Board(occupied, sente, gote, new Map(rolesIter));
  }

  byRole(role: Role): SquareSet {
    return this.roleMap.get(role) || SquareSet.empty();
  }

  byRoles(role: Role, ...roles: Role[]): SquareSet {
    return roles.reduce((acc, r) => acc.union(this.byRole(r)), this.byRole(role));
  }

  byColor(color: Color): SquareSet {
    return color === 'gote' ? this.gote : this.sente;
  }

  byPiece(color: Color, role: Role): SquareSet {
    return this.byColor(color).intersect(this.byRole(role));
  }

  colorAt(square: Square): Color | undefined {
    if (this.sente.has(square)) return 'sente';
    if (this.gote.has(square)) return 'gote';
    return;
  }

  roleAt(square: Square): Role | undefined {
    for (const [role, sqs] of this.roleMap) if (sqs.has(square)) return role;
    return;
  }

  pieceAt(square: Square): Piece | undefined {
    const color = this.colorAt(square);
    if (!color) return;
    const role = this.roleAt(square)!;
    return { color, role };
  }

  withoutPieceAt(square: Square): Board {
    const piece = this.pieceAt(square);
    if (!piece) return this;

    const newRoleMap = new Map(this.roleMap);

    return new Board(
      this.occupied.without(square),
      this.sente.without(square),
      this.gote.without(square),
      newRoleMap.set(piece.role, this.byRole(piece.role).without(square)),
    );
  }

  withPieceAt(square: Square, piece: Piece): Board {
    const boardRemoved = this.withoutPieceAt(square);
    const newRoleMap = new Map(boardRemoved.roleMap);

    return new Board(
      boardRemoved.occupied.with(square),
      piece.color === 'sente' ? boardRemoved.sente.with(square) : boardRemoved.sente,
      piece.color === 'gote' ? boardRemoved.gote.with(square) : boardRemoved.gote,
      newRoleMap.set(piece.role, boardRemoved.byRole(piece.role).with(square)),
    );
  }

  hasPieceAt(square: Square): boolean {
    return this.occupied.has(square);
  }

  *[Symbol.iterator](): Iterator<[Square, Piece]> {
    for (const square of this.occupied) {
      yield [square, this.pieceAt(square)!];
    }
  }

  equals(other: Board): boolean {
    if (!this.byColor('gote').equals(other.byColor('gote'))) return false;
    return ROLES.every((role) => this.byRole(role).equals(other.byRole(role)));
  }

  presentRoles(): Role[] {
    return Array.from(this.roleMap)
      .filter(([_, sqs]) => sqs.nonEmpty())
      .map(([r]) => r);
  }
}
