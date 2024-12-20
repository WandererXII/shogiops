import {
  kanjiToNumber,
  makeJapaneseSquare,
  makeNumberSquare,
  numberToKanji,
  parseJapaneseSquare,
} from '@/notation/util.js';
import { parseSquareName } from '@/util.js';
import { expect, test } from 'vitest';

test('parse kif square', () => {
  expect(parseJapaneseSquare('１一')).toEqual(parseSquareName('1a'));
  expect(parseJapaneseSquare('1一')).toEqual(parseSquareName('1a'));
  expect(parseJapaneseSquare('６六')).toEqual(parseSquareName('6f'));
  expect(parseJapaneseSquare('6六')).toEqual(parseSquareName('6f'));
  expect(parseJapaneseSquare('９九')).toEqual(parseSquareName('9i'));
  expect(parseJapaneseSquare('9九')).toEqual(parseSquareName('9i'));
  expect(parseJapaneseSquare('10九')).toEqual(parseSquareName('10i'));
  expect(parseJapaneseSquare('11九')).toEqual(parseSquareName('11i'));
  expect(parseJapaneseSquare('1十')).toEqual(parseSquareName('1j'));
  expect(parseJapaneseSquare('11十')).toEqual(parseSquareName('11j'));
  expect(parseJapaneseSquare('1十一')).toEqual(parseSquareName('1k'));
  expect(parseJapaneseSquare('11十一')).toEqual(parseSquareName('11k'));
  expect(parseJapaneseSquare('10十二')).toEqual(parseSquareName('10l'));
});

test('make kif destination square', () => {
  expect(makeJapaneseSquare(parseSquareName('1a'))).toEqual('１一');
  expect(makeJapaneseSquare(parseSquareName('6f'))).toEqual('６六');
  expect(makeJapaneseSquare(parseSquareName('9i'))).toEqual('９九');
});

test('make kif origination square', () => {
  expect(makeNumberSquare(parseSquareName('1a'))).toEqual('11');
  expect(makeNumberSquare(parseSquareName('6f'))).toEqual('66');
  expect(makeNumberSquare(parseSquareName('9i'))).toEqual('99');
});

test('all squares', () => {
  for (let i = 0; i < 256; i++) {
    expect(parseJapaneseSquare(makeJapaneseSquare(i))).toEqual(i);
  }
});

test('number to kanji', () => {
  expect(numberToKanji(1)).toEqual('一');
  expect(numberToKanji(10)).toEqual('十');
  expect(numberToKanji(15)).toEqual('十五');
  expect(numberToKanji(20)).toEqual('二十');
  expect(numberToKanji(99)).toEqual('九十九');
});

test('kanji to number', () => {
  expect(kanjiToNumber('一')).toEqual(1);
  expect(kanjiToNumber('十')).toEqual(10);
  expect(kanjiToNumber('十五')).toEqual(15);
  expect(kanjiToNumber('二十')).toEqual(20);
  expect(kanjiToNumber('九十九')).toEqual(99);
});

test('1 to 99, kanji to number and back', () => {
  for (let i = 1; i < 100; i++) {
    expect(kanjiToNumber(numberToKanji(i))).toEqual(i);
  }
});
