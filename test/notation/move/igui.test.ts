import { test } from 'node:test';
import { makeJapaneseMoveOrDrop } from '../../../src/notation/move/japanese.js';
import { makeKitaoKawasakiMoveOrDrop } from '../../../src/notation/move/kitao-kawasaki.js';
import { makeWesternMoveOrDrop } from '../../../src/notation/move/western.js';
import { makeWesternEngineMoveOrDrop } from '../../../src/notation/move/western-engine.js';
import { makeYorozuyaMoveOrDrop } from '../../../src/notation/move/yorozuya.js';
import { parseSfen } from '../../../src/sfen.js';
import { parseSquareName, parseUsi } from '../../../src/util.js';
import { expect } from '../../debug.js';

for (const [turn, board, target, rank, kanjiRank] of [
  ['b', '11k/12/12/8p3/7+D1+D2/12/12/12/12/12/12/K11', '4d', '4', '四'],
  ['w', '11k/12/12/12/7+d1+d2/8P3/12/12/12/12/12/K11', '4f', '6', '六'],
]) {
  for (const [name, format, prefix, suffix, origins] of [
    ['western', makeWesternMoveOrDrop, '+D', `x!4${rank}`, ['55', '35']],
    ['western engine', makeWesternEngineMoveOrDrop, '+D', `x!${target}`, ['5e', '3e']],
    ['Kitao-Kawasaki', makeKitaoKawasakiMoveOrDrop, '鷲', `x!4${rank}`, ['(55)', '(35)']],
  ] as const) {
    test(`${name} distinguishes ${turn} stationary eagle captures`, () => {
      const pos = parseSfen('chushogi', `${board} ${turn}`, true).unwrap();
      for (const [index, from] of ['5e', '3e'].entries()) {
        const move = parseUsi(`${from}${target}${from}`)!;
        expect(pos.isLegal(move)).toEqual(true);
        expect(format(pos, move)).toEqual(`${prefix}${origins[index]}${suffix}`);

        // Keep the shorter notation when only one piece can make this capture.
        const other = parseSquareName(index === 0 ? '3e' : '5e')!;
        const single = pos.update({ board: pos.board.withoutPieceAt(other) });
        expect(format(single, move)).toEqual(`${prefix}${suffix}`);
      }
    });
  }
  test(`Japanese and Yorozuya record both legs of ambiguous ${turn} stationary captures`, () => {
    const pos = parseSfen('chushogi', `${board} ${turn}`, true).unwrap();
    for (const [index, from] of ['5e', '3e'].entries()) {
      const move = parseUsi(`${from}${target}${from}`)!;
      const japanese = `４${kanjiRank}・${index === 0 ? '５' : '３'}五鷲`;
      const yorozuya = `卯${kanjiRank}・${index === 0 ? '辰' : '寅'}五鷲`;
      expect(pos.isLegal(move)).toEqual(true);
      expect(makeJapaneseMoveOrDrop(pos, move)).toEqual(japanese);
      expect(makeYorozuyaMoveOrDrop(pos, move)).toEqual(yorozuya);
      const other = parseSquareName(index === 0 ? '3e' : '5e')!;
      const single = pos.update({ board: pos.board.withoutPieceAt(other) });
      expect(makeJapaneseMoveOrDrop(single, move)).toEqual(`４${kanjiRank}居喰い`);
      expect(makeYorozuyaMoveOrDrop(single, move)).toEqual(`卯${kanjiRank}居喰い`);
    }
  });
}

test('Japanese stationary captures distinguish different piece types', () => {
  const pos = parseSfen('chushogi', '11k/12/12/8p3/7+D1N2/12/12/12/12/12/12/K11 b', true).unwrap();
  for (const from of ['5e', '3e']) {
    const move = parseUsi(`${from}4d${from}`)!;
    expect(pos.isLegal(move)).toEqual(true);
    expect(makeJapaneseMoveOrDrop(pos, move)).toEqual(
      `４四・${from === '5e' ? '５五鷲' : '３五獅'}`,
    );
  }
  // Western notation already distinguishes an eagle from a lion by role.
  expect(makeWesternMoveOrDrop(pos, parseUsi('5e4d5e')!)).toEqual('+Dx!44');
  expect(makeWesternMoveOrDrop(pos, parseUsi('3e4d3e')!)).toEqual('Lnx!44');
});

test('an ordinary capture does not make a stationary capture ambiguous', () => {
  const pos = parseSfen('chushogi', '11k/12/9+D2/8p3/7+D4/12/12/12/12/12/12/K11 b', true).unwrap();
  // The eagle on 3c can capture backwards, but cannot return on the same turn.
  expect(pos.isLegal(parseUsi('3c4d')!)).toEqual(true);
  expect(pos.isLegal(parseUsi('3c4d3c')!)).toEqual(false);
  const move = parseUsi('5e4d5e')!;
  expect(pos.isLegal(move)).toEqual(true);
  expect(makeWesternMoveOrDrop(pos, move)).toEqual('+Dx!44');
  expect(makeWesternEngineMoveOrDrop(pos, move)).toEqual('+Dx!4d');
  expect(makeKitaoKawasakiMoveOrDrop(pos, move)).toEqual('鷲x!44');
  expect(makeJapaneseMoveOrDrop(pos, move)).toEqual('４四居喰い');
  expect(makeYorozuyaMoveOrDrop(pos, move)).toEqual('卯四居喰い');
});
