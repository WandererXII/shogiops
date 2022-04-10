import { Role, ROLES } from './types.js';

// Hand alone can store anything
// let the variants decide what to store and what not
export class Hand {
  pawn: number;
  lance: number;
  knight: number;
  silver: number;
  gold: number;
  bishop: number;
  rook: number;
  tokin: number;
  promotedlance: number;
  promotedknight: number;
  promotedsilver: number;
  horse: number;
  dragon: number;
  king: number;

  private constructor() {}

  static empty(): Hand {
    const m = new Hand();
    for (const role of ROLES) m[role] = 0;
    return m;
  }

  clone(): Hand {
    const m = new Hand();
    for (const role of ROLES) m[role] = this[role];
    return m;
  }

  equals(other: Hand): boolean {
    return ROLES.every(role => this[role] === other[role]);
  }

  add(other: Hand): Hand {
    const m = new Hand();
    for (const role of ROLES) m[role] = this[role] + other[role];
    return m;
  }

  nonEmpty(): boolean {
    return ROLES.some(role => this[role] > 0);
  }

  isEmpty(): boolean {
    return !this.nonEmpty();
  }

  count(): number {
    return ROLES.map(role => this[role]).reduce((acc, cur) => acc + cur);
  }

  *[Symbol.iterator](): Iterator<[Role, number]> {
    for (const role of ROLES.filter(r => this[r] > 0)) {
      yield [role, this[role]];
    }
  }
}

export class Hands {
  constructor(public gote: Hand, public sente: Hand) {}

  static empty(): Hands {
    return new Hands(Hand.empty(), Hand.empty());
  }

  clone(): Hands {
    return new Hands(this.gote.clone(), this.sente.clone());
  }

  equals(other: Hands): boolean {
    return this.gote.equals(other.gote) && this.sente.equals(other.sente);
  }

  add(other: Hands): Hands {
    return new Hands(this.gote.add(other.gote), this.sente.add(other.sente));
  }

  count(): number {
    return this.gote.count() + this.sente.count();
  }

  isEmpty(): boolean {
    return this.gote.isEmpty() && this.sente.isEmpty();
  }

  nonEmpty(): boolean {
    return !this.isEmpty();
  }
}
