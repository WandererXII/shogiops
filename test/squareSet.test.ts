import { BitRows, SquareSet } from '../src/squareSet';

test('full set has all', () => {
  for (let square = 0; square < 256; square++) {
    expect(SquareSet.full().has(square)).toBe(true);
  }
});

test('empty set has none', () => {
  for (let square = 0; square < 256; square++) {
    expect(SquareSet.empty().has(square)).toBe(false);
  }
});

test('immutable', () => {
  const arr = [0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
  const n = new SquareSet(arr as BitRows);
  arr.reverse();
  arr[2] = 7;
  expect(n).toEqual(new SquareSet([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));

  const n2 = new SquareSet(arr as BitRows);
  expect(n2).not.toEqual(n);
});

test('fromSquare', () => {
  for (let square = 0; square < 256; square++) {
    expect(SquareSet.empty().with(square)).toEqual(SquareSet.fromSquare(square));
  }
});

test('fromSquares', () => {
  expect(SquareSet.fromSquares([])).toEqual(SquareSet.empty());
  expect(SquareSet.fromSquares([-1, -2, 256, 257])).toEqual(SquareSet.empty());
  expect(SquareSet.fromSquares([128])).toEqual(SquareSet.empty().with(128));
  expect(SquareSet.fromSquares([...Array(256).keys()])).toEqual(SquareSet.full());
});

test('fromRank', () => {
  expect(SquareSet.fromRank(0)).toEqual(new SquareSet([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(1)).toEqual(new SquareSet([0xffff0000, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(2)).toEqual(new SquareSet([0x0, 0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(3)).toEqual(new SquareSet([0x0, 0xffff0000, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(4)).toEqual(new SquareSet([0x0, 0x0, 0xffff, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(5)).toEqual(new SquareSet([0x0, 0x0, 0xffff0000, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(6)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0xffff, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(7)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0xffff0000, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(8)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0xffff, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(9)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0xffff0000, 0x0, 0x0, 0x0]));
  expect(SquareSet.fromRank(10)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0xffff, 0x0, 0x0]));
  expect(SquareSet.fromRank(11)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0xffff0000, 0x0, 0x0]));
  expect(SquareSet.fromRank(12)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff, 0x0]));
  expect(SquareSet.fromRank(13)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff0000, 0x0]));
  expect(SquareSet.fromRank(14)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff]));
  expect(SquareSet.fromRank(15)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff0000]));
});

test('fromFile', () => {
  expect(SquareSet.fromFile(0)).toEqual(
    new SquareSet([0x10001, 0x10001, 0x10001, 0x10001, 0x10001, 0x10001, 0x10001, 0x10001])
  );
  expect(SquareSet.fromFile(1)).toEqual(
    new SquareSet([0x20002, 0x20002, 0x20002, 0x20002, 0x20002, 0x20002, 0x20002, 0x20002])
  );
  expect(SquareSet.fromFile(2)).toEqual(
    new SquareSet([0x40004, 0x40004, 0x40004, 0x40004, 0x40004, 0x40004, 0x40004, 0x40004])
  );
  expect(SquareSet.fromFile(3)).toEqual(
    new SquareSet([0x80008, 0x80008, 0x80008, 0x80008, 0x80008, 0x80008, 0x80008, 0x80008])
  );
  expect(SquareSet.fromFile(4)).toEqual(
    new SquareSet([0x100010, 0x100010, 0x100010, 0x100010, 0x100010, 0x100010, 0x100010, 0x100010])
  );
  expect(SquareSet.fromFile(5)).toEqual(
    new SquareSet([0x200020, 0x200020, 0x200020, 0x200020, 0x200020, 0x200020, 0x200020, 0x200020])
  );
  expect(SquareSet.fromFile(6)).toEqual(
    new SquareSet([0x400040, 0x400040, 0x400040, 0x400040, 0x400040, 0x400040, 0x400040, 0x400040])
  );
  expect(SquareSet.fromFile(7)).toEqual(
    new SquareSet([0x800080, 0x800080, 0x800080, 0x800080, 0x800080, 0x800080, 0x800080, 0x800080])
  );
  expect(SquareSet.fromFile(8)).toEqual(
    new SquareSet([0x1000100, 0x1000100, 0x1000100, 0x1000100, 0x1000100, 0x1000100, 0x1000100, 0x1000100])
  );
  expect(SquareSet.fromFile(9)).toEqual(
    new SquareSet([0x2000200, 0x2000200, 0x2000200, 0x2000200, 0x2000200, 0x2000200, 0x2000200, 0x2000200])
  );
  expect(SquareSet.fromFile(10)).toEqual(
    new SquareSet([0x4000400, 0x4000400, 0x4000400, 0x4000400, 0x4000400, 0x4000400, 0x4000400, 0x4000400])
  );
  expect(SquareSet.fromFile(11)).toEqual(
    new SquareSet([0x8000800, 0x8000800, 0x8000800, 0x8000800, 0x8000800, 0x8000800, 0x8000800, 0x8000800])
  );
  expect(SquareSet.fromFile(12)).toEqual(
    new SquareSet([0x10001000, 0x10001000, 0x10001000, 0x10001000, 0x10001000, 0x10001000, 0x10001000, 0x10001000])
  );
  expect(SquareSet.fromFile(13)).toEqual(
    new SquareSet([0x20002000, 0x20002000, 0x20002000, 0x20002000, 0x20002000, 0x20002000, 0x20002000, 0x20002000])
  );
  expect(SquareSet.fromFile(14)).toEqual(
    new SquareSet([0x40004000, 0x40004000, 0x40004000, 0x40004000, 0x40004000, 0x40004000, 0x40004000, 0x40004000])
  );
  expect(SquareSet.fromFile(15)).toEqual(
    new SquareSet([0x80008000, 0x80008000, 0x80008000, 0x80008000, 0x80008000, 0x80008000, 0x80008000, 0x80008000])
  );
});

test('ranksAbove', () => {
  expect(SquareSet.ranksAbove(0)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.ranksAbove(1)).toEqual(new SquareSet([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.ranksAbove(2)).toEqual(new SquareSet([0xffffffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.ranksAbove(3)).toEqual(new SquareSet([0xffffffff, 0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.ranksAbove(4)).toEqual(new SquareSet([0xffffffff, 0xffffffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.ranksAbove(5)).toEqual(new SquareSet([0xffffffff, 0xffffffff, 0xffff, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.ranksAbove(6)).toEqual(new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0x0, 0x0, 0x0, 0x0, 0x0]));
  expect(SquareSet.ranksAbove(7)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffff, 0x0, 0x0, 0x0, 0x0])
  );
  expect(SquareSet.ranksAbove(8)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0x0, 0x0, 0x0, 0x0])
  );
  expect(SquareSet.ranksAbove(9)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffff, 0x0, 0x0, 0x0])
  );
  expect(SquareSet.ranksAbove(10)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0x0, 0x0, 0x0])
  );
  expect(SquareSet.ranksAbove(11)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffff, 0x0, 0x0])
  );
  expect(SquareSet.ranksAbove(12)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0x0, 0x0])
  );
  expect(SquareSet.ranksAbove(13)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffff, 0x0])
  );
  expect(SquareSet.ranksAbove(14)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0x0])
  );
  expect(SquareSet.ranksAbove(15)).toEqual(
    new SquareSet([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffff])
  );
});

test('ranksBelow', () => {
  expect(SquareSet.ranksBelow(0)).toEqual(
    new SquareSet([0xffff0000, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(1)).toEqual(
    new SquareSet([0x0, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(2)).toEqual(
    new SquareSet([0x0, 0xffff0000, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(3)).toEqual(
    new SquareSet([0x0, 0x0, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(4)).toEqual(
    new SquareSet([0x0, 0x0, 0xffff0000, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(5)).toEqual(
    new SquareSet([0x0, 0x0, 0x0, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(6)).toEqual(
    new SquareSet([0x0, 0x0, 0x0, 0xffff0000, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(7)).toEqual(
    new SquareSet([0x0, 0x0, 0x0, 0x0, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(8)).toEqual(
    new SquareSet([0x0, 0x0, 0x0, 0x0, 0xffff0000, 0xffffffff, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(9)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0xffffffff, 0xffffffff, 0xffffffff]));
  expect(SquareSet.ranksBelow(10)).toEqual(
    new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0xffff0000, 0xffffffff, 0xffffffff])
  );
  expect(SquareSet.ranksBelow(11)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffffffff, 0xffffffff]));
  expect(SquareSet.ranksBelow(12)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff0000, 0xffffffff]));
  expect(SquareSet.ranksBelow(13)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffffffff]));
  expect(SquareSet.ranksBelow(14)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff0000]));
  expect(SquareSet.ranksBelow(15)).toEqual(new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]));
});

test('logical operators', () => {
  expect(SquareSet.empty().complement()).toEqual(SquareSet.full());
  expect(SquareSet.full().complement()).toEqual(SquareSet.empty());
  expect(SquareSet.full().xor(SquareSet.empty())).toEqual(SquareSet.full());
  expect(SquareSet.full().xor(SquareSet.full())).toEqual(SquareSet.empty());
  expect(SquareSet.full().union(SquareSet.empty())).toEqual(SquareSet.full());
  expect(SquareSet.full().intersect(SquareSet.full())).toEqual(SquareSet.full());
  expect(SquareSet.full().intersect(SquareSet.empty())).toEqual(SquareSet.empty());

  for (let square = 0; square < 256; square++) {
    expect(SquareSet.full().intersect(SquareSet.fromSquare(square))).toEqual(
      SquareSet.full().without(square).xor(SquareSet.full())
    );
  }
});

test('shr256', () => {
  const r = new SquareSet([0x180, 0x180, 0x180, 0x0, 0x0, 0x180, 0x180, 0x180]);
  expect(r.shr256(0)).toEqual(r);
  expect(r.shr256(1)).toEqual(new SquareSet([0xc0, 0xc0, 0xc0, 0x0, 0x0, 0xc0, 0xc0, 0xc0]));
  const bigS = new SquareSet([0x42003c0, 0x8100810, 0x4000800, 0x1000200, 0x400080, 0x100020, 0x8100010, 0x3c00420]);
  expect(bigS.shr256(32)).toEqual(
    new SquareSet([0x8100810, 0x4000800, 0x1000200, 0x400080, 0x100020, 0x8100010, 0x3c00420, 0x0])
  );
  const s = new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80000000]);
  for (let i = 0; i < 256; i++) {
    expect(s.shr256(i)).toEqual(SquareSet.empty().with(255 - i));
  }
});

test('shl256', () => {
  const r = new SquareSet([0x180, 0x180, 0x180, 0x0, 0x0, 0x180, 0x180, 0x180]);
  expect(r.shl256(0)).toEqual(r);
  expect(r.shl256(1)).toEqual(new SquareSet([0x300, 0x300, 0x300, 0x0, 0x0, 0x300, 0x300, 0x300]));

  expect(new SquareSet([0x1, 0x8000, 0x10000, 0x80000000, 0x0, 0x0, 0x0, 0x80000000]).shl256(1)).toEqual(
    new SquareSet([0x2, 0x10000, 0x20000, 0x0, 0x1, 0x0, 0x0, 0x0])
  );

  const bigS = new SquareSet([0x42003c0, 0x8100810, 0x4000800, 0x1000200, 0x400080, 0x100020, 0x8100010, 0x3c00420]);

  expect(bigS.shl256(1)).toEqual(
    new SquareSet([0x8400780, 0x10201020, 0x8001000, 0x2000400, 0x800100, 0x200040, 0x10200020, 0x7800840])
  );
  expect(bigS.shl256(32)).toEqual(
    new SquareSet([0x0, 0x42003c0, 0x8100810, 0x4000800, 0x1000200, 0x400080, 0x100020, 0x8100010])
  );
  expect(bigS.shl256(255)).toEqual(SquareSet.empty());
  const s = new SquareSet([0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
  for (let i = 0; i < 256; i++) {
    expect(s.shl256(i)).toEqual(SquareSet.empty().with(i));
  }
});

test('rowswap', () => {
  expect(SquareSet.full().rowSwap256()).toEqual(SquareSet.full());
  expect(SquareSet.empty().rowSwap256()).toEqual(SquareSet.empty());
  expect(new SquareSet([0xffff, 0xffff0000, 0x0, 0xf000, 0x0, 0x0, 0x0, 0x0]).rowSwap256()).toEqual(
    new SquareSet([0x0, 0x0, 0x0, 0x0, 0xf0000000, 0x0, 0xffff, 0xffff0000])
  );
});

test('rbit256', () => {
  expect(SquareSet.full().rbit256()).toEqual(SquareSet.full());
  expect(SquareSet.empty().rbit256()).toEqual(SquareSet.empty());
  const random1 = [0xc8866bcd, 0x1ec29f93, 0xf5ddebe3, 0x8f0ada65, 0x373d2c52, 0xa6a16ef5, 0x8d1f9954, 0x4ab3e8c7];
  expect(new SquareSet(random1 as BitRows).rbit256()).toEqual(
    new SquareSet(
      [...random1]
        .reverse()
        .map(n => n.toString(2).padStart(32, '0').split('').reverse().join(''))
        .map(s => parseInt(s, 2)) as BitRows
    )
  );
  const random2 = [0x83b5bee6, 0x19bf9b6c, 0x0e6c109c, 0x6d21e29b, 0x95cc034c, 0x5b8e8497, 0xe2758b39, 0xfa201e44];
  expect(new SquareSet(random2 as BitRows).rbit256()).toEqual(
    new SquareSet(
      [...random2]
        .reverse()
        .map(n => n.toString(2).padStart(32, '0').split('').reverse().join(''))
        .map(s => parseInt(s, 2)) as BitRows
    )
  );
});

test('minus256', () => {
  const s1 = new SquareSet([0xc8866bcd, 0x1ec29f93, 0xf5ddebe3, 0, 0, 0, 0, 0]);
  const s2 = new SquareSet([0x83b5bee6, 0x19bf9b6c, 0x0e6c109c, 0, 0, 0, 0, 0]);
  const res = new SquareSet([0x44d0ace7, 0x05030427, 0xe771db47, 0, 0, 0, 0, 0]);
  expect(s1.minus256(s2)).toEqual(res);

  const t1 = new SquareSet([
    0xae7be866, 0x5c3adbe4, 0x88f2d2f5, 0xaf172af7, 0xe814a99f, 0x342a0ae6, 0x84e17eb1, 0xcde11efa,
  ]);
  const t2 = new SquareSet([
    0x5560d838, 0xa53e9a7b, 0xdeafb45d, 0x9f4b4dc9, 0x4b3b08a, 0xec18deef, 0xb27684b5, 0xf9bf854f,
  ]);
  const res2 = new SquareSet([
    0x591b102e, 0xb6fc4169, 0xaa431e97, 0x0fcbdd2d, 0xe360f915, 0x48112bf7, 0xd26af9fb, 0xd42199aa,
  ]);
  expect(t1.minus256(t2)).toEqual(res2);
});

test('equals', () => {
  expect(new SquareSet([3017171219, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])).toEqual(
    new SquareSet([-1277796077, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
  );
});

test('size', () => {
  let squares = SquareSet.empty();
  expect(squares.size()).toBe(0);
  expect(squares.nonEmpty()).toBe(false);
  expect(squares.isEmpty()).toBe(true);
  for (let i = 0; i < 256; i++) {
    squares = squares.with(i);
    expect(squares.size()).toBe(i + 1);
    expect(squares.isEmpty()).toBe(false);
    expect(squares.nonEmpty()).toBe(true);
  }
  for (let i = 255; i >= 0; i--) {
    squares = squares.without(i);
    expect(squares.size()).toBe(i);
  }
});

test('with/without many', () => {
  expect(SquareSet.empty().withMany([0, 1, 2])).toEqual(SquareSet.empty().with(0).with(1).with(2));
  expect(SquareSet.empty().with(0).with(1).with(2).withoutMany([0, 1, 2])).toEqual(SquareSet.empty());
  expect(SquareSet.full().withoutMany([...Array(256).keys()])).toEqual(SquareSet.empty());
  expect(SquareSet.empty().withMany([...Array(256).keys()])).toEqual(SquareSet.full());
});

test('first/last', () => {
  let squares = SquareSet.empty();
  expect(squares.last()).toBeUndefined;
  for (let i = 0; i < 256; i++) {
    squares = squares.with(i);
    expect(squares.first()).toBe(0);
    expect(squares.last()).toBe(i);
  }
  squares = SquareSet.empty();
  for (let i = 255; i >= 0; i--) {
    squares = squares.with(i);
    expect(squares.first()).toBe(i);
    expect(squares.last()).toBe(255);
  }
});

test('without first', () => {
  expect(new SquareSet([0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x01, 0x0]).withoutFirst()).toEqual(
    new SquareSet([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x01, 0x0])
  );
  expect(new SquareSet([0x0, 0x7, 0x0, 0x0, 0x0, 0x0, 0x01, 0x0]).withoutFirst()).toEqual(
    new SquareSet([0x0, 0x6, 0x0, 0x0, 0x0, 0x0, 0x01, 0x0])
  );
});

test('more than one', () => {
  expect(new SquareSet([0, 0, 0, 0, 0, 0, 0, 0]).moreThanOne()).toBe(false);

  expect(new SquareSet([1, 0, 0, 0, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 1, 0, 0, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 1, 0, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 1, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 1, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 0, 1, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 0, 0, 1, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 0, 0, 0, 1]).moreThanOne()).toBe(false);

  expect(new SquareSet([2, 0, 0, 0, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 4, 0, 0, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 8, 0, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 16, 0, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 2, 0, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 0, 4, 0, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 0, 0, 8, 0]).moreThanOne()).toBe(false);
  expect(new SquareSet([0, 0, 0, 0, 0, 0, 0, 16]).moreThanOne()).toBe(false);

  expect(new SquareSet([1, 0, 0, 0, 1, 0, 0, 0]).moreThanOne()).toBe(true);
  expect(new SquareSet([2, 0, 0, 0, 1, 0, 0, 0]).moreThanOne()).toBe(true);
  expect(new SquareSet([2, 0, 0, 0, 0, 0, 0, 16]).moreThanOne()).toBe(true);
  expect(new SquareSet([7, 0, 0, 0, 0, 0, 0, 1]).moreThanOne()).toBe(true);
  expect(new SquareSet([7, 0, 0, 0, 0, 0, 0, 0]).moreThanOne()).toBe(true);
  expect(new SquareSet([123, 0, 0, 0, 0, 0, 0, 0]).moreThanOne()).toBe(true);
});

test('single square', () => {
  expect(new SquareSet([0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]).isSingleSquare()).toBe(true);
  expect(new SquareSet([0x01, 0x0, 0x0, 0x0, 0x01, 0x0, 0x0, 0x0]).isSingleSquare()).toBe(false);
  expect(new SquareSet([0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]).isSingleSquare()).toBe(false);
  expect(new SquareSet([0x01, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]).singleSquare()).toBe(0);
  expect(new SquareSet([0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]).singleSquare()).toBeUndefined;
});

test('iterators', () => {
  const full = SquareSet.full();
  expect(full.size()).toBe(256);
  let i = 0;
  for (const s of full) {
    expect(s).toBe(i++);
  }
  for (const s of full.reversed()) {
    expect(s).toBe(--i);
  }
});
