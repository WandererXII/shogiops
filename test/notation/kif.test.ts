import { test } from 'node:test';
import { findHandicap } from '../../src/handicaps.js';
import { Hand } from '../../src/hands.js';
import {
  InvalidKif,
  makeKifBoard,
  makeKifHand,
  makeKifHeader,
  makeKifMoveOrDrop,
  makeKifPositionHeader,
  normalizedKifLines,
  parseKifBoard,
  parseKifHand,
  parseKifHeader,
  parseKifMoveOrDrop,
  parseKifMovesOrDrops,
  parseTags,
} from '../../src/notation/game/kif.js';
import { dimensions } from '../../src/position/util.js';
import { initialSfen, makeSfen, parseSfen } from '../../src/sfen.js';
import type { Rules } from '../../src/types.js';
import { parseUsi } from '../../src/util.js';
import { expect } from '../debug.js';

for (const rules of [
  'standard',
  'minishogi',
  'kyotoshogi',
  'dobutsu',
  'chushogi',
  'annanshogi',
  'checkshogi',
] as const) {
  test(`${rules} kif position headers accept either colon width`, () => {
    const initial = parseSfen(rules, initialSfen(rules)).unwrap();
    const pos = initial.update({
      turn: 'gote',
      hands:
        rules === 'chushogi'
          ? initial.hands
          : initial.hands
              .increment({ color: 'sente', role: 'pawn' })
              .increment({ color: 'gote', role: 'pawn' }),
    });
    for (const separator of [':', '：']) {
      const header = makeKifPositionHeader(pos).replace(/：/g, separator);
      const parsed = parseKifHeader(`${header}\nURL${separator}https://example.com/a:b`).unwrap();
      expect(parsed.rules).toEqual(pos.rules);
      expect(parsed.board.equals(pos.board)).toEqual(true);
      expect(parsed.hands.equals(pos.hands)).toEqual(true);
      expect(parsed.turn).toEqual(pos.turn);
    }
  });

  test(`${rules} kif board requires complete dimensions`, () => {
    const pos = parseSfen(rules, initialSfen(rules)).unwrap();
    const diagram = makeKifBoard(rules, pos.board);
    expect(parseKifBoard(rules, diagram).unwrap()).toEqual(pos.board);

    const rows = diagram.split('\n').filter((line) => line.startsWith('|'));
    const { files } = dimensions(rules);
    const malformedBoards = [
      '',
      rows.filter((_, rank) => rank !== 3).join('\n'),
      [...rows, rows[3]].join('\n'),
      ...[files - 1, files + 1].map((width) =>
        rows.map((row, rank) => (rank === 3 ? `|${' ・'.repeat(width)}|四` : row)).join('\n'),
      ),
    ];
    for (const malformed of malformedBoards) {
      const result = parseKifBoard(rules, malformed);
      expect(result.isErr).toEqual(true);
      if (result.isErr) expect(result.error.message).toEqual(InvalidKif.Board);
    }
  });
}

for (const [rules, input, expected] of [
  ['standard', '飛角', Hand.empty().with('rook', 1).with('bishop', 1)],
  ['standard', '飛二角三歩十五', Hand.empty().with('rook', 2).with('bishop', 3).with('pawn', 15)],
  ['standard', '飛飛', Hand.empty().with('rook', 2)],
  ['dobutsu', 'ひよこぞうきりん', Hand.empty().with('pawn', 1).with('bishop', 1).with('rook', 1)],
  [
    'dobutsu',
    'ひよこ二ぞう二きりん二',
    Hand.empty().with('pawn', 2).with('bishop', 2).with('rook', 2),
  ],
] as const) {
  test(`parse ${rules} compact kif hand ${input}`, () => {
    expect(parseKifHand(rules, input).unwrap()).toEqual(expected);
  });
}

for (const input of ['なし', ' なし ', '　なし　']) {
  test(`parse empty kif hand ${input}`, () => {
    expect(parseKifHand('standard', input).unwrap()).toEqual(Hand.empty());
  });
}

for (const input of ['飛X', '飛X角', '飛二X', '飛二X角', '歩二 なし', '玉なし', 'なし歩二']) {
  test(`reject invalid characters in kif hand ${input}`, () => {
    const result = parseKifHand('standard', input);
    expect(result.isErr).toEqual(true);
    if (result.isErr) expect(result.error.message).toEqual(InvalidKif.Hands);
  });
}

test('dobutsu kif hands round-trip', () => {
  for (const count of [1, 2]) {
    for (const role of ['pawn', 'bishop', 'rook'] as const) {
      const hand = Hand.empty().with(role, count);
      const exported = makeKifHand('dobutsu', hand);
      expect(parseKifHand('dobutsu', exported).unwrap().equals(hand)).toEqual(true);
    }
    const hand = Hand.empty().with('pawn', count).with('bishop', count).with('rook', count);
    expect(parseKifHand('dobutsu', makeKifHand('dobutsu', hand)).unwrap().equals(hand)).toEqual(
      true,
    );
  }
});

test('make kif header from some random position', () => {
  const pos = parseSfen(
    'standard',
    'lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p',
  ).unwrap();
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
後手番`,
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
後手番`,
  );
});

test('make kif header from handicap position', () => {
  const pos = parseSfen(
    'standard',
    '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  ).unwrap();
  expect(makeKifHeader(pos)).toEqual(`手合割：八枚落ち`);
});

test('parse kif header with kif board', () => {
  const pos = parseSfen(
    'standard',
    'lnG6/2+P4+Sn/kp3+S3/2p6/1n7/9/9/7K1/9 w GS2r2b2gsn3l15p 1',
  ).unwrap();
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
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('parse kif minishogi header with kif board', () => {
  const pos = parseSfen('minishogi', 'rbsgk/4p/P4/5/KGSBR w - 1').unwrap();
  const kifHeader = `手合割：5五将棋
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
  const pos = parseSfen(
    'standard',
    'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  ).unwrap();
  const kifHeader = `手合割：飛車落ち
  先手：
  後手：
`;
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

for (const [japaneseName, rules] of [
  ['と落ち', 'kyotoshogi'],
  ['銀落ち', 'kyotoshogi'],
  ['ひよこ落ち', 'dobutsu'],
] as const) {
  test(`parse kif header with ${japaneseName} handicap preserves ${rules} rules`, () => {
    const handicap = findHandicap({ japaneseName, rules })!;
    const pos = parseKifHeader(`手合割：${japaneseName}`).unwrap();
    expect(pos.rules).toEqual(rules);
    expect(makeSfen(pos)).toEqual(handicap.sfen);
  });
}

test('parse kif header with handicap and kif board', () => {
  // board takes precedence
  const pos = parseSfen(
    'standard',
    '3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p 1',
  ).unwrap();
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
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('parse empty kif header', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const kifHeader = `先手：
    後手：`;
  const kifPos = parseKifHeader(kifHeader).unwrap();
  expect(kifPos).toEqual(pos);
});

test('parse kif header preserves invalid custom hand errors', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const board = makeKifBoard('standard', pos.board);
  for (const color of ['先手', '後手', '下手', '上手']) {
    for (const handicap of ['', '手合割：飛車落ち\n']) {
      const result = parseKifHeader(`${handicap}${board}\n${color}の持駒：玉`);
      expect(result.isErr).toEqual(true);
      if (result.isErr) expect(result.error.message).toEqual(InvalidKif.Hands);
    }
  }
});

test('parse kif header preserves invalid custom board errors', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  const rows = makeKifBoard('standard', pos.board)
    .split('\n')
    .filter((line) => line.startsWith('|'));
  const malformedBoards = [
    rows.slice(1).join('\n'),
    [...rows, rows[0]].join('\n'),
    rows.map((row, rank) => (rank === 0 ? '| ・|一' : row)).join('\n'),
    '+---------------------------+',
    '先手の持駒：玉',
  ];
  for (const board of malformedBoards) {
    for (const handicap of ['', '手合割：飛車落ち\n']) {
      const result = parseKifHeader(`${handicap}${board}`);
      expect(result.isErr).toEqual(true);
      if (result.isErr) expect(result.error.message).toEqual(InvalidKif.Board);
    }
  }
});

test('make kif moves/drops individually', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  expect(makeKifMoveOrDrop(pos, parseUsi('7g7f')!)).toEqual('７六歩(77)');
  expect(makeKifMoveOrDrop(pos, parseUsi('9i9h')!)).toEqual('９八香(99)');
  expect(makeKifMoveOrDrop(pos, parseUsi('1a1b')!)).toEqual('１二香(11)');
  expect(makeKifMoveOrDrop(pos, parseUsi('5i5h')!)).toEqual('５八玉(59)');

  let pos2 = parseSfen(
    'standard',
    'lnsgkgsnl/7b1/pppp1pppp/9/4r4/9/PPPP1PPPP/1B2G4/LNSGK1SNL w Prp 10',
  ).unwrap();
  const line = ['R*5b', '6i7h', '5e5h+'].map((m) => parseUsi(m)!);
  expect(makeKifMoveOrDrop(pos2, line[0])).toEqual('５二飛打');
  pos2 = pos2.play(line.shift()!);
  expect(makeKifMoveOrDrop(pos2, line[0])).toEqual('７八金(69)');
  pos2 = pos2.play(line.shift()!);
  expect(makeKifMoveOrDrop(pos2, line[0])).toEqual('５八飛成(55)');
});

test('parse kif moves/drops one by one', () => {
  let pos = parseSfen('standard', initialSfen('standard')).unwrap();
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
    expect(parseKifMoveOrDrop(makeKifMoveOrDrop(pos, m)!, pos.lastMoveOrDrop?.to)).toEqual(m);
    pos = pos.play(m);
  }
  expect(pos.outcome()?.result).toEqual('checkmate');
});

test('parse same-destination drops', () => {
  for (const to of [parseUsi('1a1a')!.to, parseUsi('5e5e')!.to]) {
    for (const kif of ['同歩打', '同 歩打', '同　歩打']) {
      expect(parseKifMoveOrDrop(kif, to)).toEqual({ role: 'pawn', to });
    }
  }
});

test('same-destination drops require a previous destination', () => {
  for (const kif of ['同歩打', '同 歩打', '同　歩打']) {
    expect(parseKifMoveOrDrop(kif)).toEqual(undefined);
  }
});

test('explicit drop destinations take precedence over the previous destination', () => {
  const drop = parseUsi('P*5e')!;
  expect(parseKifMoveOrDrop('５五歩打', parseUsi('1a1a')!.to)).toEqual(drop);
  expect(parseKifMoveOrDrop('５五歩打')).toEqual(drop);
});

test('parse kif moves/drops', () => {
  let pos = parseSfen('standard', initialSfen('standard')).unwrap();
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
  for (const m of parseKifMovesOrDrops(line)) {
    pos = pos.play(m);
  }
  expect(pos.outcome()?.result).toEqual('checkmate');
});

const variantMoveCases: [Rules, string, string, string][] = [
  ['dobutsu', 'k2/3/1P1/2K b - 1', '2c2b', '２二ひよこ(23)'],
  ['dobutsu', 'k2/3/1B1/2K b - 1', '2c3b', '３二ぞう(23)'],
  ['dobutsu', 'k2/3/1R1/2K b - 1', '2c2b', '２二きりん(23)'],
  ['dobutsu', 'k2/3/1+P1/2K b - 1', '2c2b', '２二にわとり(23)'],
  ['dobutsu', 'k2/3/3/2K b - 1', '1d1c', '１三ライオン(14)'],
  ['dobutsu', 'k2/1P1/3/2K b - 1', '2b2a+', '２一ひよこ成(22)'],
  ['dobutsu', 'k2/3/3/2K b PBR 1', 'P*2b', '２二ひよこ打'],
  ['dobutsu', 'k2/3/3/2K b PBR 1', 'B*2b', '２二ぞう打'],
  ['dobutsu', 'k2/3/3/2K b PBR 1', 'R*2b', '２二きりん打'],
  ['kyotoshogi', 'k4/5/5/5/4K b T 1', 'T*2b', '２二と打'],
  ['chushogi', 'k11/12/12/8+G3/12/12/12/12/12/12/12/11K b - 1', '4d4a', '4一金飛車 （←4四）'],
];

for (const [rules, sfen, usi, kif] of variantMoveCases) {
  test(`round-trip ${rules} KIF ${kif}`, () => {
    const pos = parseSfen(rules, sfen).unwrap();
    const move = parseUsi(usi)!;
    expect(pos.isLegal(move)).toEqual(true);
    expect(makeKifMoveOrDrop(pos, move)).toEqual(kif);
    expect(parseKifMoveOrDrop(kif)).toEqual(move);
  });
}

test('variant KIF sequences continue after exported moves and drops', () => {
  const cases: [Rules, string, string[]][] = [
    ['dobutsu', initialSfen('dobutsu'), ['2c2b', '2a2b']],
    ['kyotoshogi', 'k4/5/5/5/4K b T 1', ['T*2b', '5a4a']],
    ['chushogi', 'k11/12/12/8+G3/12/12/12/12/12/12/12/11K b - 1', ['4d4a', '12a12b']],
  ];
  for (const [rules, sfen, usis] of cases) {
    let pos = parseSfen(rules, sfen).unwrap();
    const moves = usis.map((usi) => parseUsi(usi)!);
    const lines = moves.map((move) => {
      expect(pos.isLegal(move)).toEqual(true);
      const kif = makeKifMoveOrDrop(pos, move)!;
      pos = pos.play(move);
      return kif;
    });
    expect(parseKifMovesOrDrops(lines)).toEqual(moves);
  }
});

test('normalized kif lines preserve colon widths', () => {
  expect(
    normalizedKifLines(
      '  URL：https://example.com/a:b\r\n\n開始日時:10:30:00\r注記：全角：値　終わり ',
    ),
  ).toEqual(['URL：https://example.com/a:b', '開始日時:10:30:00', '注記：全角：値 終わり']);
});

test('kif handicap headers accept either colon width', () => {
  const handicap = findHandicap({ rules: 'standard', japaneseName: '飛車落ち' })!;
  for (const separator of [':', '：']) {
    expect(makeSfen(parseKifHeader(`手合割${separator}飛車落ち`).unwrap())).toEqual(handicap.sfen);
  }
});

test('kif hand headers do not discard content after another colon', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  for (const separator of [':', '：']) {
    for (const color of ['先手', '後手', '下手', '上手']) {
      const header = `${makeKifBoard(pos.rules, pos.board)}\n${color}の持駒${separator}歩:余分`;
      const result = parseKifHeader(header);
      expect(result.isErr).toEqual(true);
      if (result.isErr) expect(result.error.message).toEqual(InvalidKif.Hands);
    }
  }
});

test('parse tags', () => {
  expect(
    parseTags(`
    先手：Sova
    後手：Raze`),
  ).toEqual([
    ['先手', 'Sova'],
    ['後手', 'Raze'],
  ]);
});

test('parse tags ignores timed moves', () => {
  expect(
    parseTags(`
    先手：Sova
    後手：Raze
    手数----指手---------消費時間--
    1 ７六歩(77) (0:01/0:00:01)
    2 ３四歩(33) (0:02/0:00:02)
    3 投了 (0:00/0:00:01)
    まで2手で後手の勝ち`),
  ).toEqual([
    ['先手', 'Sova'],
    ['後手', 'Raze'],
  ]);
});

test('parse tags ignores lines without separators and preserves empty values', () => {
  expect(
    parseTags(`
    # ignored:comment
    * ignored：comment
    先手：
    後手:
    +---------------------------+
    | ・ ・ ・ ・ ・ ・ ・ ・ ・|一
    後手番
    1 ７六歩(77)`),
  ).toEqual([
    ['先手', ''],
    ['後手', ''],
  ]);
});

for (const separator of [':', '：']) {
  test(`parse tags preserves value colons with ${separator} separator`, () => {
    expect(
      parseTags(`
      # ignored:comment
      * ignored：comment
      開始日時${separator}2026/10/26 10:30:00
      URL${separator}https://example.com/a:b
      先手${separator}Player:Alias
      注記${separator}ASCII:全角：混在:値
      `),
    ).toEqual([
      ['開始日時', '2026/10/26 10:30:00'],
      ['URL', 'https://example.com/a:b'],
      ['先手', 'Player:Alias'],
      ['注記', 'ASCII:全角：混在:値'],
    ]);
  });
}

test('parse chushogi kif header', () => {
  // board takes precedence
  const pos = parseSfen(
    'chushogi',
    '12/9NN1/2+H+H8/12/9+o2/12/5N3N2/5+O6/9+H2/2+H9/2+H6+H2/12 b - 1',
  ).unwrap();
  const kifHeader = ` １２ １１ １０ ９  ８  ７  ６  ５  ４  ３  ２  １
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
  const pos = parseSfen(
    'chushogi',
    '12/9NN1/2+H+H8/12/9+o2/12/5N3N2/5+O6/9+H2/2+H9/2+H6+H2/12 b - 1',
  ).unwrap();
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
+------------------------------------------------+`,
  );
});

test('make chushogi moves', () => {
  let pos = parseSfen('chushogi', initialSfen('chushogi')).unwrap();
  expect(makeKifMoveOrDrop(pos, parseUsi('7i7h')!)).toEqual('7八歩兵 （←7九）');
  pos = pos.play(parseUsi('7i7h')!);
  expect(makeKifMoveOrDrop(pos, parseUsi('7d7e')!)).toEqual('7五歩兵 （←7四）');
  pos = pos.play(parseUsi('7d7e')!);
  expect(makeKifMoveOrDrop(pos, parseUsi('7j7i6h')!)).toEqual(`一歩目 7九獅子 （←7十）
二歩目 6八獅子 （←7九）`);
});

test('parse chushogi moves', () => {
  expect(
    parseKifMovesOrDrops([
      '57手目一歩目 ▲6六獅子 （←7七）',
      '57手目二歩目 ▲7七獅子（居食い） （←6六）',
    ]),
  ).toEqual([parseUsi('7g6f7g')]);
  expect(parseKifMoveOrDrop('1手目 ▲7八歩兵 （←7九）')).toEqual(parseUsi('7i7h')!);
  expect(parseKifMoveOrDrop('1手目 ▲7八歩兵 （←7九）')).toEqual(parseUsi('7i7h')!);
  expect(parseKifMoveOrDrop('123手目 ▲6十一金将成 （←5十二）')).toEqual(parseUsi('5l6k+')!);
});

for (const square of ['99一', '９９一', '0五', '０五', '5十七']) {
  test(`reject invalid chushogi origin: ${square}`, () => {
    for (const lastDest of [undefined, parseUsi('1a1a')!.to]) {
      expect(parseKifMoveOrDrop(`5五獅子 （←${square}）`, lastDest)).toEqual(undefined);
    }
  });
  test(`reject invalid chushogi destination: ${square}`, () => {
    for (const lastDest of [undefined, parseUsi('1a1a')!.to]) {
      expect(parseKifMoveOrDrop(`${square}獅子 （←5五）`, lastDest)).toEqual(undefined);
    }
  });
}

for (const marker of ['同', '仝']) {
  test(`chushogi repeat destination requires a previous destination: ${marker}`, () => {
    const move = parseUsi('5e1a')!;
    expect(parseKifMoveOrDrop(`${marker}獅子 （←5五）`, move.to)).toEqual(move);
    expect(parseKifMoveOrDrop(`${marker}獅子 （←5五）`)).toEqual(undefined);
    expect(parseKifMoveOrDrop(`${marker}獅子 （←99一）`, move.to)).toEqual(undefined);
  });
}

for (const [kif, usi] of [
  ['１０五獅子 （←９六）', '9f10e'],
  ['９六獅子 （←１０五）', '10e9f'],
  ['１０六獅子 （←１０五）', '10e10f'],
]) {
  test(`parse chushogi full-width file ten: ${kif}`, () => {
    const expected = parseUsi(usi)!;
    const ascii = kif.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    expect(parseKifMoveOrDrop(ascii)).toEqual(expected);
    expect(parseKifMoveOrDrop(kif)).toEqual(expected);
  });
}

test('chushogi full-width file ten does not truncate following moves', () => {
  expect(
    parseKifMovesOrDrops([
      '７八歩兵 （←７九）',
      '１０五獅子 （←９六）',
      '９六獅子 （←１０五）',
      '１２二玉 （←１２一）',
    ]),
  ).toEqual(['7i7h', '9f10e', '10e9f', '12a12b'].map((usi) => parseUsi(usi)!));
});

test('chushogi passing moves round-trip without truncating following moves', () => {
  const initialPos = parseSfen(
    'chushogi',
    'k6r4/12/12/12/7N4/12/12/12/12/12/12/11K w - 1',
  ).unwrap();
  const previous = parseUsi('5a6a')!;
  expect(initialPos.isLegal(previous)).toEqual(true);
  const pos = initialPos.play(previous);
  const move = parseUsi('5e5d5e')!;
  expect(pos.isLegal(move)).toEqual(true);
  const following = parseUsi('12a12b')!;
  const afterPass = pos.play(move);
  expect(afterPass.isLegal(following)).toEqual(true);

  const exported = makeKifMoveOrDrop(pos, move)!;
  expect(exported).toEqual('一歩目 5四獅子 （←5五）\n二歩目 5五獅子(じっと) （←5四）');
  expect(parseKifMovesOrDrops(exported.split('\n'))).toEqual([move]);
  expect(
    parseKifMovesOrDrops([
      makeKifMoveOrDrop(initialPos, previous)!,
      ...exported.split('\n'),
      makeKifMoveOrDrop(afterPass, following)!,
    ]),
  ).toEqual([previous, move, following]);
});

test('chushogi two-step moves reuse the previous destination', () => {
  for (const [previousUsi, expectedKif] of [
    ['5a5c', '一歩目 5四獅子 （←5五）\n二歩目 仝獅子 （←5四）'],
    ['5a5d', '一歩目 仝獅子 （←5五）\n二歩目 5三獅子 （←5四）'],
    ['5a6a', '一歩目 5四獅子 （←5五）\n二歩目 5三獅子 （←5四）'],
  ]) {
    const initialPos = parseSfen(
      'chushogi',
      'k6r4/12/12/12/7N4/12/12/12/12/12/12/11K w - 1',
    ).unwrap();
    const previous = parseUsi(previousUsi)!;
    expect(initialPos.isLegal(previous)).toEqual(true);
    const pos = initialPos.play(previous);
    const move = parseUsi('5e5d5c')!;
    expect(pos.isLegal(move)).toEqual(true);
    const following = parseUsi('12a12b')!;
    expect(pos.play(move).isLegal(following)).toEqual(true);

    expect(makeKifMoveOrDrop(pos, move)).toEqual(expectedKif);
    expect(makeKifMoveOrDrop(initialPos, move, previous.to)).toEqual(expectedKif);
    expect(parseKifMovesOrDrops(expectedKif.split('\n'), previous.to)).toEqual([move]);
    expect(
      parseKifMovesOrDrops([
        makeKifMoveOrDrop(initialPos, previous)!,
        ...expectedKif.split('\n'),
        '12二玉 （←12一）',
      ]),
    ).toEqual([previous, move, following]);
  }
});

test('chushogi kif default', () => {
  const defaultPos = parseSfen('chushogi', initialSfen('chushogi')).unwrap();
  const header = makeKifHeader(defaultPos);
  expect(header).toEqual(`手合割：中将棋`);
  expect(parseKifHeader(header).unwrap()).toEqual(defaultPos);
});

test('dobutsu kif default', () => {
  const defaultPos = parseSfen('dobutsu', initialSfen('dobutsu')).unwrap();
  const header = makeKifHeader(defaultPos);
  expect(header).toEqual(`手合割：どうぶつしょうぎ`);
  expect(parseKifHeader(header).unwrap()).toEqual(defaultPos);
});

test('custom dobutsu kif header preserves board, hands, and turn', () => {
  const initialPos = parseSfen('dobutsu', initialSfen('dobutsu')).unwrap();
  const move = parseUsi('1d1c')!;
  expect(initialPos.isLegal(move)).toEqual(true);
  const pos = initialPos.play(move);
  const parsed = parseKifHeader(makeKifHeader(pos)).unwrap();

  expect(parsed.rules).toEqual(pos.rules);
  expect(parsed.board).toEqual(pos.board);
  expect(parsed.hands).toEqual(pos.hands);
  expect(parsed.turn).toEqual(pos.turn);
});

test('parse kif header and board with annanshogi handicap name', () => {
  // board takes precedence
  const pos = parseSfen(
    'annanshogi',
    '3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p 1',
  ).unwrap();
  const kifHeader = `手合割：安南
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
  const pos = parseSfen(
    'annanshogi',
    '3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p',
  ).unwrap();
  const kifHeader = `手合割：安南将棋
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
  const posFromKif = parseKifHeader(kifHeader).unwrap();
  const kifFromPos = makeKifHeader(pos);
  expect(posFromKif).toEqual(pos);
  expect(makeSfen(posFromKif)).toEqual(
    '3n5/kBp+B5/9/N2p5/+pn2p4/2R1+s4/pN7/1L7/1s2+R4 b 4g2s3l13p 1',
  );
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

test('explicit turns override default and handicap turns without diagrams', () => {
  for (const marker of ['後手番', '上手番'])
    expect(parseKifHeader(`手合割：平手\n${marker}`).unwrap().turn).toEqual('gote');
  for (const marker of ['先手番', '下手番'])
    expect(parseKifHeader(`手合割：飛車落ち\n${marker}`).unwrap().turn).toEqual('sente');
  expect(parseKifHeader('手合割：平手').unwrap().turn).toEqual('sente');
  expect(parseKifHeader('手合割：飛車落ち').unwrap().turn).toEqual('gote');
});

for (const [name, rank] of [
  ['左五枚落ち', '1nsgkgs2'],
  ['左七枚落ち', '2sgkg3'],
  ['右七枚落ち', '3gkgs2'],
]) {
  test(`parse standard handicap ${name}`, () => {
    const pos = parseKifHeader(`手合割：${name}`).unwrap();
    expect(makeSfen(pos)).toEqual(`${rank}/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1`);
    expect(parseKifHeader(makeKifHeader(pos)).unwrap()).toEqual(pos);
  });
}

test('chu shogi step pairs require ordered, continuous steps', () => {
  const first = '一歩目 5四獅子 （←5五）';
  const second = '二歩目 6四獅子 （←5四）';
  expect(parseKifMovesOrDrops([first, second])).toEqual([parseUsi('5e5d6d')]);
  for (const lines of [
    [first],
    [second],
    [second, first],
    [first, first],
    [second, second],
    [first, '二歩目 6四獅子 （←6五）'],
    [first, '6四獅子 （←5四）'],
  ])
    expect(parseKifMovesOrDrops(lines)).toEqual([]);
  expect(parseKifMovesOrDrops(['7八歩兵 （←7九）', first])).toEqual([parseUsi('7i7h')]);
});

test('chu shogi accepts padded repeated destinations', () => {
  const move = parseUsi('5e1a')!;
  for (const marker of ['同', '仝'])
    for (const space of ['', ' ', '　']) {
      const line = `${marker}${space}獅子 （←5五）`;
      expect(parseKifMoveOrDrop(line, move.to)).toEqual(move);
      expect(parseKifMoveOrDrop(line)).toEqual(undefined);
      expect(parseKifMovesOrDrops([line, '2二獅子 （←1一）'], move.to)).toEqual([
        move,
        parseUsi('1a2b'),
      ]);
    }
});

test('kif hand counts must be canonical Japanese numerals', () => {
  for (const count of ['二三', '十十', '九九', '一十', '二十一二']) {
    const result = parseKifHand('standard', `歩${count}`);
    expect(result.isErr).toEqual(true);
    if (result.isErr) expect(result.error.message).toEqual(InvalidKif.Hands);
  }
  for (const [count, value] of [
    ['一', 1],
    ['十', 10],
    ['十八', 18],
    ['二十', 20],
    ['九十九', 99],
  ] as const)
    expect(parseKifHand('standard', `歩${count}`).unwrap().get('pawn')).toEqual(value);
});

test('parse tags ignores bookmarks containing either colon width', () => {
  expect(parseTags('先手：Alice\n&opening: side pawn\n&局面：終盤\n後手：Bob')).toEqual([
    ['先手', 'Alice'],
    ['後手', 'Bob'],
  ]);
});
