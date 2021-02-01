import { Color, POCKET_ROLES } from './types';
import { Board } from './board';

export class MaterialSide {
  pawn: number;
  lance: number;
  knight: number;
  silver: number;
  gold: number;
  bishop: number;
  rook: number;

  private constructor() {}

  static empty(): MaterialSide {
    const m = new MaterialSide();
    for (const role of POCKET_ROLES) m[role] = 0;
    return m;
  }

  static fromBoard(board: Board, color: Color): MaterialSide {
    const m = new MaterialSide();
    for (const role of POCKET_ROLES) m[role] = board.pieces(color, role).size();
    return m;
  }

  clone(): MaterialSide {
    const m = new MaterialSide();
    for (const role of POCKET_ROLES) m[role] = this[role];
    return m;
  }

  equals(other: MaterialSide): boolean {
    return POCKET_ROLES.every(role => this[role] === other[role]);
  }

  add(other: MaterialSide): MaterialSide {
    const m = new MaterialSide();
    for (const role of POCKET_ROLES) m[role] = this[role] + other[role];
    return m;
  }

  nonEmpty(): boolean {
    return POCKET_ROLES.some(role => this[role] > 0);
  }

  isEmpty(): boolean {
    return !this.nonEmpty();
  }

  count(): number {
    return this.pawn + this.lance + this.knight + this.silver + this.gold + this.bishop + this.rook;
  }
}

export class Material {
  constructor(public white: MaterialSide, public black: MaterialSide) {}

  static empty(): Material {
    return new Material(MaterialSide.empty(), MaterialSide.empty());
  }

  static fromBoard(board: Board): Material {
    return new Material(MaterialSide.fromBoard(board, 'white'), MaterialSide.fromBoard(board, 'black'));
  }

  clone(): Material {
    return new Material(this.white.clone(), this.black.clone());
  }

  equals(other: Material): boolean {
    return this.white.equals(other.white) && this.black.equals(other.black);
  }

  add(other: Material): Material {
    return new Material(this.white.add(other.white), this.black.add(other.black));
  }

  count(): number {
    return this.white.count() + this.black.count();
  }

  isEmpty(): boolean {
    return this.white.isEmpty() && this.black.isEmpty();
  }

  nonEmpty(): boolean {
    return !this.isEmpty();
  }
}

export interface Setup {
  board: Board;
  pockets: Material;
  turn: Color;
  fullmoves: number;
}

export function defaultSetup(): Setup {
  return {
    board: Board.default(),
    pockets: Material.empty(),
    turn: 'black',
    fullmoves: 1,
  };
}
