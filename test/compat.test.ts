import { Shogi } from '../src/shogi';
import {
  chessCoord,
  shogiCoord,
  shogigroundDests,
  parseUsi,
  makeUsi,
  assureUsi,
  assureUsi,
  scalashogiCharPair,
  shogigroundDropDests,
} from '../src/compat';
import { parseUsi } from '../src/util';
import { parseFen } from '../src/fen';

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

test('shogiground drop dests', () => {
  const dests1 = shogigroundDropDests(Shogi.default());
  expect(dests1.get('pawn')).toEqual(undefined);

  const pos2 = Shogi.fromSetup(parseFen('9/9/5k3/9/9/9/9/4K4/9 b N 1').unwrap()).unwrap();
  const dests2 = shogigroundDropDests(pos2);
  expect(dests2.get('knight')).toContain('e1');
  expect(dests2.get('knight')).not.toContain('e2');
  expect(dests2.get('knight')).toContain('e3');
  expect(dests2.get('knight')).toContain('e7');
  expect(dests2.get('knight')).not.toContain('e8');
  expect(dests2.get('knight')).not.toContain('e9');
  expect(dests2.get('knight')).not.toContain('f7');

  const pos3 = Shogi.fromSetup(parseFen('3rkr3/9/8p/4N4/1B7/9/1SG6/1KS6/9 b LPp 1').unwrap()).unwrap();
  const dests3 = shogigroundDropDests(pos3);
  const dests4 = shogigroundDropDests(pos3, 'pawn');
  expect(dests3.get('pawn')).toContain('e7');
  expect(dests4.get('pawn')).toContain('e7');
  expect(dests3.get('pawn')).not.toContain('e8');
  expect(dests4.get('pawn')).not.toContain('e8');
  expect(dests3.get('lance')).toContain('e8');
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

test('parse lishogi usi', () => {
  expect(parseUsi('a1i1')).toEqual({ from: 0, to: 8, promotion: false });
  expect(parseUsi('h2h7+')).toEqual({ from: 16, to: 61, promotion: true });
  expect(parseUsi('h2h7=')).toEqual({ from: 16, to: 61, promotion: false });
  expect(parseUsi('h2h7')).toEqual({ from: 16, to: 61, promotion: false });
  expect(parseUsi('P*i3')).toEqual({ role: 'pawn', to: 26 });
});

test('make lishogi usi', () => {
  expect(makeUsi({ role: 'rook', to: 1 })).toBe('R*b1');
  expect(makeUsi({ from: 2, to: 3 })).toBe('c1d1');
  expect(makeUsi({ from: 0, to: 0, promotion: true })).toBe('a1a1+');
  expect(makeUsi({ from: 0, to: 0, promotion: false })).toBe('a1a1');
  expect(makeUsi({ from: 0, to: 0, promotion: undefined })).toBe('a1a1');
});

test('assure usi/usi', () => {
  expect(assureUsi('7g7f')).toBe('7g7f');
  expect(assureUsi('c3c4')).toBe('7g7f');
  expect(assureUsi('P*1a')).toBe('P*1a');
  expect(assureUsi('P*i9')).toBe('P*1a');
  expect(assureUsi('c3c4')).toBe('c3c4');
  expect(assureUsi('7g7f')).toBe('c3c4');
  expect(assureUsi('P*i9')).toBe('P*i9');
  expect(assureUsi('P*1a')).toBe('P*i9');
});
