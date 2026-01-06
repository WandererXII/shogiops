import { expect, test } from 'vitest';
import {
  makeCsaHeader,
  makeCsaMoveOrDrop,
  parseCsaHeader,
  parseCsaMoveOrDrop,
  parseCsaMovesOrDrops,
  parseTags,
} from '@/notation/csa.js';
import { parseNumberSquare } from '@/notation/util.js';
import { initialSfen, parseSfen } from '@/sfen.js';
import { parseSquareName, parseUsi } from '@/util.js';

test('parse csa square', () => {
  expect(parseNumberSquare('11')).toEqual(parseSquareName('1a'));
  expect(parseNumberSquare('12')).toEqual(parseSquareName('1b'));
  expect(parseNumberSquare('66')).toEqual(parseSquareName('6f'));
  expect(parseNumberSquare('89')).toEqual(parseSquareName('8i'));
  expect(parseNumberSquare('99')).toEqual(parseSquareName('9i'));
});

test('make csa header from starting position', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  expect(makeCsaHeader(pos)).toEqual(
    `P1-KY-KE-GI-KI-OU-KI-GI-KE-KY
P2 * -HI *  *  *  *  * -KA * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  *  *  *  *  *  *  *  * 
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU
P8 * +KA *  *  *  *  * +HI * 
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
+`,
  );
});

test('make csa header from some random position', () => {
  const pos = parseSfen(
    'standard',
    'lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p',
  ).unwrap();
  expect(makeCsaHeader(pos)).toEqual(
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
-`,
  );
});

test('parse CSA header with CSA board', () => {
  const pos = parseSfen(
    'standard',
    'lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p 1',
  ).unwrap();
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
  const csaPos = parseCsaHeader(csaHeader).unwrap();
  expect(csaPos).toEqual(pos);
});

test('parse CSA header with handicap', () => {
  const pos = parseSfen(
    'standard',
    'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  ).unwrap();
  const csaHeader = `PI82HI22KA
  -`;
  const csaPos = parseCsaHeader(csaHeader).unwrap();
  expect(csaPos).toEqual(pos);
});

test('parse CSA header with handicap and CSA board', () => {
  // board takes precedence
  const pos = parseSfen(
    'standard',
    'lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p 1',
  ).unwrap();
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
  const csaPos = parseCsaHeader(csaHeader).unwrap();
  expect(csaPos).toEqual(pos);
});

test('make CSA moves/drops individually', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  expect(makeCsaMoveOrDrop(pos, parseUsi('7g7f')!)).toEqual('7776FU');
  expect(makeCsaMoveOrDrop(pos, parseUsi('9i9h')!)).toEqual('9998KY');
  expect(makeCsaMoveOrDrop(pos, parseUsi('1a1b')!)).toEqual('1112KY');
  expect(makeCsaMoveOrDrop(pos, parseUsi('5i5h')!)).toEqual('5958OU');

  const pos2 = parseSfen(
    'standard',
    'lnsgkgsnl/7b1/pppp1pppp/9/4r4/9/PPPP1PPPP/1B2G4/LNSGK1SNL w Prp 10',
  ).unwrap();
  const line = ['R*5b', '6i7h', '5e5h+'].map((m) => parseUsi(m)!);
  expect(makeCsaMoveOrDrop(pos2, line[0])).toEqual('0052HI');
  pos2.play(line.shift()!);
  expect(makeCsaMoveOrDrop(pos2, line[0])).toEqual('6978KI');
  pos2.play(line.shift()!);
  expect(makeCsaMoveOrDrop(pos2, line[0])).toEqual('5558RY');
  pos2.play(line.shift()!);
});

test('parse csa moves/drops one by one', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const line = [
    '7g7f',
    '8c8d',
    '5g5f',
    '5c5d',
    '2h5h',
    '3a4b',
    '5f5e',
    '5d5e',
    '8h5e',
    '8d8e',
    '5e7c+',
  ].map((m) => parseUsi(m)!);
  for (const m of line) {
    expect(parseCsaMoveOrDrop(pos, makeCsaMoveOrDrop(pos, m)!)).toEqual(m);
    pos.play(m);
  }
  expect(pos.isCheckmate()).toBe(true);
});

test('parse moves/drops', () => {
  const pos = parseSfen(
    'standard',
    'lnsgkgsnl/7b1/pppp1pppp/9/4r4/9/PPPP1PPPP/1B2G4/LNSGK1SNL w Prp 10',
  ).unwrap();
  const line = ['R*5b', '6i7h', '5e5h+'].map((m) => parseUsi(m)!);
  expect(parseCsaMoveOrDrop(pos, '0052HI')).toEqual(parseUsi('R*5b'));
  pos.play(line.shift()!);
  expect(parseCsaMoveOrDrop(pos, '6978KI')).toEqual(parseUsi('6i7h'));
  pos.play(line.shift()!);
  expect(parseCsaMoveOrDrop(pos, '5558RY')).toEqual(parseUsi('5e5h+'));
});

test('parse csa moves/drops', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
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
  for (const m of parseCsaMovesOrDrops(pos, line)) pos.play(m);
  expect(pos.isCheckmate()).toBe(true);
});

test('parse tags', () => {
  expect(
    parseTags(`
    $EVENT:Championship
    $SITE:lishogi`),
  ).toEqual([
    ['EVENT', 'Championship'],
    ['SITE', 'lishogi'],
  ]);
});
