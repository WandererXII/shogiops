import { parseUsi } from '../src/util';
import { makeSanVariation, parseSan } from '../src/san';
import { Shogi } from '../src/shogi';
import { parseFen } from '../src/fen';

test('make variation with king move', () => {
  const pos = Shogi.default();
  const variation = '7g7f 3c3d 8h2b+'.split(' ').map(usi => parseUsi(usi)!);
  expect(makeSanVariation(pos, variation)).toBe('1. Pc4 2. Pg6 3. Bxh8+');
  expect(pos).toEqual(Shogi.default());
});

test('make variation with fen', () => {
  const setup = parseFen('lnsgkg1nl/1r5s1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/7R1/LNSGKGSNL b - 3').unwrap();
  const pos = Shogi.fromSetup(setup).unwrap();
  const variation = 'B*5f 4a5b 5f3d'.split(' ').map(uci => parseUsi(uci)!);
  expect(makeSanVariation(pos, variation)).toBe('3. B*e4 4. Gf9e8 5. Bxg6');
  expect(pos).toEqual(Shogi.fromSetup(setup).unwrap());
});

test('parse basic san', () => {
  const pos = Shogi.default();
  expect(parseSan(pos, 'Pc4')).toEqual(parseUsi('7g7f'));
  expect(parseSan(pos, 'Gf1e2')).toEqual(parseUsi('4i5h'));
  expect(parseSan(pos, 'Gf1e2=')).toBeUndefined();
  expect(parseSan(pos, 'Gf1e2+')).toBeUndefined();
  expect(parseSan(pos, 'Ge1d2')).toBeUndefined();
  expect(parseSan(pos, 'Pi6')).toBeUndefined();
  expect(parseSan(pos, 'Kd1')).toBeUndefined();
  expect(parseSan(pos, 'P*e5')).toBeUndefined();
});

test('parse promotion san', () => {
  const setup = parseFen('5p3/kP1B5/3N2p2/2PN3p1/9/9/K8/9/5LLLL b - 1').unwrap();
  const pos = Shogi.fromSetup(setup).unwrap();
  expect(parseSan(pos, 'Pb9')).toBeUndefined();
  expect(parseSan(pos, 'Pb9+')).toEqual(parseUsi('8b8a+'));
  expect(parseSan(pos, 'Pb9=')).toBeUndefined();
  expect(parseSan(pos, 'Pc7')).toBeUndefined();
  expect(parseSan(pos, 'Pc7+')).toEqual(parseUsi('7d7c+'));
  expect(parseSan(pos, 'Pc7=')).toEqual(parseUsi('7d7c'));
  expect(parseSan(pos, 'Be9+')).toEqual(parseUsi('6b5a+'));
  expect(parseSan(pos, 'Be9=')).toEqual(parseUsi('6b5a'));
  expect(parseSan(pos, 'Be9')).toBeUndefined();
  expect(parseSan(pos, 'Ba5+')).toEqual(parseUsi('6b9e+'));
  expect(parseSan(pos, 'Ba5=')).toEqual(parseUsi('6b9e'));
  expect(parseSan(pos, 'Ba5')).toBeUndefined();
  expect(parseSan(pos, 'Nc9+')).toEqual(parseUsi('6c7a+'));
  expect(parseSan(pos, 'Nc9')).toBeUndefined();
  expect(parseSan(pos, 'Nc9=')).toBeUndefined();
  expect(parseSan(pos, 'Nc8+')).toEqual(parseUsi('6d7b+'));
  expect(parseSan(pos, 'Nc8')).toBeUndefined();
  expect(parseSan(pos, 'Nc8=')).toBeUndefined();
  expect(parseSan(pos, 'Lxf9+')).toEqual(parseUsi('4i4a+'));
  expect(parseSan(pos, 'Lxf9')).toBeUndefined();
  expect(parseSan(pos, 'Lxf9=')).toBeUndefined();
  expect(parseSan(pos, 'Lxg7+')).toEqual(parseUsi('3i3c+'));
  expect(parseSan(pos, 'Lxg7=')).toEqual(parseUsi('3i3c'));
  expect(parseSan(pos, 'Lxg7')).toBeUndefined();
  expect(parseSan(pos, 'Lxh6')).toEqual(parseUsi('2i2d'));
  expect(parseSan(pos, 'Lxh6=')).toBeUndefined();
  expect(parseSan(pos, 'Lxh6+')).toBeUndefined();
  expect(parseSan(pos, 'Li9+')).toEqual(parseUsi('1i1a+'));
  expect(parseSan(pos, 'Li9=')).toBeUndefined();
  expect(parseSan(pos, 'Li9')).toBeUndefined();
});

test('parse fools mate', () => {
  const pos = Shogi.default();
  const line = ['Pc4', 'Pb6', 'Pe4', 'Pe6', 'Re2', 'Sf8', 'Pe5', 'Pxe5', 'Bxe5', 'Pb5', 'Bxc7+'];
  for (const san of line) pos.play(parseSan(pos, san)!);
  expect(pos.isCheckmate()).toBe(true);
});
