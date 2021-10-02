import { makeCsaSquare, parseCsaSquare } from '../src/csaUtil';
import { parseSquare } from '../src/util';

test('parse csa square', () => {
  expect(parseCsaSquare('11')).toEqual(parseSquare('1a'));
  expect(parseCsaSquare('12')).toEqual(parseSquare('1b'));
  expect(parseCsaSquare('66')).toEqual(parseSquare('6f'));
  expect(parseCsaSquare('89')).toEqual(parseSquare('8i'));
  expect(parseCsaSquare('99')).toEqual(parseSquare('9i'));
});

test('all squares', () => {
  for (let i = 0; i < 81; i++) {
    expect(parseCsaSquare(makeCsaSquare(i))).toEqual(i);
    expect(parseCsaSquare(makeCsaSquare(i))).toEqual(i);
  }
});
