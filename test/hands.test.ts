import { test } from 'node:test';
import { Hands } from '../src/hands.js';
import { expect } from './debug.js';

test('set and get', () => {
  const hands = Hands.empty();
  expect(hands.color('sente').count()).toEqual(0);
  expect(hands.color('sente').get('gold')).toEqual(0);
  hands.color('sente').capture('gold');
  expect(hands.color('sente').get('gold')).toEqual(1);
  expect(hands.color('sente').count()).toEqual(1);
  hands.color('sente').drop('gold');
  expect(hands.color('sente').count()).toEqual(0);
  expect(hands.color('sente').get('gold')).toEqual(0);
});
