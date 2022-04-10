import { INITIAL_SFEN, parseSfen } from '../../src/sfen';
import {
  makeCsaHeader,
  makeCsaMove,
  parseCsaHeader,
  parseCsaMove,
  parseCsaMoves,
  parseTags,
} from '../../src/notation/csa/csa';
import { parseNumberSquare } from '../../src/notation/notationUtil';
import { Shogi } from '../../src/shogi';
import { parseSquare, parseUsi } from '../../src/util';

test('parse csa square', () => {
  expect(parseNumberSquare('11')).toEqual(parseSquare('1a'));
  expect(parseNumberSquare('12')).toEqual(parseSquare('1b'));
  expect(parseNumberSquare('66')).toEqual(parseSquare('6f'));
  expect(parseNumberSquare('89')).toEqual(parseSquare('8i'));
  expect(parseNumberSquare('99')).toEqual(parseSquare('9i'));
});

test('make csa header from starting position', () => {
  const setup = parseSfen(INITIAL_SFEN).unwrap();
  expect(makeCsaHeader(setup)).toEqual(
    `P1-KY-KE-GI-KI-OU-KI-GI-KE-KY
P2 * -HI *  *  *  *  * -KA * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  *  *  *  *  *  *  *  * 
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU
P8 * +KA *  *  *  *  * +HI * 
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
+`
  );
});

test('make csa header from some random position', () => {
  const setup = parseSfen('lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p').unwrap();
  expect(makeCsaHeader(setup)).toEqual(
    `P1-KY-KE+KI *  *  *  *  *  * 
P2 *  * +TO *  *  *  * +NG-KE
P3-OU-FU *  *  * +NG *  *  * 
P4 *  * -FU *  *  *  *  *  * 
P5 * -KE *  *  *  *  *  *  * 
P6 *  *  *  *  *  *  *  *  * 
P7 *  *  *  *  *  *  *  *  * 
P8 *  *  *  *  *  *  * +OU * 
P9 *  *  *  *  *  *  *  *  * 
P+00KI00GI
P-00HI00HI00KA00KA00KI00KI00GI00KE00KY00KY00KY00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU
-`
  );
});

test('parse CSA header with CSA board', () => {
  const setup = parseSfen('lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p 1').unwrap();
  const csaHeader = `P1-KY-KE+KI *  *  *  *  *  *
  P2 *  * +TO *  *  *  * +NG-KE
  P3-OU-FU *  *  * +NG *  *  *
  P4 *  * -FU *  *  *  *  *  *
  P5 * -KE *  *  *  *  *  *  * 
  P6 *  *  *  *  *  *  *  *  * 
  P7 *  *  *  *  *  *  *  *  *
  P8 *  *  *  *  *  *  * +OU *
  P9 *  *  *  *  *  *  *  *  *
  P+00KI00GI,P-00HI00HI00KA00KA00KI00KI00GI00KE00KY00KY00KY00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU
  -`;
  const csaSetup = parseCsaHeader(csaHeader).unwrap();
  expect(csaSetup).toEqual(setup);
});

test('parse CSA header with handicap', () => {
  const setup = parseSfen('lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1').unwrap();
  const csaHeader = `PI82HI22KA
  -`;
  const csaSetup = parseCsaHeader(csaHeader).unwrap();
  expect(csaSetup).toEqual(setup);
});

test('parse CSA header with handicap and CSA board', () => {
  // board takes precedence
  const setup = parseSfen('lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p 1').unwrap();
  const csaHeader = `P1-KY-KE+KI *  *  *  *  *  *
  P2 *  * +TO *  *  *  * +NG-KE
  P3-OU-FU *  *  * +NG *  *  *
  P4 *  * -FU *  *  *  *  *  *
  P5 * -KE *  *  *  *  *  *  *
  P6 *  *  *  *  *  *  *  *  *
  P7 *  *  *  *  *  *  *  *  *
  P8 *  *  *  *  *  *  * +OU *
  P9 *  *  *  *  *  *  *  *  *
  P+00KI00GI
  P-00HI00HI00KA00KA00KI00KI00GI00KE00KY00KY00KY00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU
  PI82HI22KA
  -`;
  const csaSetup = parseCsaHeader(csaHeader).unwrap();
  expect(csaSetup).toEqual(setup);
});

test('make CSA moves individually', () => {
  const pos = Shogi.default();
  expect(makeCsaMove(pos, parseUsi('7g7f')!)).toEqual('7776FU');
  expect(makeCsaMove(pos, parseUsi('9i9h')!)).toEqual('9998KY');
  expect(makeCsaMove(pos, parseUsi('1a1b')!)).toEqual('1112KY');
  expect(makeCsaMove(pos, parseUsi('5i5h')!)).toEqual('5958OU');

  const setup = parseSfen('lnsgkgsnl/7b1/pppp1pppp/9/4r4/9/PPPP1PPPP/1B2G4/LNSGK1SNL w Prp 10').unwrap();
  const pos2 = Shogi.fromSetup(setup).unwrap();
  const line = ['R*5b', '6i7h', '5e5h+'].map(m => parseUsi(m)!);
  expect(makeCsaMove(pos2, line[0])).toEqual('0052HI');
  pos2.play(line.shift()!);
  expect(makeCsaMove(pos2, line[0])).toEqual('6978KI');
  pos2.play(line.shift()!);
  expect(makeCsaMove(pos2, line[0])).toEqual('5558RY');
  pos2.play(line.shift()!);
});

test('parse csa moves one by one', () => {
  const pos = Shogi.default();
  const line = ['7g7f', '8c8d', '5g5f', '5c5d', '2h5h', '3a4b', '5f5e', '5d5e', '8h5e', '8d8e', '5e7c+'].map(
    m => parseUsi(m)!
  );
  for (const m of line) {
    expect(parseCsaMove(pos, makeCsaMove(pos, m)!)).toEqual(m);
    pos.play(m);
  }
  expect(pos.isCheckmate()).toBe(true);
});

test('parse moves', () => {
  const setup = parseSfen('lnsgkgsnl/7b1/pppp1pppp/9/4r4/9/PPPP1PPPP/1B2G4/LNSGK1SNL w Prp 10').unwrap();
  const pos = Shogi.fromSetup(setup).unwrap();
  const line = ['R*5b', '6i7h', '5e5h+'].map(m => parseUsi(m)!);
  expect(parseCsaMove(pos, '0052HI')).toEqual(parseUsi('R*5b'));
  pos.play(line.shift()!);
  expect(parseCsaMove(pos, '6978KI')).toEqual(parseUsi('6i7h'));
  pos.play(line.shift()!);
  expect(parseCsaMove(pos, '5558RY')).toEqual(parseUsi('5e5h+'));
});

test('parse csa moves', () => {
  const pos = Shogi.default();
  const line = [
    '7776FU',
    '8384FU',
    '5756FU',
    '5354FU',
    '2858HI',
    '3142GI',
    '5655FU',
    '5455FU',
    '8855KA',
    '8485FU',
    '5573UM',
  ];
  for (const m of parseCsaMoves(pos, line)) pos.play(m);
  expect(pos.isCheckmate()).toBe(true);
});

test('parse tags', () => {
  expect(
    parseTags(`
    $EVENT:Championship
    $SITE:lishogi`)
  ).toEqual([
    ['EVENT', 'Championship'],
    ['SITE', 'lishogi'],
  ]);
});
