import { Shogi } from '../src/shogi';
import { shogigroundDests, scalashogiCharPair, shogigroundDropDests } from '../src/compat';
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
  expect(dests.get('7g')).toContain('7f');
  expect(dests.get('5i')).toContain('6h');
  expect(dests.get('5i')).not.toContain('6i');
});

test('shogiground drop dests', () => {
  const dests1 = shogigroundDropDests(Shogi.default());
  expect(dests1.get('pawn')).toEqual(undefined);

  const pos2 = Shogi.fromSetup(parseFen('9/9/5k3/9/9/9/9/4K4/9 b N 1').unwrap()).unwrap();
  const dests2 = shogigroundDropDests(pos2);
  expect(dests2.get('knight')).toContain('5i');
  expect(dests2.get('knight')).not.toContain('5h');
  expect(dests2.get('knight')).toContain('5f');
  expect(dests2.get('knight')).toContain('5c');
  expect(dests2.get('knight')).not.toContain('5b');
  expect(dests2.get('knight')).not.toContain('5a');
  expect(dests2.get('knight')).not.toContain('4c');

  const pos3 = Shogi.fromSetup(parseFen('3rkr3/9/8p/4N4/1B7/9/1SG6/1KS6/9 b LPp 1').unwrap()).unwrap();
  const dests3 = shogigroundDropDests(pos3);
  const dests4 = shogigroundDropDests(pos3, 'pawn');
  expect(dests3.get('pawn')).toContain('5c');
  expect(dests4.get('pawn')).toContain('5c');
  expect(dests3.get('pawn')).not.toContain('5b');
  expect(dests4.get('pawn')).not.toContain('5b');
  expect(dests3.get('lance')).toContain('5b');
});
