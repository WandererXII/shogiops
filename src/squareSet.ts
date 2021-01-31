import { Square, Color } from './types';

function popcnt27(n: number): number {
  n = trimTo27(n);
  n = n - ((n >>> 1) & 0x5555_5555);
  n = (n & 0x3333_3333) + ((n >>> 2) & 0x3333_3333);
  return Math.imul((n + (n >>> 4)) & 0x0f0f_0f0f, 0x0101_0101) >> 24;
}

function rowSwap27(n: number): number {
  const firstRow = 0x000001ff & n;
  const midRow = 0x0003fe00 & n;
  const lastRow = 0x07fc0000 & n;
  return (firstRow << 18) | midRow | (lastRow >> 18);
}

function rbit27(n: number): number {
  n = ((n & 0x783c1e0) >> 5) | ((n & 0x3c1e0f) << 5) | (n & 0x402010);
  n = ((n & 0x633198c) >> 2) | ((n & 0x18cc663) << 2) | (n & 0x402010);
  n = ((n & 0x52a954a) >> 1) | ((n & 0x2954aa5) << 1) | (n & 0x402010);
  return rowSwap27(n);
}

function trimTo27(n: number) {
  return n & 0x07ffffff;
}

export class SquareSet implements Iterable<Square> {
  constructor(readonly lo: number, readonly mid: number, readonly hi: number) {
    this.lo = trimTo27(lo) | 0;
    this.mid = trimTo27(mid) | 0;
    this.hi = trimTo27(hi) | 0;
  }

  static fromSquare(square: Square): SquareSet {
    return square >= 54
      ? new SquareSet(0, 0, 1 << (square - 54))
      : square >= 27
      ? new SquareSet(0, 1 << (square - 27), 0)
      : new SquareSet(1 << square, 0, 0);
  }

  static fromRank(rank: number): SquareSet {
    return new SquareSet(0x000001ff, 0, 0).shl81(9 * rank);
  }

  static fromFile(file: number): SquareSet {
    return new SquareSet(0x00040201 << file, 0x00040201 << file, 0x00040201 << file);
  }

  static backwardRanks(rank: number): SquareSet {
    return new SquareSet(0x07ffffff, 0x07ffffff, 0x07ffffff).shr81(9 * (9 - rank));
  }

  static forwardRanks(rank: number): SquareSet {
    return this.backwardRanks(9 - rank).bswap81();
  }

  static empty(): SquareSet {
    return new SquareSet(0, 0, 0);
  }

  static full(): SquareSet {
    return new SquareSet(0x07ffffff, 0x07ffffff, 0x07ffffff);
  }

  static corners(): SquareSet {
    return new SquareSet(0x00000101, 0, 0x04040000);
  }

  static promotionZones(): SquareSet {
    // backranks
    return new SquareSet(0x07ffffff, 0, 0x07ffffff);
  }

  static promotionZone(color: Color): SquareSet {
    return color === 'black' ? new SquareSet(0, 0, 0x07ffffff) : new SquareSet(0x07ffffff, 0, 0);
  }

  static backrank(color: Color): SquareSet {
    return color === 'black' ? SquareSet.fromRank(8) : SquareSet.fromRank(0);
  }

  static backrank2(color: Color): SquareSet {
    return (color === 'black' ? SquareSet.fromRank(7) : SquareSet.fromRank(1)).union(this.backrank(color));
  }

  complement(): SquareSet {
    return new SquareSet(~this.lo, ~this.mid, ~this.hi);
  }

  xor(other: SquareSet): SquareSet {
    return new SquareSet(this.lo ^ other.lo, this.mid ^ other.mid, this.hi ^ other.hi);
  }

  union(other: SquareSet): SquareSet {
    return new SquareSet(this.lo | other.lo, this.mid | other.mid, this.hi | other.hi);
  }

  intersect(other: SquareSet): SquareSet {
    return new SquareSet(this.lo & other.lo, this.mid & other.mid, this.hi & other.hi);
  }

  diff(other: SquareSet): SquareSet {
    return new SquareSet(this.lo & ~other.lo, this.mid & ~other.mid, this.hi & ~other.hi);
  }

  intersects(other: SquareSet): boolean {
    return this.intersect(other).nonEmpty();
  }

  isDisjoint(other: SquareSet): boolean {
    return this.intersect(other).isEmpty();
  }

  supersetOf(other: SquareSet): boolean {
    return other.diff(this).isEmpty();
  }

  subsetOf(other: SquareSet): boolean {
    return this.diff(other).isEmpty();
  }

  shr81(shift: number): SquareSet {
    if (shift >= 81) return SquareSet.empty();
    if (shift >= 54) return new SquareSet(this.hi >>> (shift - 54), 0, 0);
    if (shift >= 27)
      return new SquareSet((this.mid >>> (shift - 27)) ^ (this.hi << (54 - shift)), this.hi >>> (shift - 27), 0);
    if (shift > 0)
      return new SquareSet(
        (this.lo >>> shift) ^ (this.mid << (27 - shift)),
        (this.mid >>> shift) ^ (this.hi << (27 - shift)),
        this.hi >>> shift
      );
    return this;
  }

  shl81(shift: number): SquareSet {
    if (shift >= 81) return SquareSet.empty();
    if (shift >= 54) return new SquareSet(0, 0, this.lo << (shift - 54));
    if (shift >= 27)
      return new SquareSet(0, this.lo << (shift - 27), (this.mid << (shift - 27)) ^ (this.lo >>> (54 - shift)));
    if (shift > 0)
      return new SquareSet(
        this.lo << shift,
        (this.mid << shift) ^ (this.lo >>> (27 - shift)),
        (this.hi << shift) ^ (this.mid >>> (27 - shift))
      );
    return this;
  }

  bswap81(): SquareSet {
    return new SquareSet(rowSwap27(this.hi), rowSwap27(this.mid), rowSwap27(this.lo));
  }

  rbit81(): SquareSet {
    return new SquareSet(rbit27(this.hi), rbit27(this.mid), rbit27(this.lo));
  }

  minus81(other: SquareSet): SquareSet {
    const lo = this.lo - other.lo;
    const c = (lo & 0x8000000) >>> 27;
    const mid = this.mid - (other.mid + c);
    const c2 = (mid & 0x8000000) >>> 27;
    return new SquareSet(lo, mid, this.hi - (other.hi + c2));
  }

  equals(other: SquareSet): boolean {
    return this.lo === other.lo && this.mid === other.mid && this.hi === other.hi;
  }

  size(): number {
    return popcnt27(this.lo) + popcnt27(this.mid) + popcnt27(this.hi);
  }

  isEmpty(): boolean {
    return this.lo === 0 && this.mid === 0 && this.hi === 0;
  }

  nonEmpty(): boolean {
    return this.lo !== 0 || this.mid !== 0 || this.hi !== 0;
  }

  has(square: Square): boolean {
    if (square >= 81) return false;
    if (square >= 54) return (this.hi & (1 << (square - 54))) !== 0;
    if (square >= 27) return (this.mid & (1 << (square - 27))) !== 0;
    if (square >= 0) return (this.lo & (1 << square)) !== 0;
    return false;
  }

  set(square: Square, on: boolean): SquareSet {
    return on ? this.with(square) : this.without(square);
  }

  with(square: Square): SquareSet {
    if (square >= 54) return new SquareSet(this.lo, this.mid, this.hi | (1 << (square - 54)));
    if (square >= 27) return new SquareSet(this.lo, this.mid | (1 << (square - 27)), this.hi);
    if (square >= 0) return new SquareSet(this.lo | (1 << square), this.mid, this.hi);
    return this;
  }

  without(square: Square): SquareSet {
    if (square >= 54) return new SquareSet(this.lo, this.mid, this.hi & ~(1 << (square - 54)));
    if (square >= 27) return new SquareSet(this.lo, this.mid & ~(1 << (square - 27)), this.hi);
    if (square >= 0) return new SquareSet(this.lo & ~(1 << square), this.mid, this.hi);
    return this;
  }

  toggle(square: Square): SquareSet {
    if (square >= 54) return new SquareSet(this.lo, this.mid, this.hi ^ (1 << (square - 54)));
    if (square >= 27) return new SquareSet(this.lo, this.mid ^ (1 << (square - 27)), this.hi);
    if (square >= 0) return new SquareSet(this.lo ^ (1 << square), this.mid, this.hi);
    return this;
  }

  last(): Square | undefined {
    if (this.hi !== 0) return 80 - Math.clz32(this.hi) + 5;
    if (this.mid !== 0) return 53 - Math.clz32(this.mid) + 5;
    if (this.lo !== 0) return 26 - Math.clz32(this.lo) + 5;
    return;
  }

  first(): Square | undefined {
    if (this.lo !== 0) return 26 - Math.clz32(this.lo & -this.lo) + 5;
    if (this.mid !== 0) return 53 - Math.clz32(this.lo & -this.lo) + 5;
    if (this.hi !== 0) return 80 - Math.clz32(this.hi & -this.hi) + 5;
    return;
  }

  withoutFirst(): SquareSet {
    if (this.lo !== 0) return new SquareSet(this.lo & (this.lo - 1), this.mid, this.hi);
    if (this.mid !== 0) return new SquareSet(0, this.mid & (this.mid - 1), this.hi);
    return new SquareSet(0, 0, this.hi & (this.hi - 1));
  }

  moreThanOne(): boolean {
    return (
      (this.hi !== 0 && this.mid !== 0) ||
      (this.hi !== 0 && this.lo !== 0) ||
      (this.mid !== 0 && this.lo !== 0) ||
      (this.lo & (this.lo - 1)) !== 0 ||
      (this.mid & (this.mid - 1)) !== 0 ||
      (this.hi & (this.hi - 1)) !== 0
    );
  }

  singleSquare(): Square | undefined {
    return this.moreThanOne() ? undefined : this.last();
  }

  isSingleSquare(): boolean {
    return this.nonEmpty() && !this.moreThanOne();
  }

  *[Symbol.iterator](): Iterator<Square> {
    let lo = this.lo;
    let mid = this.mid;
    let hi = this.hi;
    while (lo !== 0) {
      const idx = 26 - Math.clz32(lo & -lo) + 5;
      lo ^= 1 << idx;
      yield idx;
    }
    while (mid !== 0) {
      const idx = 26 - Math.clz32(mid & -mid) + 5;
      mid ^= 1 << idx;
      yield 27 + idx;
    }
    while (hi !== 0) {
      const idx = 26 - Math.clz32(hi & -hi) + 5;
      hi ^= 1 << idx;
      yield 54 + idx;
    }
  }

  *reversed(): Iterable<Square> {
    let lo = this.lo;
    let mid = this.mid;
    let hi = this.hi;
    while (hi !== 0) {
      const idx = 26 - Math.clz32(hi) + 5;
      hi ^= 1 << idx;
      yield 54 + idx;
    }
    while (mid !== 0) {
      const idx = 26 - Math.clz32(mid) + 5;
      mid ^= 1 << idx;
      yield 27 + idx;
    }
    while (lo !== 0) {
      const idx = 26 - Math.clz32(lo) + 5;
      lo ^= 1 << idx;
      yield idx;
    }
  }
}
