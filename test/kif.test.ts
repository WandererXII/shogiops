import { parseFen } from '../src/fen';
import {
  makeKifHeader,
  makeKifMove,
  makeKifVariation,
  parseKifHeader,
  parseKifMove,
  parseKifMoves,
  parseTags,
} from '../src/kif';
import { defaultSetup } from '../src/setup';
import { Shogi } from '../src/shogi';
import { parseUsi } from '../src/util';

test('make kif header from some random position', () => {
  const setup = parseFen('lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p').unwrap();
  expect(makeKifHeader(setup)).toEqual(
    `後手の持駒：飛二 角二 金二 銀 桂 香三 歩十五
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
|v香v桂 金 ・ ・ ・ ・ ・ ・|一
| ・ ・ と ・ ・ ・ ・ 全v桂|二
|v玉v歩 ・ ・ ・ 全 ・ ・ ・|三
| ・ ・v歩 ・ ・ ・ ・ ・ ・|四
| ・v桂 ・ ・ ・ ・ ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ 玉 ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：金 銀
後手番`
  );
});

test('make kif header from handicap position', () => {
  const setup = parseFen('3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1').unwrap();
  expect(makeKifHeader(setup)).toEqual(`手合割：八枚落ち`);
});

test('parse kif header with kif board', () => {
  const setup = parseFen('lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p 1').unwrap();
  const kifHeader = `後手の持駒：飛二 角二 金二 銀 桂 香三 歩十五 
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
|v香v桂 金 ・ ・ ・ ・ ・ ・|一
| ・ ・ と ・ ・ ・ ・ 全v桂|二
|v王v歩 ・ ・ ・ 全 ・ ・ ・|三
| ・ ・v歩 ・ ・ ・ ・ ・ ・|四
| ・v桂 ・ ・ ・ ・ ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ 玉 ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：金 銀 
後手番`;
  const kifSetup = parseKifHeader(kifHeader).unwrap();
  expect(kifSetup).toEqual(setup);
});

test('parse kif header with handicap', () => {
  const setup = parseFen('lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1').unwrap();
  const kifHeader = `手合割：飛車落ち
  先手：
  後手：
`;
  const kifSetup = parseKifHeader(kifHeader).unwrap();
  expect(kifSetup).toEqual(setup);
});

test('parse kif header with handicap and kif board', () => {
  // board takes precedence
  const setup = parseFen('3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p 1').unwrap();
  const kifHeader = `手合割：平手
    後手の持駒：金四　銀二　香三　歩十三　
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・v桂 ・ ・ ・ ・ ・|一
|v玉 角v歩 馬 ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| 桂 ・ ・v歩 ・ ・ ・ ・ ・|四
|vとv桂 ・ ・v歩 ・ ・ ・ ・|五
| ・ ・ 飛 ・v全 ・ ・ ・ ・|六
|v歩 桂 ・ ・ ・ ・ ・ ・ ・|七
| ・ 香 ・ ・ ・ ・ ・ ・ ・|八
| ・v銀 ・ ・ 龍 ・ ・ ・ ・|九
+---------------------------+
先手の持駒：なし
  `;
  const kifSetup = parseKifHeader(kifHeader).unwrap();
  expect(kifSetup).toEqual(setup);
});

test('parse empty kif header', () => {
  const kifHeader = `先手：
    後手：`;
  const kifSetup = parseKifHeader(kifHeader).unwrap();
  expect(kifSetup).toEqual(defaultSetup());
});

test('make kif moves individually', () => {
  const pos = Shogi.default();
  expect(makeKifMove(pos, parseUsi('7g7f')!)).toEqual('７六歩(77)');
  expect(makeKifMove(pos, parseUsi('9i9h')!)).toEqual('９八香(99)');
  expect(makeKifMove(pos, parseUsi('1a1b')!)).toEqual('１二香(11)');
  expect(makeKifMove(pos, parseUsi('5i5h')!)).toEqual('５八玉(59)');

  const setup = parseFen('lnsgkgsnl/7b1/pppp1pppp/9/4r4/9/PPPP1PPPP/1B2G4/LNSGK1SNL w Prp 10').unwrap();
  const pos2 = Shogi.fromSetup(setup).unwrap();
  const line = ['R*5b', '6i7h', '5e5h+'].map(m => parseUsi(m)!);
  expect(makeKifMove(pos2, line[0])).toEqual('５二飛打');
  pos2.play(line.shift()!);
  expect(makeKifMove(pos2, line[0])).toEqual('７八金(69)');
  pos2.play(line.shift()!);
  expect(makeKifMove(pos2, line[0])).toEqual('５八飛成(55)');
  pos2.play(line.shift()!);
});

test('make kif move variation - sequence', () => {
  const pos = Shogi.default();
  const line = ['7g7f', '8c8d', '5g5f', '5c5d', '2h5h', '3a4b', '5f5e', '5d5e', '8h5e', '8d8e', '5e7c+'].map(
    m => parseUsi(m)!
  );
  expect(makeKifVariation(pos, line)).toEqual(` 1 ７六歩(77)
 2 ８四歩(83)
 3 ５六歩(57)
 4 ５四歩(53)
 5 ５八飛(28)
 6 ４二銀(31)
 7 ５五歩(56)
 8 同　歩(54)
 9 同　角(88)
10 ８五歩(84)
11 ７三角成(55)`);
});

test('parse kif moves one by one', () => {
  const pos = Shogi.default();
  const line = ['7g7f', '8c8d', '5g5f', '5c5d', '2h5h', '3a4b', '5f5e', '5d5e', '8h5e', '8d8e', '5e7c+'].map(
    m => parseUsi(m)!
  );
  for (const m of line) {
    expect(parseKifMove(makeKifMove(pos, m))).toEqual(m);
    pos.play(m);
  }
  expect(pos.isCheckmate()).toBe(true);
});

test('parse kif moves', () => {
  const pos = Shogi.default();
  const line = [
    ' 1 ７六歩(77)',
    ' 2 ８四歩(83)',
    ' 3 ５六歩(57)*comment',
    ' 4 ５四歩(53) ( 0:00/00:00:00)',
    ' 5 ５八飛(28)',
    ' 6 ４二銀(31)',
    ' 7 ５五歩(56)',
    ' 8 同　歩(54)',
    ' 9 同　角(88)',
    '10 ８五歩(84)',
    '11 ７三角成(55)',
  ];
  for (const m of parseKifMoves(line)) pos.play(m);
  expect(pos.isCheckmate()).toBe(true);
});

test('parse tags', () => {
  expect(
    parseTags(`
    先手：Sova
    後手：Raze`)
  ).toEqual([
    ['先手', 'Sova'],
    ['後手', 'Raze'],
  ]);
});
