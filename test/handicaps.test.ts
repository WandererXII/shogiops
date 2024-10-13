import { findHandicap, findHandicaps, handicaps, isHandicap } from '../src/handicaps.js';
import { initialSfen, parseSfen } from '../src/sfen.js';
import { RULES } from '../src/types.js';

test('proper count', () => {
  expect(findHandicaps({ rules: 'standard' }).length).toBe(23);
  expect(findHandicaps({ rules: 'minishogi' }).length).toBe(5);
  expect(findHandicaps({ rules: 'chushogi' }).length).toBe(3);
  expect(findHandicaps({ rules: 'annanshogi' }).length).toBe(15);
  expect(findHandicaps({ rules: 'kyotoshogi' }).length).toBe(7);
});

test('only one field', () => {
  expect(findHandicap({ rules: 'standard' })).toBeDefined();
  expect(findHandicap({ sfen: 'standard' })).toBeUndefined();
  expect(findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1' })?.englishName).toBe(
    'Right Lance'
  );
  expect(findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -' })?.englishName).toBe(
    'Right Lance'
  );
  expect(findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w' })?.englishName).toBe(
    'Right Lance'
  );
  expect(
    findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL ' })?.englishName
  ).toBeUndefined();
  expect(
    findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL' })?.englishName
  ).toBeUndefined();
  expect(findHandicap({ sfen: '1nsgkgsnl/1r5b1/ppppppppp' })).toBeUndefined();
});

test('multiple fields', () => {
  expect(findHandicap({ rules: 'standard', japaneseName: '角落ち' })).toBeDefined();
  expect(findHandicap({ rules: 'standard', englishName: '角落ち' })).toBeUndefined();
});

test('parse validly', () => {
  handicaps.forEach(h => {
    expect(parseSfen(h.rules, h.sfen, true).isOk).toBe(true);
    expect(parseSfen(h.rules, h.sfen, true).unwrap().turn).toBe('gote');
  });
});

test('default not handicap', () => {
  RULES.forEach(r => {
    expect(isHandicap({ sfen: initialSfen(r) })).toBe(false);
  });
});
