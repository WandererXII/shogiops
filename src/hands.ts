import { HandMap, Role, ROLES } from './types.js';

// Hand alone can store any role
export class Hand {
  private handMap: HandMap;

  private constructor(h: HandMap) {
    this.handMap = h;
  }

  static empty(): Hand {
    return new Hand(new Map());
  }

  clone(): Hand {
    return new Hand(new Map(this.handMap));
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
      if (num) yield [role, num];
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

  combine(other: Hands): Hands {
    return new Hands(this.gote.combine(other.gote), this.sente.combine(other.sente));
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
