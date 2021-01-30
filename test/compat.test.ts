import { Shogi } from '../src/shogi';
import { shogigroundDests } from '../src/compat';

test('shogiground dests', () => {
  const pos = Shogi.default();
  const dests = shogigroundDests(pos);
  expect(dests.get('c3')).toContain('c4');
  expect(dests.get('e1')).toContain('d2');
  expect(dests.get('e1')).not.toContain('d1');
});
