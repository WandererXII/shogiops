import { makeJapaneseMove } from '../../src/notation/japanese';
import { parseSfen } from '../../src/sfen';
import { parseUsi } from '../../src/util';
import { Shogi } from '../../src/variant/shogi';

test('basic moves', () => {
  const pos = Shogi.default();
  const move = parseUsi('7g7f')!;
  expect(makeJapaneseMove(pos, move)).toEqual('７六歩');
  pos.play(move);
  expect(makeJapaneseMove(pos, parseUsi('3c3d')!)).toEqual('３四歩');
});

test('corect drop amb resolution', () => {
  const pos = parseSfen('standard', 'k7K/9/9/9/9/9/S8/8g/9 b SPg 1').unwrap();
  expect(makeJapaneseMove(pos, parseUsi('S*9f')!)).toEqual('９六銀打');
  expect(makeJapaneseMove(pos, parseUsi('S*5e')!)).toEqual('５五銀');
  pos.play(parseUsi('S*9f')!);
  expect(makeJapaneseMove(pos, parseUsi('G*1g')!)).toEqual('１七金打');
  expect(makeJapaneseMove(pos, parseUsi('G*5e')!)).toEqual('５五金');
});

test('corect move amb resolution', () => {
  const pos = parseSfen('standard', 'k7K/9/9/9/9/9/2G6/3G5/2G6 b - 1').unwrap();
  expect(makeJapaneseMove(pos, parseUsi('7g7h')!)).toEqual('７八金引');
  expect(makeJapaneseMove(pos, parseUsi('6h7h')!)).toEqual('７八金寄');
  expect(makeJapaneseMove(pos, parseUsi('7i7h')!)).toEqual('７八金直');

  const pos2 = parseSfen('standard', '3k1K3/9/9/5B3/9/9/9/1B7/9 b - 1').unwrap();
  expect(makeJapaneseMove(pos2, parseUsi('4d6f')!)).toEqual('６六角引');
  expect(makeJapaneseMove(pos2, parseUsi('8h6f')!)).toEqual('６六角上');

  const pos3 = parseSfen('standard', '3k1K3/9/9/3S1S3/9/3S1S3/9/9/9 b - 1').unwrap();
  expect(makeJapaneseMove(pos3, parseUsi('4d5e')!)).toEqual('５五銀右引');
  expect(makeJapaneseMove(pos3, parseUsi('4f5e')!)).toEqual('５五銀右上');
  expect(makeJapaneseMove(pos3, parseUsi('6d5e')!)).toEqual('５五銀左引');
  expect(makeJapaneseMove(pos3, parseUsi('6f5e')!)).toEqual('５五銀左上');

  const pos4 = parseSfen('standard', '3k1K3/9/9/9/9/3GGG3/9/9/9 b - 1').unwrap();
  expect(makeJapaneseMove(pos4, parseUsi('4f5e')!)).toEqual('５五金右');
  expect(makeJapaneseMove(pos4, parseUsi('5f5e')!)).toEqual('５五金直');
  expect(makeJapaneseMove(pos4, parseUsi('6f5e')!)).toEqual('５五金左');

  const pos5 = parseSfen('standard', '3k1K3/9/9/9/9/9/3+B+B4/9/9 b - 1').unwrap();
  expect(makeJapaneseMove(pos5, parseUsi('6g5f')!)).toEqual('５六馬左');
  expect(makeJapaneseMove(pos5, parseUsi('5g5f')!)).toEqual('５六馬右');
});

test('corect move amb resolution - gote pov', () => {
  const pos = parseSfen('standard', 'k7K/9/9/9/9/9/2g6/3g5/2g6 w - 1').unwrap();
  expect(makeJapaneseMove(pos, parseUsi('7g7h')!)).toEqual('７八金直');
  expect(makeJapaneseMove(pos, parseUsi('6h7h')!)).toEqual('７八金寄');
  expect(makeJapaneseMove(pos, parseUsi('7i7h')!)).toEqual('７八金引');

  const pos2 = parseSfen('standard', '3k1K3/9/9/5b3/9/9/9/1b7/9 w - 1').unwrap();
  expect(makeJapaneseMove(pos2, parseUsi('4d6f')!)).toEqual('６六角上');
  expect(makeJapaneseMove(pos2, parseUsi('8h6f')!)).toEqual('６六角引不成');

  const pos3 = parseSfen('standard', '3k1K3/9/9/3s1s3/9/3s1s3/9/9/9 w - 1').unwrap();
  expect(makeJapaneseMove(pos3, parseUsi('4d5e')!)).toEqual('５五銀左上');
  expect(makeJapaneseMove(pos3, parseUsi('4f5e')!)).toEqual('５五銀左引');
  expect(makeJapaneseMove(pos3, parseUsi('6d5e')!)).toEqual('５五銀右上');
  expect(makeJapaneseMove(pos3, parseUsi('6f5e')!)).toEqual('５五銀右引');

  const pos4 = parseSfen('standard', '3k1K3/9/9/9/9/3ggg3/9/9/9 w - 1').unwrap();
  expect(makeJapaneseMove(pos4, parseUsi('4f5g')!)).toEqual('５七金左');
  expect(makeJapaneseMove(pos4, parseUsi('5f5g')!)).toEqual('５七金直');
  expect(makeJapaneseMove(pos4, parseUsi('6f5g')!)).toEqual('５七金右');

  const pos5 = parseSfen('standard', '3k1K3/9/9/9/9/9/3+b+b4/9/9 w - 1').unwrap();
  expect(makeJapaneseMove(pos5, parseUsi('6g5f')!)).toEqual('５六馬右');
  expect(makeJapaneseMove(pos5, parseUsi('5g5f')!)).toEqual('５六馬左');
});

test('中 amb resolution', () => {
  const pos1 = parseSfen('standard', '3k1K3/9/9/9/3+B+B+B3/9/3+B+B+B3/9/9 b - 1').unwrap();
  expect(makeJapaneseMove(pos1, parseUsi('4g5f')!)).toEqual('５六馬右行');
  expect(makeJapaneseMove(pos1, parseUsi('5g5f')!)).toEqual('５六馬中行');
  expect(makeJapaneseMove(pos1, parseUsi('6g5f')!)).toEqual('５六馬左行');

  const pos2 = parseSfen('standard', '3k1K3/9/9/9/9/9/3+B+B+B3/9/9 b - 1').unwrap();
  expect(makeJapaneseMove(pos2, parseUsi('4g5f')!)).toEqual('５六馬右');
  expect(makeJapaneseMove(pos2, parseUsi('5g5f')!)).toEqual('５六馬中');
  expect(makeJapaneseMove(pos2, parseUsi('6g5f')!)).toEqual('５六馬左');
});

test('annanshogi resolution', () => {
  const pos1 = parseSfen('annanshogi', '9/k8/9/9/9/5GGG1/5G1G1/5N1N1/K8 b - 1').unwrap();
  expect(makeJapaneseMove(pos1, parseUsi('2f3e')!)).toEqual('３五金右上');
  expect(makeJapaneseMove(pos1, parseUsi('2g3e')!)).toEqual('３五金右跳');
});
