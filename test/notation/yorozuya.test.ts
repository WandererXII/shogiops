import { makeJapaneseSquare } from '@/notation/util.js';
import { convertJapaneseToYorozuya, makeYorozuyaMoveOrDrop } from '@/notation/yorozuya.js';
import { parseSquareName, parseUsi } from '@/util.js';
import { Shogi } from '@/variant/shogi.js';
import { expect, test } from 'vitest';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeYorozuyaMoveOrDrop(pos, move)).toEqual('午六歩');
  pos.play(move);
  expect(makeYorozuyaMoveOrDrop(pos, parseUsi('3c3d')!)).toEqual('寅四歩');
});

test('jp conversion', () => {
  expect(convertJapaneseToYorozuya(makeJapaneseSquare(parseSquareName('1l')))).toEqual('子十二');
  expect(convertJapaneseToYorozuya(makeJapaneseSquare(parseSquareName('12a')))).toEqual('亥一');
  expect(convertJapaneseToYorozuya('6三・6二獅')).toEqual('巳三・巳二獅');
  expect(convertJapaneseToYorozuya('4三龍')).toEqual('卯三龍');
  expect(convertJapaneseToYorozuya('4三龍不成')).toEqual('卯三龍');
  expect(convertJapaneseToYorozuya('4三龍成')).toEqual('卯三龍ナル');
  expect(convertJapaneseToYorozuya('4三龍')).toEqual('卯三龍');
  expect(convertJapaneseToYorozuya('1一馬')).toEqual('子一馬');
  expect(convertJapaneseToYorozuya('12十二角')).toEqual('亥十二角');
  expect(convertJapaneseToYorozuya('5五金')).toEqual('辰五金');
  expect(convertJapaneseToYorozuya('7七香')).toEqual('午七香');
  expect(convertJapaneseToYorozuya('10十飛')).toEqual('酉十飛');
  expect(convertJapaneseToYorozuya('3二玉')).toEqual('寅二玉');
  expect(convertJapaneseToYorozuya('9八銀')).toEqual('申八銀');
  expect(convertJapaneseToYorozuya('2六桂')).toEqual('丑六桂');
  expect(convertJapaneseToYorozuya('6四歩')).toEqual('巳四歩');
  expect(convertJapaneseToYorozuya('11九王')).toEqual('戌九王');
  expect(convertJapaneseToYorozuya('8三兵')).toEqual('未三兵');
  expect(convertJapaneseToYorozuya('1十二香')).toEqual('子十二香');
  expect(convertJapaneseToYorozuya('12一飛')).toEqual('亥一飛');
  expect(convertJapaneseToYorozuya('5二歩')).toEqual('辰二歩');
  expect(convertJapaneseToYorozuya('10七金')).toEqual('酉七金');
  expect(convertJapaneseToYorozuya('3三銀')).toEqual('寅三銀');
  expect(convertJapaneseToYorozuya('9九王')).toEqual('申九王');
  expect(convertJapaneseToYorozuya('５六金寄')).toEqual('辰六金寄');
});
