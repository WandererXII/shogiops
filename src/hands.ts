import { ROLES } from './constants.js';
import type { Color, Piece, Role } from './types.js';

// Hand alone can store any role
export class Hand {
  private constructor(private readonly handMap: ReadonlyMap<Role, number>) {}

  static empty(): Hand {
    return new Hand(new Map());
  }

  static from(iter: Iterable<[Role, number]>): Hand {
    return new Hand(new Map(iter));
  }

  combine(other: Hand): Hand {
    let h = Hand.empty();
    for (const role of ROLES) h = h.with(role, this.get(role) + other.get(role));
    return h;
  }

  get(role: Role): number {
    return this.handMap.get(role) ?? 0;
  }

  with(role: Role, cnt: number): Hand {
    const newHandMap = new Map(this.handMap);
    return new Hand(newHandMap.set(role, Math.max(cnt, 0)));
  }

  decrement(role: Role): Hand {
    return this.with(role, this.get(role) - 1);
  }

  increment(role: Role): Hand {
    return this.with(role, this.get(role) + 1);
  }

  equals(other: Hand): boolean {
    return ROLES.every((role) => this.get(role) === other.get(role));
  }

  nonEmpty(): boolean {
    return ROLES.some((role) => this.get(role) > 0);
  }

  isEmpty(): boolean {
    return !this.nonEmpty();
  }

  count(): number {
    return ROLES.reduce((acc, role) => acc + this.get(role), 0);
  }

  *[Symbol.iterator](): Iterator<[Role, number]> {
    for (const [role, num] of this.handMap) {
      if (num > 0) yield [role, num];
    }
  }
}

export class Hands {
  private constructor(
    private readonly sente: Hand,
    private readonly gote: Hand,
  ) {}

  static empty(): Hands {
    return new Hands(Hand.empty(), Hand.empty());
  }

  static from(sente: Hand, gote: Hand): Hands {
    return new Hands(sente, gote);
  }

  combine(other: Hands): Hands {
    return new Hands(this.sente.combine(other.sente), this.gote.combine(other.gote));
  }

  color(color: Color): Hand {
    if (color === 'sente') return this.sente;
    else return this.gote;
  }

  get(piece: Piece): number {
    return piece.color === 'sente' ? this.sente.get(piece.role) : this.gote.get(piece.role);
  }

  with(piece: Piece, cnt: number): Hands {
    return new Hands(
      piece.color === 'sente' ? this.sente.with(piece.role, cnt) : this.sente,
      piece.color === 'gote' ? this.gote.with(piece.role, cnt) : this.gote,
    );
  }

  decrement(piece: Piece): Hands {
    return this.with(piece, this.get(piece) - 1);
  }

  increment(piece: Piece): Hands {
    return this.with(piece, this.get(piece) + 1);
  }

  equals(other: Hands): boolean {
    return this.sente.equals(other.sente) && this.gote.equals(other.gote);
  }

  count(): number {
    return this.sente.count() + this.gote.count();
  }

  isEmpty(): boolean {
    return this.sente.isEmpty() && this.gote.isEmpty();
  }

  nonEmpty(): boolean {
    return !this.isEmpty();
  }
}
