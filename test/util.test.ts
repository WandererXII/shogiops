import { makePieceName, makeUsi, parsePieceName, parseSquare, parseUsi, squareFile, squareRank } from '../src/util';

test('square coordinates', () => {
  expect(squareFile(0)).toBe(0);
  expect(squareFile(1)).toBe(1);
  expect(squareFile(15)).toBe(15);
  expect(squareFile(16)).toBe(0);
  expect(squareFile(31)).toBe(15);
  expect(squareFile(32)).toBe(0);
  expect(squareFile(240)).toBe(0);
  expect(squareFile(255)).toBe(15);

  expect(squareRank(0)).toBe(0);
  expect(squareRank(1)).toBe(0);
  expect(squareRank(15)).toBe(0);
  expect(squareRank(16)).toBe(1);
  expect(squareRank(31)).toBe(1);
  expect(squareRank(32)).toBe(2);
  expect(squareRank(239)).toBe(14);
  expect(squareRank(255)).toBe(15);
});

test('parse squares', () => {
  expect(parseSquare('1a')).toEqual(0);
  expect(parseSquare('16a')).toEqual(15);
  expect(parseSquare('1b')).toEqual(16);
  expect(parseSquare('1c')).toEqual(32);
  expect(parseSquare('3c')).toEqual(34);
  expect(parseSquare('16o')).toEqual(239);
  expect(parseSquare('1p')).toEqual(240);
  expect(parseSquare('16p')).toEqual(255);
});

test('parse usi', () => {
  expect(parseUsi('1a9a')).toEqual({ from: 0, to: 8, promotion: false });
  expect(parseUsi('2h2c+')).toEqual({ from: 113, to: 33, promotion: true });
  // Is it even valid usi with '=' at the end?
  expect(parseUsi('2h2c=')).toEqual({ from: 113, to: 33, promotion: false });
  expect(parseUsi('2h2c')).toEqual({ from: 113, to: 33, promotion: false });
  expect(parseUsi('P*1g')).toEqual({ role: 'pawn', to: 96 });
  expect(parseUsi('Z*1g')).toBeUndefined;
  expect(parseUsi('P*16a')).toEqual({ role: 'pawn', to: 15 });
  expect(parseUsi('P*16p')).toEqual({ role: 'pawn', to: 255 });
  expect(parseUsi('1a16p')).toEqual({ from: 0, to: 255, promotion: false });
  expect(parseUsi('1a16p+')).toEqual({ from: 0, to: 255, promotion: true });
  expect(parseUsi('16o16p')).toEqual({ from: 239, to: 255, promotion: false });
  expect(parseUsi('16o16p+')).toEqual({ from: 239, to: 255, promotion: true });
  expect(parseUsi('16p1a')).toEqual({ from: 255, to: 0, promotion: false });
  expect(parseUsi('16p1a+')).toEqual({ from: 255, to: 0, promotion: true });
  // with midstep
  expect(parseUsi('1a1a1a')).toEqual({ from: 0, to: 0, midStep: 0, promotion: false });
  expect(parseUsi('1a1a1a=')).toEqual({ from: 0, to: 0, midStep: 0, promotion: false });
  expect(parseUsi('1a1a1a+')).toEqual({ from: 0, to: 0, midStep: 0, promotion: true });
  expect(parseUsi('16p16p16p')).toEqual({ from: 255, to: 255, midStep: 255, promotion: false });
  expect(parseUsi('16p16p16p=')).toEqual({ from: 255, to: 255, midStep: 255, promotion: false });
  expect(parseUsi('16p16p16p+')).toEqual({ from: 255, to: 255, midStep: 255, promotion: true });
});

test('make usi', () => {
  expect(makeUsi({ role: 'rook', to: 1 })).toBe('R*2a');
  expect(makeUsi({ from: 1, to: 2 })).toBe('2a3a');
  expect(makeUsi({ from: 2, to: 3 })).toBe('3a4a');
  expect(makeUsi({ from: 15, to: 16 })).toBe('16a1b');
  expect(makeUsi({ from: 0, to: 240 })).toBe('1a1p');
  expect(makeUsi({ from: 0, to: 254 })).toBe('1a15p');
  expect(makeUsi({ from: 0, to: 255 })).toBe('1a16p');
  expect(makeUsi({ from: 0, to: 0, promotion: true })).toBe('1a1a+');
  expect(makeUsi({ from: 0, to: 0, promotion: false })).toBe('1a1a');
  expect(makeUsi({ from: 0, to: 0, promotion: undefined })).toBe('1a1a');
  // with midstep
  expect(makeUsi({ from: 0, to: 0, midStep: 255 })).toBe('1a1a16p');
  expect(makeUsi({ from: 0, to: 0, midStep: 255, promotion: true })).toBe('1a1a16p+');
});

test('piece name', () => {
  expect(makePieceName({ role: 'rook', color: 'sente' })).toEqual('sente rook');
  expect(parsePieceName('sente rook')).toEqual({ color: 'sente', role: 'rook' });
  expect(parsePieceName('gote bishop')).toEqual({ color: 'gote', role: 'bishop' });
});
