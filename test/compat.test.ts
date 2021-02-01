import { Shogi } from '../src/shogi';
import {
  chessCoord,
  shogiCoord,
  shogigroundDests,
  parseLishogiUci,
  makeLishogiUci,
  makeLishogiFen,
  makeShogiFen,
  assureUsi,
  assureLishogiUci,
} from '../src/compat';

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
});

test('make lishogi fen', () => {
  expect(makeLishogiFen('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1')).toBe(
    'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1'
  );
  expect(makeLishogiFen('4k4/9/1rbgsnlp1/1+r+b1+s+n+l+p1/9/1RBGSNLP1/1+R+B1+S+N+L+P1/9/4K4 b - 1')).toBe(
    '4k4/9/1rbgsnlp1/1dh1amut1/9/1RBGSNLP1/1DH1AMUT1/9/4K4 w - 1'
  );
  expect(makeLishogiFen('4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w 3p 2')).toBe(
    '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b 3p 1'
  );
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b - 1')).toBe('9/9/9/9/9/9/9/9/9 w - 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 w - 1')).toBe('9/9/9/9/9/9/9/9/9 b - 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 w - 2')).toBe('9/9/9/9/9/9/9/9/9 b - 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b - 2')).toBe('9/9/9/9/9/9/9/9/9 w - 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 w - 3')).toBe('9/9/9/9/9/9/9/9/9 b - 2');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b - 3')).toBe('9/9/9/9/9/9/9/9/9 w - 2');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b 3p 1')).toBe('9/9/9/9/9/9/9/9/9 w 3p 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b ppp 1')).toBe('9/9/9/9/9/9/9/9/9 w 3p 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b ppprrPLNSGBLR 1')).toBe('9/9/9/9/9/9/9/9/9 w RBGSN2LP2r3p 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b rprpPLNSGBpLR 1')).toBe('9/9/9/9/9/9/9/9/9 w RBGSN2LP2r3p 1');
  expect(makeLishogiFen('9/9/9/9/9/9/9/9/9 b 2ppr1rPLNSGBLR 1')).toBe('9/9/9/9/9/9/9/9/9 w RBGSN2LP2r3p 1');
});

test('make shogi fen', () => {
  expect(makeShogiFen('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1')).toBe(
    'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
  );
  expect(makeShogiFen('4k4/9/1rbgsnlp1/1dh1amut1/9/1RBGSNLP1/1DH1AMUT1/9/4K4 w - 1')).toBe(
    '4k4/9/1rbgsnlp1/1+r+b1+s+n+l+p1/9/1RBGSNLP1/1+R+B1+S+N+L+P1/9/4K4 b - 1'
  );
  expect(makeShogiFen('4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w 3p 2')).toBe(
    '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b 3p 3'
  );
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 w - 1')).toBe('9/9/9/9/9/9/9/9/9 b - 1');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 b - 1')).toBe('9/9/9/9/9/9/9/9/9 w - 2');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 w - 2')).toBe('9/9/9/9/9/9/9/9/9 b - 3');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 b - 2')).toBe('9/9/9/9/9/9/9/9/9 w - 4');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 w - 3')).toBe('9/9/9/9/9/9/9/9/9 b - 5');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 b - 3')).toBe('9/9/9/9/9/9/9/9/9 w - 6');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 w 3p 1')).toBe('9/9/9/9/9/9/9/9/9 b 3p 1');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 w ppp 1')).toBe('9/9/9/9/9/9/9/9/9 b 3p 1');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 w ppprrPLNSGBLR 1')).toBe('9/9/9/9/9/9/9/9/9 b RBGSN2LP2r3p 1');
  expect(makeShogiFen('9/9/9/9/9/9/9/9/9 w RBGSN2LP2r3p 1')).toBe('9/9/9/9/9/9/9/9/9 b RBGSN2LP2r3p 1');
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
