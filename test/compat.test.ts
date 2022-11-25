import { shogigroundDropDests, shogigroundMoveDests } from '../src/compat';
import { parseSfen } from '../src/sfen';
import { Shogi } from '../src/variant/shogi';

test('shogiground dests', () => {
  const pos = Shogi.default();
  const dests = shogigroundMoveDests(pos);
  expect(dests.get('7g')).toContain('7f');
  expect(dests.get('5i')).toContain('6h');
  expect(dests.get('5i')).not.toContain('6i');
});

test('shogiground drop dests', () => {
  const dests1 = shogigroundDropDests(Shogi.default());
  expect(dests1.get('sente pawn')).toEqual(undefined);

  const pos2 = parseSfen('standard', '9/9/5k3/9/9/9/9/4K4/9 b N 1').unwrap();
  const dests2 = shogigroundDropDests(pos2);
  const knightDests2 = dests2.get(`${pos2.turn} knight`);
  expect(knightDests2).toContain('5i');
  expect(knightDests2).not.toContain('5h');
  expect(knightDests2).toContain('5f');
  expect(knightDests2).toContain('5c');
  expect(knightDests2).not.toContain('5b');
  expect(knightDests2).not.toContain('5a');
  expect(knightDests2).not.toContain('4c');

  const pos3 = parseSfen('standard', '3rkr3/9/8p/4N4/1B7/9/1SG6/1KS6/9 b LPp 1').unwrap();
  const dests3 = shogigroundDropDests(pos3);
  expect(dests3.get('sente pawn')).toContain('5c');
  expect(dests3.get('sente pawn')).not.toContain('5b');
  expect(dests3.get('sente lance')).toContain('5b');
});
