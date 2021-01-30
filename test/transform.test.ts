import { SquareSet } from '../src/squareSet';
import { flipVertical, flipHorizontal, rotate180 } from '../src/transform';

const r = new SquareSet(0x1211108, 0x220f038, 0x1e11088);

test('flip vertical', () => {
  expect(flipVertical(SquareSet.full())).toEqual(SquareSet.full());
  expect(flipVertical(r)).toEqual(new SquareSet(0x2211078, 0xe0f088, 0x4211048));
});

test('flip horizontal', () => {
  expect(flipHorizontal(SquareSet.full())).toEqual(SquareSet.full());
  expect(flipHorizontal(r)).toEqual(new SquareSet(0x904421, 0x887838, 0xf04422));
});

// test('flip diagonal', () => {
//   expect(flipDiagonal(SquareSet.full())).toEqual(SquareSet.full());
//   expect(flipDiagonal(r)).toEqual(new SquareSet());
// });

test('rotate 180', () => {
  expect(rotate180(SquareSet.full())).toEqual(SquareSet.full());
  expect(rotate180(r)).toEqual(new SquareSet(0x88443c, 0xe07822, 0x844424));
});
