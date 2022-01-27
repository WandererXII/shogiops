import { Square } from './types';

function popcnt32(n: number): number {
  n = n - ((n >>> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
  return Math.imul((n + (n >>> 4)) & 0x0f0f0f0f, 0x01010101) >> 24;
}

function bswap32(n: number): number {
  n = ((n >>> 8) & 0x00ff00ff) | ((n & 0x00ff00ff) << 8);
  return rowSwap32(n);
}

function rowSwap32(n: number): number {
  return ((n >>> 16) & 0xffff) | ((n & 0xffff) << 16);
}

function rbit32(n: number): number {
  n = ((n >>> 1) & 0x55555555) | ((n & 0x55555555) << 1);
  n = ((n >>> 2) & 0x33333333) | ((n & 0x33333333) << 2);
  n = ((n >>> 4) & 0x0f0f0f0f) | ((n & 0x0f0f0f0f) << 4);
  return bswap32(n);
}

export type BitRows = [number, number, number, number, number, number, number, number];

// Coordination system starts at top right - square 0
// Assumes POV of sente player - up is smaller rank, down is greater rank, left is smaller file, right is greater file
// Each element represents two ranks - board size 16x16
export class LargeSquareSet implements Iterable<Square> {
  constructor(readonly dRows: BitRows) {
    this.dRows = [...dRows];
  }

  static full(): LargeSquareSet {
    return new LargeSquareSet([
      0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff,
    ]);
  }

  static empty(): LargeSquareSet {
    return new LargeSquareSet([0, 0, 0, 0, 0, 0, 0, 0]);
  }

  static fromSquare(square: Square): LargeSquareSet {
    if (square >= 256 || square < 0) return LargeSquareSet.empty();
    const newRows: BitRows = [0, 0, 0, 0, 0, 0, 0, 0];
    const index = square >>> 5;
    newRows[index] = 1 << (square - index * 32);
    return new LargeSquareSet(newRows);
  }

  static fromRank(rank: number): LargeSquareSet {
    return new LargeSquareSet([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]).shl256(16 * rank);
  }

  static fromFile(file: number): LargeSquareSet {
    return new LargeSquareSet([
      0x10001 << file,
      0x10001 << file,
      0x10001 << file,
      0x10001 << file,
      0x10001 << file,
      0x10001 << file,
      0x10001 << file,
      0x10001 << file,
    ]);
  }

  static ranksAbove(rank: number): LargeSquareSet {
    return LargeSquareSet.full().shr256(16 * (16 - rank));
  }

  static ranksBelow(rank: number): LargeSquareSet {
    return LargeSquareSet.full().shl256(16 * (rank + 1));
  }

  complement(): LargeSquareSet {
    return new LargeSquareSet([
      ~this.dRows[0],
      ~this.dRows[1],
      ~this.dRows[2],
      ~this.dRows[3],
      ~this.dRows[4],
      ~this.dRows[5],
      ~this.dRows[6],
      ~this.dRows[7],
    ]);
  }

  xor(other: LargeSquareSet): LargeSquareSet {
    return new LargeSquareSet([
      this.dRows[0] ^ other.dRows[0],
      this.dRows[1] ^ other.dRows[1],
      this.dRows[2] ^ other.dRows[2],
      this.dRows[3] ^ other.dRows[3],
      this.dRows[4] ^ other.dRows[4],
      this.dRows[5] ^ other.dRows[5],
      this.dRows[6] ^ other.dRows[6],
      this.dRows[7] ^ other.dRows[7],
    ]);
  }

  union(other: LargeSquareSet): LargeSquareSet {
    return new LargeSquareSet([
      this.dRows[0] | other.dRows[0],
      this.dRows[1] | other.dRows[1],
      this.dRows[2] | other.dRows[2],
      this.dRows[3] | other.dRows[3],
      this.dRows[4] | other.dRows[4],
      this.dRows[5] | other.dRows[5],
      this.dRows[6] | other.dRows[6],
      this.dRows[7] | other.dRows[7],
    ]);
  }

  intersect(other: LargeSquareSet): LargeSquareSet {
    return new LargeSquareSet([
      this.dRows[0] & other.dRows[0],
      this.dRows[1] & other.dRows[1],
      this.dRows[2] & other.dRows[2],
      this.dRows[3] & other.dRows[3],
      this.dRows[4] & other.dRows[4],
      this.dRows[5] & other.dRows[5],
      this.dRows[6] & other.dRows[6],
      this.dRows[7] & other.dRows[7],
    ]);
  }

  diff(other: LargeSquareSet): LargeSquareSet {
    return new LargeSquareSet([
      this.dRows[0] & ~other.dRows[0],
      this.dRows[1] & ~other.dRows[1],
      this.dRows[2] & ~other.dRows[2],
      this.dRows[3] & ~other.dRows[3],
      this.dRows[4] & ~other.dRows[4],
      this.dRows[5] & ~other.dRows[5],
      this.dRows[6] & ~other.dRows[6],
      this.dRows[7] & ~other.dRows[7],
    ]);
  }

  intersects(other: LargeSquareSet): boolean {
    return this.intersect(other).nonEmpty();
  }

  isDisjoint(other: LargeSquareSet): boolean {
    return this.intersect(other).isEmpty();
  }

  supersetOf(other: LargeSquareSet): boolean {
    return other.diff(this).isEmpty();
  }

  subsetOf(other: LargeSquareSet): boolean {
    return this.diff(other).isEmpty();
  }

  // right and up
  shr256(shift: number): LargeSquareSet {
    if (shift >= 256) return LargeSquareSet.empty();
    if (shift > 0) {
      const newRows: BitRows = [0, 0, 0, 0, 0, 0, 0, 0];
      const cutoff = shift >>> 5;
      const shift1 = shift & 0x1f;
      const shift2 = 32 - shift1;

      for (let i = 0; i < 8 - cutoff; i++) {
        newRows[i] = this.dRows[i + cutoff] >>> shift1;
        if (shift2 < 32) newRows[i] ^= this.dRows[i + cutoff + 1] << shift2;
      }
      return new LargeSquareSet(newRows);
    }
    return this;
  }

  // left and down
  shl256(shift: number): LargeSquareSet {
    if (shift >= 256) return LargeSquareSet.empty();
    if (shift > 0) {
      const newRows: BitRows = [0, 0, 0, 0, 0, 0, 0, 0];
      const cutoff = shift >>> 5;
      const shift1 = shift & 0x1f;
      const shift2 = 32 - shift1;

      for (let i = cutoff; i < 8; i++) {
        newRows[i] = this.dRows[i - cutoff] << shift1;
        if (shift2 < 32) newRows[i] ^= this.dRows[i - cutoff - 1] >>> shift2;
      }
      return new LargeSquareSet(newRows);
    }
    return this;
  }

  rowSwap256(): LargeSquareSet {
    return new LargeSquareSet([
      rowSwap32(this.dRows[7]),
      rowSwap32(this.dRows[6]),
      rowSwap32(this.dRows[5]),
      rowSwap32(this.dRows[4]),
      rowSwap32(this.dRows[3]),
      rowSwap32(this.dRows[2]),
      rowSwap32(this.dRows[1]),
      rowSwap32(this.dRows[0]),
    ]);
  }

  rbit256(): LargeSquareSet {
    return new LargeSquareSet([
      rbit32(this.dRows[7]),
      rbit32(this.dRows[6]),
      rbit32(this.dRows[5]),
      rbit32(this.dRows[4]),
      rbit32(this.dRows[3]),
      rbit32(this.dRows[2]),
      rbit32(this.dRows[1]),
      rbit32(this.dRows[0]),
    ]);
  }

  minus256(other: LargeSquareSet): LargeSquareSet {
    let c = 0;
    const newRows: BitRows = [...this.dRows];

    for (let i = 0; i < 8; i++) {
      const otherWithC = other.dRows[i] + c;
      newRows[i] -= otherWithC;
      c = ((newRows[i] & otherWithC & 1) + (otherWithC >>> 1) + (newRows[i] >>> 1)) >>> 31;
    }
    return new LargeSquareSet(newRows);
  }

  equals(other: LargeSquareSet): boolean {
    return this.dRows.every((value, index) => value === other.dRows[index]);
  }

  size(): number {
    return this.dRows.reduce((prev, cur) => prev + popcnt32(cur), 0);
  }

  isEmpty(): boolean {
    return !this.nonEmpty();
  }

  nonEmpty(): boolean {
    return this.dRows.some(r => r !== 0);
  }

  has(square: Square): boolean {
    if (square >= 256) return false;
    if (square >= 0) {
      const index = square >>> 5;
      return (this.dRows[index] & (1 << (square - 32 * index))) !== 0;
    }
    return false;
  }

  set(square: Square, on: boolean): LargeSquareSet {
    return on ? this.with(square) : this.without(square);
  }

  with(square: Square): LargeSquareSet {
    if (square >= 256 || square < 0) return this;
    const index = square >>> 5;
    const newDRows: BitRows = [...this.dRows];
    newDRows[index] = newDRows[index] | (1 << (square - index * 32));
    return new LargeSquareSet(newDRows);
  }

  without(square: Square): LargeSquareSet {
    if (square >= 256 || square < 0) return this;
    const index = square >>> 5;
    const newDRows: BitRows = [...this.dRows];
    newDRows[index] = newDRows[index] & ~(1 << (square - index * 32));
    return new LargeSquareSet(newDRows);
  }

  toggle(square: Square): LargeSquareSet {
    if (square >= 256 || square < 0) return this;
    const index = square >>> 5;
    const newDRows: BitRows = [...this.dRows];
    newDRows[index] = newDRows[index] ^ (1 << (square - index * 32));
    return new LargeSquareSet(newDRows);
  }

  first(): Square | undefined {
    for (let i = 0; i < 8; i++) {
      if (this.dRows[i] !== 0) return (i + 1) * 32 - 1 - Math.clz32(this.dRows[i] & -this.dRows[i]);
    }
    return;
  }

  last(): Square | undefined {
    for (let i = 7; i >= 0; i--) {
      if (this.dRows[i] !== 0) return (i + 1) * 32 - 1 - Math.clz32(this.dRows[i]);
    }
    return;
  }

  withoutFirst(): LargeSquareSet {
    const newDRows: BitRows = [...this.dRows];
    for (let i = 0; i < 8; i++) {
      if (this.dRows[i] !== 0) {
        newDRows[i] = newDRows[i] & (newDRows[i] - 1);
        return new LargeSquareSet(newDRows);
      }
    }
    return this;
  }

  moreThanOne(): boolean {
    const occ = this.dRows.filter(r => r !== 0);
    return occ.length > 1 || occ.some(r => (r & (r - 1)) !== 0);
  }

  singleSquare(): Square | undefined {
    return this.moreThanOne() ? undefined : this.last();
  }

  isSingleSquare(): boolean {
    return this.nonEmpty() && !this.moreThanOne();
  }

  visual(): string {
    let str = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 15; x >= 0; x--) {
        const sq = 32 * y + x;
        str += this.has(sq) ? ' 1' : ' 0';
        str += sq % 16 === 0 ? '\n' : '';
      }
      for (let x = 31; x >= 16; x--) {
        const sq = 32 * y + x;
        str += this.has(sq) ? ' 1' : ' 0';
        str += sq % 16 === 0 ? '\n' : '';
      }
    }
    return str;
  }

  *[Symbol.iterator](): Iterator<Square> {
    for (let i = 0; i < 8; i++) {
      let tmp = this.dRows[i];
      while (tmp !== 0) {
        const idx = 31 - Math.clz32(tmp & -tmp);
        tmp ^= 1 << idx;
        yield 32 * i + idx;
      }
    }
  }

  *reversed(): Iterable<Square> {
    for (let i = 7; i >= 0; i--) {
      let tmp = this.dRows[i];
      while (tmp !== 0) {
        const idx = 31 - Math.clz32(tmp);
        tmp ^= 1 << idx;
        yield 32 * i + idx;
      }
    }
  }
}
