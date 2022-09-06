import { Color, HandMap, Role, ROLES } from './types.js';

// Hand alone can store any role
export class Hand {
  private constructor(private handMap: HandMap) {}

  static empty(): Hand {
    return new Hand(new Map());
  }

  static from(iter: Iterable<[Role, number]>): Hand {
    return new Hand(new Map(iter));
  }

  clone(): Hand {
    return Hand.from(this.handMap);
  }

  combine(other: Hand): Hand {
    const h = Hand.empty();
    for (const role of ROLES) h.set(role, this.get(role) + other.get(role));
    return h;
  }

  get(role: Role): number {
    return this.handMap.get(role) || 0;
  }

  set(role: Role, cnt: number): void {
    this.handMap.set(role, cnt);
  }

  drop(role: Role): void {
    this.set(role, this.get(role) - 1);
  }

  capture(role: Role): void {
    this.set(role, this.get(role) + 1);
  }

  equals(other: Hand): boolean {
    return ROLES.every(role => this.get(role) === other.get(role));
  }

  nonEmpty(): boolean {
    return ROLES.some(role => this.get(role) > 0);
  }

  isEmpty(): boolean {
    return !this.nonEmpty();
  }

  count(): number {
    return ROLES.map(role => this.get(role)).reduce((acc, cur) => acc + cur);
  }

  *[Symbol.iterator](): Iterator<[Role, number]> {
    for (const [role, num] of this.handMap) {
      if (num > 0) yield [role, num];
    }
  }
}

export class Hands {
  private constructor(private sente: Hand, private gote: Hand) {}

  static empty(): Hands {
    return new Hands(Hand.empty(), Hand.empty());
  }

  static from(sente: Hand, gote: Hand): Hands {
    return new Hands(sente, gote);
  }

  clone(): Hands {
    return new Hands(this.sente.clone(), this.gote.clone());
  }

  combine(other: Hands): Hands {
    return new Hands(this.sente.combine(other.sente), this.gote.combine(other.gote));
  }

  color(color: Color): Hand {
    if (color === 'sente') return this.sente;
    else return this.gote;
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
