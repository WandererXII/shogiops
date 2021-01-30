import { parseUsi, makeUsi } from '../src/util';

test('parse usi', () => {
  expect(parseUsi('9i1i')).toEqual({ from: 0, to: 8 });
  expect(parseUsi('2h2c+')).toEqual({ from: 16, to: 61, promotion: true });
  expect(parseUsi('2h2c=')).toEqual({ from: 16, to: 61, promotion: false });
  expect(parseUsi('2h2c')).toEqual({ from: 16, to: 61 });
  expect(parseUsi('P*1g')).toEqual({ role: 'pawn', to: 26 });
});

test('make usi', () => {
  expect(makeUsi({ role: 'rook', to: 1 })).toBe('R*8i');
  expect(makeUsi({ from: 2, to: 3 })).toBe('7i6i');
  expect(makeUsi({ from: 0, to: 0, promotion: true })).toBe('9i9i+');
});
