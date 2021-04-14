import { Shogi } from '../src/shogi';
import {
  chessCoord,
  shogiCoord,
  shogigroundDests,
  parseLishogiUci,
  makeLishogiUci,
  assureUsi,
  assureLishogiUci,
  scalashogiCharPair,
} from '../src/compat';
import { parseUsi } from '../src/util';

test('scalashogiCharPair', () => {
  expect(scalashogiCharPair(parseUsi('1g1f')!)).toEqual('<E');
  expect(scalashogiCharPair(parseUsi('7c7d')!)).toEqual('ZQ');
  expect(scalashogiCharPair(parseUsi('7g7f')!)).toEqual('6?');
  expect(scalashogiCharPair(parseUsi('3c3d')!)).toEqual('^U');
  expect(scalashogiCharPair(parseUsi('8h2b+')!)).toEqual(',è');
  expect(scalashogiCharPair(parseUsi('3a2b')!)).toEqual('ph');
  expect(scalashogiCharPair(parseUsi('B*5e')!)).toEqual('Jô');
  expect(scalashogiCharPair(parseUsi('L*1a')!)).toEqual('rù');
  expect(scalashogiCharPair(parseUsi('S*1i')!)).toEqual('*ø');
  expect(scalashogiCharPair(parseUsi('P*1g')!)).toEqual('<ö');
});

test('shogiground dests', () => {
  const pos = Shogi.default();
  const dests = shogigroundDests(pos);
  expect(dests.get('c3')).toContain('c4');
  expect(dests.get('e1')).toContain('d2');
  expect(dests.get('e1')).not.toContain('d1');
});

test('chess coord', () => {
  expect(chessCoord('a1')).toEqual('a1');
  expect(chessCoord('9i')).toEqual('a1');
  expect(chessCoord('i9')).toEqual('i9');
  expect(chessCoord('i9')).toEqual('i9');
  expect(chessCoord('e5')).toEqual('e5');
  expect(chessCoord('5e')).toEqual('e5');
  expect(chessCoord('d7')).toEqual('d7');
  expect(chessCoord('6c')).toEqual('d7');
});

test('shogi coord', () => {
  expect(shogiCoord('9i')).toEqual('9i');
  expect(shogiCoord('a1')).toEqual('9i');
  expect(shogiCoord('1a')).toEqual('1a');
  expect(shogiCoord('i9')).toEqual('1a');
  expect(shogiCoord('5e')).toEqual('5e');
  expect(shogiCoord('e5')).toEqual('5e');
  expect(shogiCoord('6c')).toEqual('6c');
  expect(shogiCoord('d7')).toEqual('6c');
});

test('parse lishogi uci', () => {
  expect(parseLishogiUci('a1i1')).toEqual({ from: 0, to: 8, promotion: false });
  expect(parseLishogiUci('h2h7+')).toEqual({ from: 16, to: 61, promotion: true });
  expect(parseLishogiUci('h2h7=')).toEqual({ from: 16, to: 61, promotion: false });
  expect(parseLishogiUci('h2h7')).toEqual({ from: 16, to: 61, promotion: false });
  expect(parseLishogiUci('P*i3')).toEqual({ role: 'pawn', to: 26 });
});

test('make lishogi uci', () => {
  expect(makeLishogiUci({ role: 'rook', to: 1 })).toBe('R*b1');
  expect(makeLishogiUci({ from: 2, to: 3 })).toBe('c1d1');
  expect(makeLishogiUci({ from: 0, to: 0, promotion: true })).toBe('a1a1+');
  expect(makeLishogiUci({ from: 0, to: 0, promotion: false })).toBe('a1a1');
  expect(makeLishogiUci({ from: 0, to: 0, promotion: undefined })).toBe('a1a1');
});

test('assure usi/uci', () => {
  expect(assureUsi('7g7f')).toBe('7g7f');
  expect(assureUsi('c3c4')).toBe('7g7f');
  expect(assureUsi('P*1a')).toBe('P*1a');
  expect(assureUsi('P*i9')).toBe('P*1a');
  expect(assureLishogiUci('c3c4')).toBe('c3c4');
  expect(assureLishogiUci('7g7f')).toBe('c3c4');
  expect(assureLishogiUci('P*i9')).toBe('P*i9');
  expect(assureLishogiUci('P*1a')).toBe('P*i9');
});
