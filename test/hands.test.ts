import { Hands } from '../src/hands.js';

test('set and get', () => {
  const hands = Hands.empty();
  expect(hands.color('sente').count()).toBe(0);
  expect(hands.color('sente').get('gold')).toBe(0);
  hands.color('sente').capture('gold');
  expect(hands.color('sente').get('gold')).toBe(1);
  expect(hands.color('sente').count()).toBe(1);
  hands.color('sente').drop('gold');
  expect(hands.color('sente').count()).toBe(0);
  expect(hands.color('sente').get('gold')).toBe(0);
});
