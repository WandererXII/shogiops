import {
  makeKifHeader,
  makeKifMoveOrDrop,
  parseKifHeader,
  parseKifMoveOrDrop,
  parseKifMovesOrDrops,
  parseTags,
} from '../../src/notation/kif/kif.js';
import { initialSfen, makeSfen, parseSfen } from '../../src/sfen.js';
import { parseUsi } from '../../src/util.js';
import { Chushogi } from '../../src/variant/chushogi.js';
import { Shogi } from '../../src/variant/shogi.js';

test('make kif header from some random position', () => {
  const pos = parseSfen('standard', 'lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p').unwrap();
  expect(makeKifHeader(pos)).toEqual(
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

test('make minishogi kif header', () => {
  const pos = parseSfen('minishogi', 'rbsgk/4p/P4/5/KGSBR w - 2').unwrap();
  expect(makeKifHeader(pos)).toEqual(
    `手合割：5五将棋
後手の持駒：なし
  ５ ４ ３ ２ １
+---------------+
|v飛v角v銀v金v玉|一
| ・ ・ ・ ・v歩|二
| 歩 ・ ・ ・ ・|三
| ・ ・ ・ ・ ・|四
| 玉 金 銀 角 飛|五
+---------------+
先手の持駒：なし
後手番`
  );
});

test('make kif header from handicap position', () => {
  const pos = parseSfen('standard', '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1').unwrap();
  expect(makeKifHeader(pos)).toEqual(`手合割：八枚落ち`);
});

test('parse kif header with kif board', () => {
  const pos = parseSfen('standard', 'lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p 1').unwrap(),
    kifHeader = `後手の持駒：飛二 角二 金二 銀 桂 香三 歩十五
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
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('parse kif minishogi header with kif board', () => {
  const pos = parseSfen('minishogi', 'rbsgk/4p/P4/5/KGSBR w - 1').unwrap(),
    kifHeader = `手合割：5五将棋
後手の持駒：なし
５ ４ ３ ２ １
+---------------+
|v飛v角v銀v金v玉|一
| ・ ・ ・ ・v歩|二
| 歩 ・ ・ ・ ・|三
| ・ ・ ・ ・ ・|四
| 玉 金 銀 角 飛|五
+---------------+
先手の持駒：なし
後手番`;
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('minishogi kif default', () => {
  const defaultPos = parseSfen('minishogi', initialSfen('minishogi')).unwrap();
  expect(makeKifHeader(defaultPos)).toEqual(`手合割：5五将棋`);
  expect(parseKifHeader(`手合割：5五将棋`).unwrap()).toEqual(defaultPos);
});

test('parse kif header with handicap', () => {
  const pos = parseSfen('standard', 'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1').unwrap(),
    kifHeader = `手合割：飛車落ち
  先手：
  後手：
`;
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('parse kif header with handicap and kif board', () => {
  // board takes precedence
  const pos = parseSfen('standard', '3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p 1').unwrap(),
    kifHeader = `手合割：平手
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
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('parse empty kif header', () => {
  const kifHeader = `先手：
    後手：`,
    kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(Shogi.default());
});

test('make kif moves/drops individually', () => {
  const pos = Shogi.default();
  expect(makeKifMoveOrDrop(pos, parseUsi('7g7f')!)).toEqual('７六歩(77)');
  expect(makeKifMoveOrDrop(pos, parseUsi('9i9h')!)).toEqual('９八香(99)');
  expect(makeKifMoveOrDrop(pos, parseUsi('1a1b')!)).toEqual('１二香(11)');
  expect(makeKifMoveOrDrop(pos, parseUsi('5i5h')!)).toEqual('５八玉(59)');

  const pos2 = parseSfen('standard', 'lnsgkgsnl/7b1/pppp1pppp/9/4r4/9/PPPP1PPPP/1B2G4/LNSGK1SNL w Prp 10').unwrap(),
    line = ['R*5b', '6i7h', '5e5h+'].map(m => parseUsi(m)!);
  expect(makeKifMoveOrDrop(pos2, line[0])).toEqual('５二飛打');
  pos2.play(line.shift()!);
  expect(makeKifMoveOrDrop(pos2, line[0])).toEqual('７八金(69)');
  pos2.play(line.shift()!);
  expect(makeKifMoveOrDrop(pos2, line[0])).toEqual('５八飛成(55)');
  pos2.play(line.shift()!);
});

test('parse kif moves/drops one by one', () => {
  const pos = Shogi.default(),
    line = ['7g7f', '8c8d', '5g5f', '5c5d', '2h5h', '3a4b', '5f5e', '5d5e', '8h5e', '8d8e', '5e7c+'].map(
      m => parseUsi(m)!
    );
  for (const m of line) {
    expect(parseKifMoveOrDrop(makeKifMoveOrDrop(pos, m)!, pos.lastMoveOrDrop?.to)).toEqual(m);
    pos.play(m);
  }
  expect(pos.isCheckmate()).toBe(true);
});

test('parse kif moves/drops', () => {
  const pos = Shogi.default(),
    line = [
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
  for (const m of parseKifMovesOrDrops(line)) pos.play(m);
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

test('parse chushogi kif header', () => {
  // board takes precedence
  const pos = parseSfen('chushogi', '12/9NN1/2+H+H8/12/9+o2/12/5N3N2/5+O6/9+H2/2+H9/2+H6+H2/12 b - 1').unwrap(),
    kifHeader = ` １２ １１ １０ ９  ８  ７  ６  ５  ４  ３  ２  １
  +------------------------------------------------+
  |  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|一
  |  ・  ・  ・  ・  ・  ・  ・  ・  ・  獅  獅  ・|二
  |  ・  ・  鷹  鷹  ・  ・  ・  ・  ・  ・  ・  ・|三
  |  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|四
  |  ・  ・  ・  ・  ・  ・  ・  ・  ・v成獅  ・  ・|五
  |  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|六
  |  ・  ・  ・  ・  ・  獅  ・  ・  ・  獅  ・  ・|七
  |  ・  ・  ・  ・  ・ 成獅  ・  ・  ・  ・  ・  ・|八
  |  ・  ・  ・  ・  ・  ・  ・  ・  ・  鷹  ・  ・|九
  |  ・  ・  鷹  ・  ・  ・  ・  ・  ・  ・  ・  ・|十
  |  ・  ・  鷹  ・  ・  ・  ・  ・  ・  鷹  ・  ・|十一
  |  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|十二
  +------------------------------------------------+`;
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('make kif header - chushogi', () => {
  const pos = parseSfen('chushogi', '12/9NN1/2+H+H8/12/9+o2/12/5N3N2/5+O6/9+H2/2+H9/2+H6+H2/12 b - 1').unwrap();
  expect(makeKifHeader(pos)).toEqual(
    ` １２ １１ １０ ９  ８  ７  ６  ５  ４  ３  ２  １
+------------------------------------------------+
|  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|一
|  ・  ・  ・  ・  ・  ・  ・  ・  ・  獅  獅  ・|二
|  ・  ・  鷹  鷹  ・  ・  ・  ・  ・  ・  ・  ・|三
|  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|四
|  ・  ・  ・  ・  ・  ・  ・  ・  ・v成獅  ・  ・|五
|  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|六
|  ・  ・  ・  ・  ・  獅  ・  ・  ・  獅  ・  ・|七
|  ・  ・  ・  ・  ・ 成獅  ・  ・  ・  ・  ・  ・|八
|  ・  ・  ・  ・  ・  ・  ・  ・  ・  鷹  ・  ・|九
|  ・  ・  鷹  ・  ・  ・  ・  ・  ・  ・  ・  ・|十
|  ・  ・  鷹  ・  ・  ・  ・  ・  ・  鷹  ・  ・|十一
|  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・  ・|十二
+------------------------------------------------+`
  );
});

test('make chushogi moves', () => {
  const pos = Chushogi.default();
  expect(makeKifMoveOrDrop(pos, parseUsi('7i7h')!)).toEqual('7八歩兵 （←7九）');
  pos.play(parseUsi('7i7h')!);
  expect(makeKifMoveOrDrop(pos, parseUsi('7d7e')!)).toEqual('7五歩兵 （←7四）');
  pos.play(parseUsi('7d7e')!);
  expect(makeKifMoveOrDrop(pos, parseUsi('7j7i6h')!)).toEqual(`一歩目 7九獅子 （←7十）
二歩目 6八獅子 （←7九）`);
});

test('parse chushogi moves', () => {
  expect(parseKifMovesOrDrops(['57手目一歩目 ▲6六獅子 （←7七）', '57手目二歩目 ▲7七獅子（居食い） （←6六）'])).toEqual([
    parseUsi('7g6f7g'),
  ]);
  expect(parseKifMoveOrDrop('1手目 ▲7八歩兵 （←7九）')).toEqual(parseUsi('7i7h')!);
  expect(parseKifMoveOrDrop('1手目 ▲7八歩兵 （←7九）')).toEqual(parseUsi('7i7h')!);
  expect(parseKifMoveOrDrop('123手目 ▲6十一金将成 （←5十二）')).toEqual(parseUsi('5l6k+')!);
});

test('chushogi kif default', () => {
  const defaultPos = parseSfen('chushogi', initialSfen('chushogi')).unwrap();
  expect(makeKifHeader(defaultPos)).toEqual(`手合割：`);
});

test('parse kif header and board with annanshogi handicap name', () => {
  // board takes precedence
  const pos = parseSfen('annanshogi', '3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p 1').unwrap(),
    kifHeader = `手合割：安南
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
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('annanshogi kif header with board', () => {
  const pos = parseSfen('annanshogi', '3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p').unwrap(),
    kifHeader = `手合割：安南将棋
後手の持駒：金四 銀二 香三 歩十三
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
先手の持駒：なし`;
  const posFromKif = parseKifHeader(kifHeader).unwrap(),
    kifFromPos = makeKifHeader(pos);
  expect(posFromKif).toEqual(pos);
  expect(makeSfen(posFromKif)).toEqual('3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p 1');
  expect(kifFromPos).toEqual(kifHeader);

  const defaultPos = parseSfen('annanshogi', initialSfen('annanshogi')).unwrap();
  expect(makeKifHeader(defaultPos)).toEqual(`手合割：安南将棋`);
  expect(parseKifHeader(`手合割：安南将棋`).unwrap()).toEqual(defaultPos);
});

test('kyoto kif default', () => {
  const defaultPos = parseSfen('kyotoshogi', initialSfen('kyotoshogi')).unwrap();
  expect(makeKifHeader(defaultPos)).toEqual(`手合割：京都将棋`);
  expect(parseKifHeader(`手合割：京都将棋`).unwrap()).toEqual(defaultPos);
});

test('kyoto handicap', () => {
  const pos = parseSfen('kyotoshogi', '1gks1/5/5/5/TSKGP w - ').unwrap();
  const kif = `手合割：京都将棋
上手の持駒：なし
  ５ ４ ３ ２ １
+---------------+
| ・v金v玉v銀 ・|一
| ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・|三
| ・ ・ ・ ・ ・|四
| と 銀 玉 金 歩|五
+---------------+
下手の持駒：なし
上手番`;

  expect(makeKifHeader(pos)).toEqual(kif);
  expect(parseKifHeader(kif).unwrap()).toEqual(pos);
});
