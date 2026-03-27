import { test } from 'node:test';
import { RULES } from '../src/constants.js';
import { findHandicap, findHandicaps, handicaps, isHandicap } from '../src/handicaps.js';
import { initialSfen, parseSfen } from '../src/sfen.js';
import { expect } from './debug.js';

test('proper count', () => {
  expect(findHandicaps({ rules: 'standard' }).length).toEqual(34);
  expect(findHandicaps({ rules: 'minishogi' }).length).toEqual(5);
  expect(findHandicaps({ rules: 'chushogi' }).length).toEqual(3);
  expect(findHandicaps({ rules: 'annanshogi' }).length).toEqual(15);
  expect(findHandicaps({ rules: 'kyotoshogi' }).length).toEqual(7);
  expect(findHandicaps({ rules: 'checkshogi' }).length).toEqual(34);
});

test('only one field', () => {
  expect(!!findHandicap({ rules: 'standard' })).toEqual(true);
  expect(findHandicap({ sfen: 'standard' })).toEqual(undefined);
  expect(
    findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1' })
      ?.englishName,
  ).toEqual('Right Lance');
  expect(
    findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -' })
      ?.englishName,
  ).toEqual('Right Lance');
  expect(
    findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w' })
      ?.englishName,
  ).toEqual('Right Lance');
  expect(
    findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL ' })
      ?.englishName,
  ).toEqual(undefined);
  expect(
    findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL' })
      ?.englishName,
  ).toEqual(undefined);
  expect(findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp' })).toEqual(undefined);
});

test('multiple fields', () => {
  expect(findHandicap({ rules: 'standard', englishName: '角落ち' })).toEqual(undefined);
  expect(findHandicap({ rules: 'standard', japaneseName: '角落ち' })?.japaneseName).toEqual(
    '角落ち',
  );
});

test('parse validly', () => {
  handicaps.forEach((h) => {
    expect(parseSfen(h.rules, h.sfen, true).isOk).toEqual(true);
    expect(parseSfen(h.rules, h.sfen, true).unwrap().turn).toEqual('gote');
  });
});

test('default not handicap', () => {
  RULES.forEach((r) => {
    expect(isHandicap({ sfen: initialSfen(r) })).toEqual(false);
  });
});
