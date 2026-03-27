import { test } from 'node:test';
import {
  makePieceName,
  makeUsi,
  parsePieceName,
  parseSquareName,
  parseUsi,
  squareFile,
  squareRank,
} from '../src/util.js';
import { expect } from './debug.js';
import { usiFixture } from './fixtures/usi.js';

test('square coordinates', () => {
  expect(squareFile(0)).toEqual(0);
  expect(squareFile(1)).toEqual(1);
  expect(squareFile(15)).toEqual(15);
  expect(squareFile(16)).toEqual(0);
  expect(squareFile(31)).toEqual(15);
  expect(squareFile(32)).toEqual(0);
  expect(squareFile(240)).toEqual(0);
  expect(squareFile(255)).toEqual(15);

  expect(squareRank(0)).toEqual(0);
  expect(squareRank(1)).toEqual(0);
  expect(squareRank(15)).toEqual(0);
  expect(squareRank(16)).toEqual(1);
  expect(squareRank(31)).toEqual(1);
  expect(squareRank(32)).toEqual(2);
  expect(squareRank(239)).toEqual(14);
  expect(squareRank(255)).toEqual(15);
});

test('parse squares', () => {
  expect(parseSquareName('1a')).toEqual(0);
  expect(parseSquareName('16a')).toEqual(15);
  expect(parseSquareName('1b')).toEqual(16);
  expect(parseSquareName('1c')).toEqual(32);
  expect(parseSquareName('3c')).toEqual(34);
  expect(parseSquareName('16o')).toEqual(239);
  expect(parseSquareName('1p')).toEqual(240);
  expect(parseSquareName('16p')).toEqual(255);
});

test('parse usi', () => {
  expect(parseUsi('1a9a')).toEqual({ from: 0, midStep: undefined, to: 8, promotion: false });
  expect(parseUsi('2h2c+')).toEqual({ from: 113, midStep: undefined, to: 33, promotion: true });
  expect(parseUsi('2h2c=')).toEqual({ from: 113, midStep: undefined, to: 33, promotion: false });
  expect(parseUsi('2h2c')).toEqual({ from: 113, midStep: undefined, to: 33, promotion: false });
  expect(parseUsi('P*1g')).toEqual({ role: 'pawn', to: 96 });
  expect(parseUsi('Z*1g')).toEqual(undefined);
  expect(parseUsi('P*16a')).toEqual({ role: 'pawn', to: 15 });
  expect(parseUsi('P*16p')).toEqual({ role: 'pawn', to: 255 });
  expect(parseUsi('1a16p')).toEqual({ from: 0, midStep: undefined, to: 255, promotion: false });
  expect(parseUsi('1a16p+')).toEqual({ from: 0, midStep: undefined, to: 255, promotion: true });
  expect(parseUsi('16o16p')).toEqual({ from: 239, midStep: undefined, to: 255, promotion: false });
  expect(parseUsi('16o16p+')).toEqual({ from: 239, midStep: undefined, to: 255, promotion: true });
  expect(parseUsi('16p1a')).toEqual({ from: 255, midStep: undefined, to: 0, promotion: false });
  expect(parseUsi('16p1a+')).toEqual({ from: 255, midStep: undefined, to: 0, promotion: true });
  // with midstep
  expect(parseUsi('1a1a1a')).toEqual({ from: 0, to: 0, midStep: 0, promotion: false });
  expect(parseUsi('1a1a1a=')).toEqual({ from: 0, to: 0, midStep: 0, promotion: false });
  expect(parseUsi('1a1a1a+')).toEqual({ from: 0, to: 0, midStep: 0, promotion: true });
  expect(parseUsi('16p16p16p')).toEqual({ from: 255, to: 255, midStep: 255, promotion: false });
  expect(parseUsi('16p16p16p=')).toEqual({ from: 255, to: 255, midStep: 255, promotion: false });
  expect(parseUsi('16p16p16p+')).toEqual({ from: 255, to: 255, midStep: 255, promotion: true });
});

test('make usi', () => {
  expect(makeUsi({ role: 'rook', to: 1 })).toEqual('R*2a');
  expect(makeUsi({ from: 1, to: 2 })).toEqual('2a3a');
  expect(makeUsi({ from: 2, to: 3 })).toEqual('3a4a');
  expect(makeUsi({ from: 15, to: 16 })).toEqual('16a1b');
  expect(makeUsi({ from: 0, to: 240 })).toEqual('1a1p');
  expect(makeUsi({ from: 0, to: 254 })).toEqual('1a15p');
  expect(makeUsi({ from: 0, to: 255 })).toEqual('1a16p');
  expect(makeUsi({ from: 0, to: 0, promotion: true })).toEqual('1a1a+');
  expect(makeUsi({ from: 0, to: 0, promotion: false })).toEqual('1a1a');
  expect(makeUsi({ from: 0, to: 0, promotion: undefined })).toEqual('1a1a');
  // with midstep
  expect(makeUsi({ from: 0, to: 0, midStep: 255 })).toEqual('1a16p1a');
  expect(makeUsi({ from: 0, to: 0, midStep: 255, promotion: true })).toEqual('1a16p1a+');
});

test('piece name', () => {
  expect(makePieceName({ role: 'rook', color: 'sente' })).toEqual('sente rook');
  expect(parsePieceName('sente rook')).toEqual({ color: 'sente', role: 'rook' });
  expect(parsePieceName('gote bishop')).toEqual({ color: 'gote', role: 'bishop' });
});

test('usi prod 500', () => {
  for (const usis of usiFixture) {
    for (const usi of usis.split(' ')) {
      expect(!!parseUsi(usi)).toEqual(true);
    }
  }
});
