import { scalashogiCharPair, shogigroundDropDests, shogigroundMoveDests } from '@/compat.js';
import { parseSfen } from '@/sfen.js';
import type { Rules } from '@/types.js';
import { parseUsi } from '@/util.js';
import { Shogi } from '@/variant/shogi.js';
import { expect, test } from 'vitest';

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

function convStr(usi: string, rules: Rules = 'standard') {
  const parsedUsi = parseUsi(usi)!;
  return scalashogiCharPair(parsedUsi, rules);
}
test('scalashogiCharPair - moves', () => {
  expect(convStr('1a1b')).toBe(`#,`);
  expect(convStr('1a1b+')).toBe(`,#`);
  expect(convStr('1b1a')).toBe(`,#`);
  expect(convStr('1b1a+')).toBe(`#,`);
  expect(convStr('1a1c')).toBe(`#5`);
  expect(convStr('1a1c+')).toBe(`5#`);
  expect(convStr('1c1a')).toBe(`5#`);
  expect(convStr('1c1a+')).toBe(`#5`);
  expect(convStr('1a1d')).toBe(`#>`);
  expect(convStr('1a1d+')).toBe(`>#`);
  expect(convStr('1d1a')).toBe(`>#`);
  expect(convStr('1d1a+')).toBe(`#>`);
  expect(convStr('1a1e')).toBe(`#G`);
  expect(convStr('1a1e+')).toBe(`G#`);
  expect(convStr('1e1a')).toBe(`G#`);
  expect(convStr('1e1a+')).toBe(`#G`);
  expect(convStr('1a1f')).toBe(`#P`);
  expect(convStr('1a1f+')).toBe(`P#`);
  expect(convStr('1f1a')).toBe(`P#`);
  expect(convStr('1f1a+')).toBe(`#P`);
  expect(convStr('1a1g')).toBe(`#Y`);
  expect(convStr('1a1g+')).toBe(`Y#`);
  expect(convStr('1g1a')).toBe(`Y#`);
  expect(convStr('1g1a+')).toBe(`#Y`);
  expect(convStr('1a1h')).toBe(`#b`);
  expect(convStr('1a1h+')).toBe(`b#`);
  expect(convStr('1h1a')).toBe(`b#`);
  expect(convStr('1h1a+')).toBe(`#b`);
  expect(convStr('1a1i')).toBe(`#k`);
  expect(convStr('1a1i+')).toBe(`k#`);
  expect(convStr('1i1a')).toBe(`k#`);
  expect(convStr('1i1a+')).toBe(`#k`);
  expect(convStr('1a2a')).toBe(`#$`);
  expect(convStr('1a2a+')).toBe(`$#`);
  expect(convStr('2a1a')).toBe(`$#`);
  expect(convStr('2a1a+')).toBe(`#$`);
  expect(convStr('1a2b')).toBe(`#-`);
  expect(convStr('1a2b+')).toBe(`-#`);
  expect(convStr('2b1a')).toBe(`-#`);
  expect(convStr('2b1a+')).toBe(`#-`);
  expect(convStr('1a2c')).toBe(`#6`);
  expect(convStr('1a2c+')).toBe(`6#`);
  expect(convStr('2c1a')).toBe(`6#`);
  expect(convStr('2c1a+')).toBe(`#6`);
  expect(convStr('1a2d')).toBe(`#?`);
  expect(convStr('1a2d+')).toBe(`?#`);
  expect(convStr('2d1a')).toBe(`?#`);
  expect(convStr('2d1a+')).toBe(`#?`);
  expect(convStr('1a2e')).toBe(`#H`);
  expect(convStr('1a2e+')).toBe(`H#`);
  expect(convStr('2e1a')).toBe(`H#`);
  expect(convStr('2e1a+')).toBe(`#H`);
  expect(convStr('1a2f')).toBe(`#Q`);
  expect(convStr('1a2f+')).toBe(`Q#`);
  expect(convStr('2f1a')).toBe(`Q#`);
  expect(convStr('2f1a+')).toBe(`#Q`);
  expect(convStr('1a2g')).toBe(`#Z`);
  expect(convStr('1a2g+')).toBe(`Z#`);
  expect(convStr('2g1a')).toBe(`Z#`);
  expect(convStr('2g1a+')).toBe(`#Z`);
  expect(convStr('1a2h')).toBe(`#c`);
  expect(convStr('1a2h+')).toBe(`c#`);
  expect(convStr('2h1a')).toBe(`c#`);
  expect(convStr('2h1a+')).toBe(`#c`);
  expect(convStr('1a2i')).toBe(`#l`);
  expect(convStr('1a2i+')).toBe(`l#`);
  expect(convStr('2i1a')).toBe(`l#`);
  expect(convStr('2i1a+')).toBe(`#l`);
  expect(convStr('1a3a')).toBe(`#%`);
  expect(convStr('1a3a+')).toBe(`%#`);
  expect(convStr('3a1a')).toBe(`%#`);
  expect(convStr('3a1a+')).toBe(`#%`);
  expect(convStr('1a3b')).toBe(`#.`);
  expect(convStr('1a3b+')).toBe(`.#`);
  expect(convStr('3b1a')).toBe(`.#`);
  expect(convStr('3b1a+')).toBe(`#.`);
  expect(convStr('1a3c')).toBe(`#7`);
  expect(convStr('1a3c+')).toBe(`7#`);
  expect(convStr('3c1a')).toBe(`7#`);
  expect(convStr('3c1a+')).toBe(`#7`);
  expect(convStr('1a3d')).toBe(`#@`);
  expect(convStr('1a3d+')).toBe(`@#`);
  expect(convStr('3d1a')).toBe(`@#`);
  expect(convStr('3d1a+')).toBe(`#@`);
  expect(convStr('1a3e')).toBe(`#I`);
  expect(convStr('1a3e+')).toBe(`I#`);
  expect(convStr('3e1a')).toBe(`I#`);
  expect(convStr('3e1a+')).toBe(`#I`);
  expect(convStr('1a3f')).toBe(`#R`);
  expect(convStr('1a3f+')).toBe(`R#`);
  expect(convStr('3f1a')).toBe(`R#`);
  expect(convStr('3f1a+')).toBe(`#R`);
  expect(convStr('1a3g')).toBe(`#[`);
  expect(convStr('1a3g+')).toBe(`[#`);
  expect(convStr('3g1a')).toBe(`[#`);
  expect(convStr('3g1a+')).toBe(`#[`);
  expect(convStr('1a3h')).toBe(`#d`);
  expect(convStr('1a3h+')).toBe(`d#`);
  expect(convStr('3h1a')).toBe(`d#`);
  expect(convStr('3h1a+')).toBe(`#d`);
  expect(convStr('1a3i')).toBe(`#m`);
  expect(convStr('1a3i+')).toBe(`m#`);
  expect(convStr('3i1a')).toBe(`m#`);
  expect(convStr('3i1a+')).toBe(`#m`);
  expect(convStr('1a4a')).toBe(`#&`);
  expect(convStr('1a4a+')).toBe(`&#`);
  expect(convStr('4a1a')).toBe(`&#`);
  expect(convStr('4a1a+')).toBe(`#&`);
  expect(convStr('1a4b')).toBe(`#/`);
  expect(convStr('1a4b+')).toBe(`/#`);
  expect(convStr('4b1a')).toBe(`/#`);
  expect(convStr('4b1a+')).toBe(`#/`);
  expect(convStr('1a4c')).toBe(`#8`);
  expect(convStr('1a4c+')).toBe(`8#`);
  expect(convStr('4c1a')).toBe(`8#`);
  expect(convStr('4c1a+')).toBe(`#8`);
  expect(convStr('1a4d')).toBe(`#A`);
  expect(convStr('1a4d+')).toBe(`A#`);
  expect(convStr('4d1a')).toBe(`A#`);
  expect(convStr('4d1a+')).toBe(`#A`);
  expect(convStr('1a4e')).toBe(`#J`);
  expect(convStr('1a4e+')).toBe(`J#`);
  expect(convStr('4e1a')).toBe(`J#`);
  expect(convStr('4e1a+')).toBe(`#J`);
  expect(convStr('1a4f')).toBe(`#S`);
  expect(convStr('1a4f+')).toBe(`S#`);
  expect(convStr('4f1a')).toBe(`S#`);
  expect(convStr('4f1a+')).toBe(`#S`);
  expect(convStr('1a4g')).toBe(`#\\`);
  expect(convStr('1a4g+')).toBe(`\\#`);
  expect(convStr('4g1a')).toBe(`\\#`);
  expect(convStr('4g1a+')).toBe(`#\\`);
  expect(convStr('1a4h')).toBe(`#e`);
  expect(convStr('1a4h+')).toBe(`e#`);
  expect(convStr('4h1a')).toBe(`e#`);
  expect(convStr('4h1a+')).toBe(`#e`);
  expect(convStr('1a4i')).toBe(`#n`);
  expect(convStr('1a4i+')).toBe(`n#`);
  expect(convStr('4i1a')).toBe(`n#`);
  expect(convStr('4i1a+')).toBe(`#n`);
  expect(convStr('1a5a')).toBe(`#'`);
  expect(convStr('1a5a+')).toBe(`'#`);
  expect(convStr('5a1a')).toBe(`'#`);
  expect(convStr('5a1a+')).toBe(`#'`);
  expect(convStr('1a5b')).toBe(`#0`);
  expect(convStr('1a5b+')).toBe(`0#`);
  expect(convStr('5b1a')).toBe(`0#`);
  expect(convStr('5b1a+')).toBe(`#0`);
  expect(convStr('1a5c')).toBe(`#9`);
  expect(convStr('1a5c+')).toBe(`9#`);
  expect(convStr('5c1a')).toBe(`9#`);
  expect(convStr('5c1a+')).toBe(`#9`);
  expect(convStr('1a5d')).toBe(`#B`);
  expect(convStr('1a5d+')).toBe(`B#`);
  expect(convStr('5d1a')).toBe(`B#`);
  expect(convStr('5d1a+')).toBe(`#B`);
  expect(convStr('1a5e')).toBe(`#K`);
  expect(convStr('1a5e+')).toBe(`K#`);
  expect(convStr('5e1a')).toBe(`K#`);
  expect(convStr('5e1a+')).toBe(`#K`);
  expect(convStr('1a5f')).toBe(`#T`);
  expect(convStr('1a5f+')).toBe(`T#`);
  expect(convStr('5f1a')).toBe(`T#`);
  expect(convStr('5f1a+')).toBe(`#T`);
  expect(convStr('1a5g')).toBe(`#]`);
  expect(convStr('1a5g+')).toBe(`]#`);
  expect(convStr('5g1a')).toBe(`]#`);
  expect(convStr('5g1a+')).toBe(`#]`);
  expect(convStr('1a5h')).toBe(`#f`);
  expect(convStr('1a5h+')).toBe(`f#`);
  expect(convStr('5h1a')).toBe(`f#`);
  expect(convStr('5h1a+')).toBe(`#f`);
  expect(convStr('1a5i')).toBe(`#o`);
  expect(convStr('1a5i+')).toBe(`o#`);
  expect(convStr('5i1a')).toBe(`o#`);
  expect(convStr('5i1a+')).toBe(`#o`);
  expect(convStr('1a6a')).toBe(`#(`);
  expect(convStr('1a6a+')).toBe(`(#`);
  expect(convStr('6a1a')).toBe(`(#`);
  expect(convStr('6a1a+')).toBe(`#(`);
  expect(convStr('1a6b')).toBe(`#1`);
  expect(convStr('1a6b+')).toBe(`1#`);
  expect(convStr('6b1a')).toBe(`1#`);
  expect(convStr('6b1a+')).toBe(`#1`);
  expect(convStr('1a6c')).toBe(`#:`);
  expect(convStr('1a6c+')).toBe(`:#`);
  expect(convStr('6c1a')).toBe(`:#`);
  expect(convStr('6c1a+')).toBe(`#:`);
  expect(convStr('1a6d')).toBe(`#C`);
  expect(convStr('1a6d+')).toBe(`C#`);
  expect(convStr('6d1a')).toBe(`C#`);
  expect(convStr('6d1a+')).toBe(`#C`);
  expect(convStr('1a6e')).toBe(`#L`);
  expect(convStr('1a6e+')).toBe(`L#`);
  expect(convStr('6e1a')).toBe(`L#`);
  expect(convStr('6e1a+')).toBe(`#L`);
  expect(convStr('1a6f')).toBe(`#U`);
  expect(convStr('1a6f+')).toBe(`U#`);
  expect(convStr('6f1a')).toBe(`U#`);
  expect(convStr('6f1a+')).toBe(`#U`);
  expect(convStr('1a6g')).toBe(`#^`);
  expect(convStr('1a6g+')).toBe(`^#`);
  expect(convStr('6g1a')).toBe(`^#`);
  expect(convStr('6g1a+')).toBe(`#^`);
  expect(convStr('1a6h')).toBe(`#g`);
  expect(convStr('1a6h+')).toBe(`g#`);
  expect(convStr('6h1a')).toBe(`g#`);
  expect(convStr('6h1a+')).toBe(`#g`);
  expect(convStr('1a6i')).toBe(`#p`);
  expect(convStr('1a6i+')).toBe(`p#`);
  expect(convStr('6i1a')).toBe(`p#`);
  expect(convStr('6i1a+')).toBe(`#p`);
  expect(convStr('1a7a')).toBe(`#)`);
  expect(convStr('1a7a+')).toBe(`)#`);
  expect(convStr('7a1a')).toBe(`)#`);
  expect(convStr('7a1a+')).toBe(`#)`);
  expect(convStr('1a7b')).toBe(`#2`);
  expect(convStr('1a7b+')).toBe(`2#`);
  expect(convStr('7b1a')).toBe(`2#`);
  expect(convStr('7b1a+')).toBe(`#2`);
  expect(convStr('1a7c')).toBe(`#;`);
  expect(convStr('1a7c+')).toBe(`;#`);
  expect(convStr('7c1a')).toBe(`;#`);
  expect(convStr('7c1a+')).toBe(`#;`);
  expect(convStr('1a7d')).toBe(`#D`);
  expect(convStr('1a7d+')).toBe(`D#`);
  expect(convStr('7d1a')).toBe(`D#`);
  expect(convStr('7d1a+')).toBe(`#D`);
  expect(convStr('1a7e')).toBe(`#M`);
  expect(convStr('1a7e+')).toBe(`M#`);
  expect(convStr('7e1a')).toBe(`M#`);
  expect(convStr('7e1a+')).toBe(`#M`);
  expect(convStr('1a7f')).toBe(`#V`);
  expect(convStr('1a7f+')).toBe(`V#`);
  expect(convStr('7f1a')).toBe(`V#`);
  expect(convStr('7f1a+')).toBe(`#V`);
  expect(convStr('1a7g')).toBe(`#_`);
  expect(convStr('1a7g+')).toBe(`_#`);
  expect(convStr('7g1a')).toBe(`_#`);
  expect(convStr('7g1a+')).toBe(`#_`);
  expect(convStr('1a7h')).toBe(`#h`);
  expect(convStr('1a7h+')).toBe(`h#`);
  expect(convStr('7h1a')).toBe(`h#`);
  expect(convStr('7h1a+')).toBe(`#h`);
  expect(convStr('1a7i')).toBe(`#q`);
  expect(convStr('1a7i+')).toBe(`q#`);
  expect(convStr('7i1a')).toBe(`q#`);
  expect(convStr('7i1a+')).toBe(`#q`);
  expect(convStr('1a8a')).toBe(`#*`);
  expect(convStr('1a8a+')).toBe(`*#`);
  expect(convStr('8a1a')).toBe(`*#`);
  expect(convStr('8a1a+')).toBe(`#*`);
  expect(convStr('1a8b')).toBe(`#3`);
  expect(convStr('1a8b+')).toBe(`3#`);
  expect(convStr('8b1a')).toBe(`3#`);
  expect(convStr('8b1a+')).toBe(`#3`);
  expect(convStr('1a8c')).toBe(`#<`);
  expect(convStr('1a8c+')).toBe(`<#`);
  expect(convStr('8c1a')).toBe(`<#`);
  expect(convStr('8c1a+')).toBe(`#<`);
  expect(convStr('1a8d')).toBe(`#E`);
  expect(convStr('1a8d+')).toBe(`E#`);
  expect(convStr('8d1a')).toBe(`E#`);
  expect(convStr('8d1a+')).toBe(`#E`);
  expect(convStr('1a8e')).toBe(`#N`);
  expect(convStr('1a8e+')).toBe(`N#`);
  expect(convStr('8e1a')).toBe(`N#`);
  expect(convStr('8e1a+')).toBe(`#N`);
  expect(convStr('1a8f')).toBe(`#W`);
  expect(convStr('1a8f+')).toBe(`W#`);
  expect(convStr('8f1a')).toBe(`W#`);
  expect(convStr('8f1a+')).toBe(`#W`);
  expect(convStr('1a8g')).toBe(`#\``);
  expect(convStr('1a8g+')).toBe(`\`#`);
  expect(convStr('8g1a')).toBe(`\`#`);
  expect(convStr('8g1a+')).toBe(`#\``);
  expect(convStr('1a8h')).toBe(`#i`);
  expect(convStr('1a8h+')).toBe(`i#`);
  expect(convStr('8h1a')).toBe(`i#`);
  expect(convStr('8h1a+')).toBe(`#i`);
  expect(convStr('1a8i')).toBe(`#r`);
  expect(convStr('1a8i+')).toBe(`r#`);
  expect(convStr('8i1a')).toBe(`r#`);
  expect(convStr('8i1a+')).toBe(`#r`);
  expect(convStr('1a9a')).toBe(`#+`);
  expect(convStr('1a9a+')).toBe('+#');
  expect(convStr('9a1a')).toBe('+#');
  expect(convStr('9a1a+')).toBe(`#+`);
  expect(convStr('1a9b')).toBe(`#4`);
  expect(convStr('1a9b+')).toBe(`4#`);
  expect(convStr('9b1a')).toBe(`4#`);
  expect(convStr('9b1a+')).toBe(`#4`);
  expect(convStr('1a9c')).toBe(`#=`);
  expect(convStr('1a9c+')).toBe(`=#`);
  expect(convStr('9c1a')).toBe(`=#`);
  expect(convStr('9c1a+')).toBe(`#=`);
  expect(convStr('1a9d')).toBe(`#F`);
  expect(convStr('1a9d+')).toBe(`F#`);
  expect(convStr('9d1a')).toBe(`F#`);
  expect(convStr('9d1a+')).toBe(`#F`);
  expect(convStr('1a9e')).toBe(`#O`);
  expect(convStr('1a9e+')).toBe(`O#`);
  expect(convStr('9e1a')).toBe(`O#`);
  expect(convStr('9e1a+')).toBe(`#O`);
  expect(convStr('1a9f')).toBe(`#X`);
  expect(convStr('1a9f+')).toBe(`X#`);
  expect(convStr('9f1a')).toBe(`X#`);
  expect(convStr('9f1a+')).toBe(`#X`);
  expect(convStr('1a9g')).toBe(`#a`);
  expect(convStr('1a9g+')).toBe(`a#`);
  expect(convStr('9g1a')).toBe(`a#`);
  expect(convStr('9g1a+')).toBe(`#a`);
  expect(convStr('1a9h')).toBe(`#j`);
  expect(convStr('1a9h+')).toBe(`j#`);
  expect(convStr('9h1a')).toBe(`j#`);
  expect(convStr('9h1a+')).toBe(`#j`);
  expect(convStr('1a9i')).toBe(`#s`);
  expect(convStr('1a9i+')).toBe(`s#`);
  expect(convStr('9i1a')).toBe(`s#`);
  expect(convStr('9i1a+')).toBe(`#s`);
});

test('scalashogiCharPair - drops', () => {
  expect(convStr('P*1a')).toBe(`#z`);
  expect(convStr('L*1a')).toBe(`#y`);
  expect(convStr('N*1a')).toBe(`#x`);
  expect(convStr('S*1a')).toBe(`#w`);
  expect(convStr('G*1a')).toBe(`#v`);
  expect(convStr('B*1a')).toBe(`#u`);
  expect(convStr('R*1a')).toBe(`#t`);
  expect(convStr('P*1b')).toBe(`,z`);
  expect(convStr('L*1b')).toBe(`,y`);
  expect(convStr('N*1b')).toBe(`,x`);
  expect(convStr('S*1b')).toBe(`,w`);
  expect(convStr('G*1b')).toBe(`,v`);
  expect(convStr('B*1b')).toBe(`,u`);
  expect(convStr('R*1b')).toBe(`,t`);
  expect(convStr('P*1c')).toBe(`5z`);
  expect(convStr('L*1c')).toBe(`5y`);
  expect(convStr('N*1c')).toBe(`5x`);
  expect(convStr('S*1c')).toBe(`5w`);
  expect(convStr('G*1c')).toBe(`5v`);
  expect(convStr('B*1c')).toBe(`5u`);
  expect(convStr('R*1c')).toBe(`5t`);
  expect(convStr('P*1d')).toBe(`>z`);
  expect(convStr('L*1d')).toBe(`>y`);
  expect(convStr('N*1d')).toBe(`>x`);
  expect(convStr('S*1d')).toBe(`>w`);
  expect(convStr('G*1d')).toBe(`>v`);
  expect(convStr('B*1d')).toBe(`>u`);
  expect(convStr('R*1d')).toBe(`>t`);
  expect(convStr('P*1e')).toBe(`Gz`);
  expect(convStr('L*1e')).toBe(`Gy`);
  expect(convStr('N*1e')).toBe(`Gx`);
  expect(convStr('S*1e')).toBe(`Gw`);
  expect(convStr('G*1e')).toBe(`Gv`);
  expect(convStr('B*1e')).toBe(`Gu`);
  expect(convStr('R*1e')).toBe(`Gt`);
  expect(convStr('P*1f')).toBe(`Pz`);
  expect(convStr('L*1f')).toBe(`Py`);
  expect(convStr('N*1f')).toBe(`Px`);
  expect(convStr('S*1f')).toBe(`Pw`);
  expect(convStr('G*1f')).toBe(`Pv`);
  expect(convStr('B*1f')).toBe(`Pu`);
  expect(convStr('R*1f')).toBe(`Pt`);
  expect(convStr('P*1g')).toBe(`Yz`);
  expect(convStr('L*1g')).toBe(`Yy`);
  expect(convStr('N*1g')).toBe(`Yx`);
  expect(convStr('S*1g')).toBe(`Yw`);
  expect(convStr('G*1g')).toBe(`Yv`);
  expect(convStr('B*1g')).toBe(`Yu`);
  expect(convStr('R*1g')).toBe(`Yt`);
  expect(convStr('P*1h')).toBe(`bz`);
  expect(convStr('L*1h')).toBe(`by`);
  expect(convStr('N*1h')).toBe(`bx`);
  expect(convStr('S*1h')).toBe(`bw`);
  expect(convStr('G*1h')).toBe(`bv`);
  expect(convStr('B*1h')).toBe(`bu`);
  expect(convStr('R*1h')).toBe(`bt`);
  expect(convStr('P*1i')).toBe(`kz`);
  expect(convStr('L*1i')).toBe(`ky`);
  expect(convStr('N*1i')).toBe(`kx`);
  expect(convStr('S*1i')).toBe(`kw`);
  expect(convStr('G*1i')).toBe(`kv`);
  expect(convStr('B*1i')).toBe(`ku`);
  expect(convStr('R*1i')).toBe(`kt`);
  expect(convStr('P*2a')).toBe(`$z`);
  expect(convStr('L*2a')).toBe(`$y`);
  expect(convStr('N*2a')).toBe(`$x`);
  expect(convStr('S*2a')).toBe(`$w`);
  expect(convStr('G*2a')).toBe(`$v`);
  expect(convStr('B*2a')).toBe(`$u`);
  expect(convStr('R*2a')).toBe(`$t`);
  expect(convStr('P*2b')).toBe(`-z`);
  expect(convStr('L*2b')).toBe(`-y`);
  expect(convStr('N*2b')).toBe(`-x`);
  expect(convStr('S*2b')).toBe(`-w`);
  expect(convStr('G*2b')).toBe(`-v`);
  expect(convStr('B*2b')).toBe(`-u`);
  expect(convStr('R*2b')).toBe(`-t`);
  expect(convStr('P*2c')).toBe(`6z`);
  expect(convStr('L*2c')).toBe(`6y`);
  expect(convStr('N*2c')).toBe(`6x`);
  expect(convStr('S*2c')).toBe(`6w`);
  expect(convStr('G*2c')).toBe(`6v`);
  expect(convStr('B*2c')).toBe(`6u`);
  expect(convStr('R*2c')).toBe(`6t`);
  expect(convStr('P*2d')).toBe(`?z`);
  expect(convStr('L*2d')).toBe(`?y`);
  expect(convStr('N*2d')).toBe(`?x`);
  expect(convStr('S*2d')).toBe(`?w`);
  expect(convStr('G*2d')).toBe(`?v`);
  expect(convStr('B*2d')).toBe(`?u`);
  expect(convStr('R*2d')).toBe(`?t`);
  expect(convStr('P*2e')).toBe(`Hz`);
  expect(convStr('L*2e')).toBe(`Hy`);
  expect(convStr('N*2e')).toBe(`Hx`);
  expect(convStr('S*2e')).toBe(`Hw`);
  expect(convStr('G*2e')).toBe(`Hv`);
  expect(convStr('B*2e')).toBe(`Hu`);
  expect(convStr('R*2e')).toBe(`Ht`);
  expect(convStr('P*2f')).toBe(`Qz`);
  expect(convStr('L*2f')).toBe(`Qy`);
  expect(convStr('N*2f')).toBe(`Qx`);
  expect(convStr('S*2f')).toBe(`Qw`);
  expect(convStr('G*2f')).toBe(`Qv`);
  expect(convStr('B*2f')).toBe(`Qu`);
  expect(convStr('R*2f')).toBe(`Qt`);
  expect(convStr('P*2g')).toBe(`Zz`);
  expect(convStr('L*2g')).toBe(`Zy`);
  expect(convStr('N*2g')).toBe(`Zx`);
  expect(convStr('S*2g')).toBe(`Zw`);
  expect(convStr('G*2g')).toBe(`Zv`);
  expect(convStr('B*2g')).toBe(`Zu`);
  expect(convStr('R*2g')).toBe(`Zt`);
  expect(convStr('P*2h')).toBe(`cz`);
  expect(convStr('L*2h')).toBe(`cy`);
  expect(convStr('N*2h')).toBe(`cx`);
  expect(convStr('S*2h')).toBe(`cw`);
  expect(convStr('G*2h')).toBe(`cv`);
  expect(convStr('B*2h')).toBe(`cu`);
  expect(convStr('R*2h')).toBe(`ct`);
  expect(convStr('P*2i')).toBe(`lz`);
  expect(convStr('L*2i')).toBe(`ly`);
  expect(convStr('N*2i')).toBe(`lx`);
  expect(convStr('S*2i')).toBe(`lw`);
  expect(convStr('G*2i')).toBe(`lv`);
  expect(convStr('B*2i')).toBe(`lu`);
  expect(convStr('R*2i')).toBe(`lt`);
  expect(convStr('P*3a')).toBe(`%z`);
  expect(convStr('L*3a')).toBe(`%y`);
  expect(convStr('N*3a')).toBe(`%x`);
  expect(convStr('S*3a')).toBe(`%w`);
  expect(convStr('G*3a')).toBe(`%v`);
  expect(convStr('B*3a')).toBe(`%u`);
  expect(convStr('R*3a')).toBe(`%t`);
  expect(convStr('P*3b')).toBe(`.z`);
  expect(convStr('L*3b')).toBe(`.y`);
  expect(convStr('N*3b')).toBe(`.x`);
  expect(convStr('S*3b')).toBe(`.w`);
  expect(convStr('G*3b')).toBe(`.v`);
  expect(convStr('B*3b')).toBe(`.u`);
  expect(convStr('R*3b')).toBe(`.t`);
  expect(convStr('P*3c')).toBe(`7z`);
  expect(convStr('L*3c')).toBe(`7y`);
  expect(convStr('N*3c')).toBe(`7x`);
  expect(convStr('S*3c')).toBe(`7w`);
  expect(convStr('G*3c')).toBe(`7v`);
  expect(convStr('B*3c')).toBe(`7u`);
  expect(convStr('R*3c')).toBe(`7t`);
  expect(convStr('P*3d')).toBe(`@z`);
  expect(convStr('L*3d')).toBe(`@y`);
  expect(convStr('N*3d')).toBe(`@x`);
  expect(convStr('S*3d')).toBe(`@w`);
  expect(convStr('G*3d')).toBe(`@v`);
  expect(convStr('B*3d')).toBe(`@u`);
  expect(convStr('R*3d')).toBe(`@t`);
  expect(convStr('P*3e')).toBe(`Iz`);
  expect(convStr('L*3e')).toBe(`Iy`);
  expect(convStr('N*3e')).toBe(`Ix`);
  expect(convStr('S*3e')).toBe(`Iw`);
  expect(convStr('G*3e')).toBe(`Iv`);
  expect(convStr('B*3e')).toBe(`Iu`);
  expect(convStr('R*3e')).toBe(`It`);
  expect(convStr('P*3f')).toBe(`Rz`);
  expect(convStr('L*3f')).toBe(`Ry`);
  expect(convStr('N*3f')).toBe(`Rx`);
  expect(convStr('S*3f')).toBe(`Rw`);
  expect(convStr('G*3f')).toBe(`Rv`);
  expect(convStr('B*3f')).toBe(`Ru`);
  expect(convStr('R*3f')).toBe(`Rt`);
  expect(convStr('P*3g')).toBe(`[z`);
  expect(convStr('L*3g')).toBe(`[y`);
  expect(convStr('N*3g')).toBe(`[x`);
  expect(convStr('S*3g')).toBe(`[w`);
  expect(convStr('G*3g')).toBe(`[v`);
  expect(convStr('B*3g')).toBe(`[u`);
  expect(convStr('R*3g')).toBe(`[t`);
  expect(convStr('P*3h')).toBe(`dz`);
  expect(convStr('L*3h')).toBe(`dy`);
  expect(convStr('N*3h')).toBe(`dx`);
  expect(convStr('S*3h')).toBe(`dw`);
  expect(convStr('G*3h')).toBe(`dv`);
  expect(convStr('B*3h')).toBe(`du`);
  expect(convStr('R*3h')).toBe(`dt`);
  expect(convStr('P*3i')).toBe(`mz`);
  expect(convStr('L*3i')).toBe(`my`);
  expect(convStr('N*3i')).toBe(`mx`);
  expect(convStr('S*3i')).toBe(`mw`);
  expect(convStr('G*3i')).toBe(`mv`);
  expect(convStr('B*3i')).toBe(`mu`);
  expect(convStr('R*3i')).toBe(`mt`);
  expect(convStr('P*4a')).toBe(`&z`);
  expect(convStr('L*4a')).toBe(`&y`);
  expect(convStr('N*4a')).toBe(`&x`);
  expect(convStr('S*4a')).toBe(`&w`);
  expect(convStr('G*4a')).toBe(`&v`);
  expect(convStr('B*4a')).toBe(`&u`);
  expect(convStr('R*4a')).toBe(`&t`);
  expect(convStr('P*4b')).toBe(`/z`);
  expect(convStr('L*4b')).toBe(`/y`);
  expect(convStr('N*4b')).toBe(`/x`);
  expect(convStr('S*4b')).toBe(`/w`);
  expect(convStr('G*4b')).toBe(`/v`);
  expect(convStr('B*4b')).toBe(`/u`);
  expect(convStr('R*4b')).toBe(`/t`);
  expect(convStr('P*4c')).toBe(`8z`);
  expect(convStr('L*4c')).toBe(`8y`);
  expect(convStr('N*4c')).toBe(`8x`);
  expect(convStr('S*4c')).toBe(`8w`);
  expect(convStr('G*4c')).toBe(`8v`);
  expect(convStr('B*4c')).toBe(`8u`);
  expect(convStr('R*4c')).toBe(`8t`);
  expect(convStr('P*4d')).toBe(`Az`);
  expect(convStr('L*4d')).toBe(`Ay`);
  expect(convStr('N*4d')).toBe(`Ax`);
  expect(convStr('S*4d')).toBe(`Aw`);
  expect(convStr('G*4d')).toBe(`Av`);
  expect(convStr('B*4d')).toBe(`Au`);
  expect(convStr('R*4d')).toBe(`At`);
  expect(convStr('P*4e')).toBe(`Jz`);
  expect(convStr('L*4e')).toBe(`Jy`);
  expect(convStr('N*4e')).toBe(`Jx`);
  expect(convStr('S*4e')).toBe(`Jw`);
  expect(convStr('G*4e')).toBe(`Jv`);
  expect(convStr('B*4e')).toBe(`Ju`);
  expect(convStr('R*4e')).toBe(`Jt`);
  expect(convStr('P*4f')).toBe(`Sz`);
  expect(convStr('L*4f')).toBe(`Sy`);
  expect(convStr('N*4f')).toBe(`Sx`);
  expect(convStr('S*4f')).toBe(`Sw`);
  expect(convStr('G*4f')).toBe(`Sv`);
  expect(convStr('B*4f')).toBe(`Su`);
  expect(convStr('R*4f')).toBe(`St`);
  expect(convStr('P*4g')).toBe(`\\z`);
  expect(convStr('L*4g')).toBe(`\\y`);
  expect(convStr('N*4g')).toBe(`\\x`);
  expect(convStr('S*4g')).toBe(`\\w`);
  expect(convStr('G*4g')).toBe(`\\v`);
  expect(convStr('B*4g')).toBe(`\\u`);
  expect(convStr('R*4g')).toBe(`\\t`);
  expect(convStr('P*4h')).toBe(`ez`);
  expect(convStr('L*4h')).toBe(`ey`);
  expect(convStr('N*4h')).toBe(`ex`);
  expect(convStr('S*4h')).toBe(`ew`);
  expect(convStr('G*4h')).toBe(`ev`);
  expect(convStr('B*4h')).toBe(`eu`);
  expect(convStr('R*4h')).toBe(`et`);
  expect(convStr('P*4i')).toBe(`nz`);
  expect(convStr('L*4i')).toBe(`ny`);
  expect(convStr('N*4i')).toBe(`nx`);
  expect(convStr('S*4i')).toBe(`nw`);
  expect(convStr('G*4i')).toBe(`nv`);
  expect(convStr('B*4i')).toBe(`nu`);
  expect(convStr('R*4i')).toBe(`nt`);
  expect(convStr('P*5a')).toBe(`'z`);
  expect(convStr('L*5a')).toBe(`'y`);
  expect(convStr('N*5a')).toBe(`'x`);
  expect(convStr('S*5a')).toBe(`'w`);
  expect(convStr('G*5a')).toBe(`'v`);
  expect(convStr('B*5a')).toBe(`'u`);
  expect(convStr('R*5a')).toBe(`'t`);
  expect(convStr('P*5b')).toBe(`0z`);
  expect(convStr('L*5b')).toBe(`0y`);
  expect(convStr('N*5b')).toBe(`0x`);
  expect(convStr('S*5b')).toBe(`0w`);
  expect(convStr('G*5b')).toBe(`0v`);
  expect(convStr('B*5b')).toBe(`0u`);
  expect(convStr('R*5b')).toBe(`0t`);
  expect(convStr('P*5c')).toBe(`9z`);
  expect(convStr('L*5c')).toBe(`9y`);
  expect(convStr('N*5c')).toBe(`9x`);
  expect(convStr('S*5c')).toBe(`9w`);
  expect(convStr('G*5c')).toBe(`9v`);
  expect(convStr('B*5c')).toBe(`9u`);
  expect(convStr('R*5c')).toBe(`9t`);
  expect(convStr('P*5d')).toBe(`Bz`);
  expect(convStr('L*5d')).toBe(`By`);
  expect(convStr('N*5d')).toBe(`Bx`);
  expect(convStr('S*5d')).toBe(`Bw`);
  expect(convStr('G*5d')).toBe(`Bv`);
  expect(convStr('B*5d')).toBe(`Bu`);
  expect(convStr('R*5d')).toBe(`Bt`);
  expect(convStr('P*5e')).toBe(`Kz`);
  expect(convStr('L*5e')).toBe(`Ky`);
  expect(convStr('N*5e')).toBe(`Kx`);
  expect(convStr('S*5e')).toBe(`Kw`);
  expect(convStr('G*5e')).toBe(`Kv`);
  expect(convStr('B*5e')).toBe(`Ku`);
  expect(convStr('R*5e')).toBe(`Kt`);
  expect(convStr('P*5f')).toBe(`Tz`);
  expect(convStr('L*5f')).toBe(`Ty`);
  expect(convStr('N*5f')).toBe(`Tx`);
  expect(convStr('S*5f')).toBe(`Tw`);
  expect(convStr('G*5f')).toBe(`Tv`);
  expect(convStr('B*5f')).toBe(`Tu`);
  expect(convStr('R*5f')).toBe(`Tt`);
  expect(convStr('P*5g')).toBe(`]z`);
  expect(convStr('L*5g')).toBe(`]y`);
  expect(convStr('N*5g')).toBe(`]x`);
  expect(convStr('S*5g')).toBe(`]w`);
  expect(convStr('G*5g')).toBe(`]v`);
  expect(convStr('B*5g')).toBe(`]u`);
  expect(convStr('R*5g')).toBe(`]t`);
  expect(convStr('P*5h')).toBe(`fz`);
  expect(convStr('L*5h')).toBe(`fy`);
  expect(convStr('N*5h')).toBe(`fx`);
  expect(convStr('S*5h')).toBe(`fw`);
  expect(convStr('G*5h')).toBe(`fv`);
  expect(convStr('B*5h')).toBe(`fu`);
  expect(convStr('R*5h')).toBe(`ft`);
  expect(convStr('P*5i')).toBe(`oz`);
  expect(convStr('L*5i')).toBe(`oy`);
  expect(convStr('N*5i')).toBe(`ox`);
  expect(convStr('S*5i')).toBe(`ow`);
  expect(convStr('G*5i')).toBe(`ov`);
  expect(convStr('B*5i')).toBe(`ou`);
  expect(convStr('R*5i')).toBe(`ot`);
  expect(convStr('P*6a')).toBe(`(z`);
  expect(convStr('L*6a')).toBe(`(y`);
  expect(convStr('N*6a')).toBe(`(x`);
  expect(convStr('S*6a')).toBe(`(w`);
  expect(convStr('G*6a')).toBe(`(v`);
  expect(convStr('B*6a')).toBe(`(u`);
  expect(convStr('R*6a')).toBe(`(t`);
  expect(convStr('P*6b')).toBe(`1z`);
  expect(convStr('L*6b')).toBe(`1y`);
  expect(convStr('N*6b')).toBe(`1x`);
  expect(convStr('S*6b')).toBe(`1w`);
  expect(convStr('G*6b')).toBe(`1v`);
  expect(convStr('B*6b')).toBe(`1u`);
  expect(convStr('R*6b')).toBe(`1t`);
  expect(convStr('P*6c')).toBe(`:z`);
  expect(convStr('L*6c')).toBe(`:y`);
  expect(convStr('N*6c')).toBe(`:x`);
  expect(convStr('S*6c')).toBe(`:w`);
  expect(convStr('G*6c')).toBe(`:v`);
  expect(convStr('B*6c')).toBe(`:u`);
  expect(convStr('R*6c')).toBe(`:t`);
  expect(convStr('P*6d')).toBe(`Cz`);
  expect(convStr('L*6d')).toBe(`Cy`);
  expect(convStr('N*6d')).toBe(`Cx`);
  expect(convStr('S*6d')).toBe(`Cw`);
  expect(convStr('G*6d')).toBe(`Cv`);
  expect(convStr('B*6d')).toBe(`Cu`);
  expect(convStr('R*6d')).toBe(`Ct`);
  expect(convStr('P*6e')).toBe(`Lz`);
  expect(convStr('L*6e')).toBe(`Ly`);
  expect(convStr('N*6e')).toBe(`Lx`);
  expect(convStr('S*6e')).toBe(`Lw`);
  expect(convStr('G*6e')).toBe(`Lv`);
  expect(convStr('B*6e')).toBe(`Lu`);
  expect(convStr('R*6e')).toBe(`Lt`);
  expect(convStr('P*6f')).toBe(`Uz`);
  expect(convStr('L*6f')).toBe(`Uy`);
  expect(convStr('N*6f')).toBe(`Ux`);
  expect(convStr('S*6f')).toBe(`Uw`);
  expect(convStr('G*6f')).toBe(`Uv`);
  expect(convStr('B*6f')).toBe(`Uu`);
  expect(convStr('R*6f')).toBe(`Ut`);
  expect(convStr('P*6g')).toBe(`^z`);
  expect(convStr('L*6g')).toBe(`^y`);
  expect(convStr('N*6g')).toBe(`^x`);
  expect(convStr('S*6g')).toBe(`^w`);
  expect(convStr('G*6g')).toBe(`^v`);
  expect(convStr('B*6g')).toBe(`^u`);
  expect(convStr('R*6g')).toBe(`^t`);
  expect(convStr('P*6h')).toBe(`gz`);
  expect(convStr('L*6h')).toBe(`gy`);
  expect(convStr('N*6h')).toBe(`gx`);
  expect(convStr('S*6h')).toBe(`gw`);
  expect(convStr('G*6h')).toBe(`gv`);
  expect(convStr('B*6h')).toBe(`gu`);
  expect(convStr('R*6h')).toBe(`gt`);
  expect(convStr('P*6i')).toBe(`pz`);
  expect(convStr('L*6i')).toBe(`py`);
  expect(convStr('N*6i')).toBe(`px`);
  expect(convStr('S*6i')).toBe(`pw`);
  expect(convStr('G*6i')).toBe(`pv`);
  expect(convStr('B*6i')).toBe(`pu`);
  expect(convStr('R*6i')).toBe(`pt`);
  expect(convStr('P*7a')).toBe(`)z`);
  expect(convStr('L*7a')).toBe(`)y`);
  expect(convStr('N*7a')).toBe(`)x`);
  expect(convStr('S*7a')).toBe(`)w`);
  expect(convStr('G*7a')).toBe(`)v`);
  expect(convStr('B*7a')).toBe(`)u`);
  expect(convStr('R*7a')).toBe(`)t`);
  expect(convStr('P*7b')).toBe(`2z`);
  expect(convStr('L*7b')).toBe(`2y`);
  expect(convStr('N*7b')).toBe(`2x`);
  expect(convStr('S*7b')).toBe(`2w`);
  expect(convStr('G*7b')).toBe(`2v`);
  expect(convStr('B*7b')).toBe(`2u`);
  expect(convStr('R*7b')).toBe(`2t`);
  expect(convStr('P*7c')).toBe(`;z`);
  expect(convStr('L*7c')).toBe(`;y`);
  expect(convStr('N*7c')).toBe(`;x`);
  expect(convStr('S*7c')).toBe(`;w`);
  expect(convStr('G*7c')).toBe(`;v`);
  expect(convStr('B*7c')).toBe(`;u`);
  expect(convStr('R*7c')).toBe(`;t`);
  expect(convStr('P*7d')).toBe(`Dz`);
  expect(convStr('L*7d')).toBe(`Dy`);
  expect(convStr('N*7d')).toBe(`Dx`);
  expect(convStr('S*7d')).toBe(`Dw`);
  expect(convStr('G*7d')).toBe(`Dv`);
  expect(convStr('B*7d')).toBe(`Du`);
  expect(convStr('R*7d')).toBe(`Dt`);
  expect(convStr('P*7e')).toBe(`Mz`);
  expect(convStr('L*7e')).toBe(`My`);
  expect(convStr('N*7e')).toBe(`Mx`);
  expect(convStr('S*7e')).toBe(`Mw`);
  expect(convStr('G*7e')).toBe(`Mv`);
  expect(convStr('B*7e')).toBe(`Mu`);
  expect(convStr('R*7e')).toBe(`Mt`);
  expect(convStr('P*7f')).toBe(`Vz`);
  expect(convStr('L*7f')).toBe(`Vy`);
  expect(convStr('N*7f')).toBe(`Vx`);
  expect(convStr('S*7f')).toBe(`Vw`);
  expect(convStr('G*7f')).toBe(`Vv`);
  expect(convStr('B*7f')).toBe(`Vu`);
  expect(convStr('R*7f')).toBe(`Vt`);
  expect(convStr('P*7g')).toBe(`_z`);
  expect(convStr('L*7g')).toBe(`_y`);
  expect(convStr('N*7g')).toBe(`_x`);
  expect(convStr('S*7g')).toBe(`_w`);
  expect(convStr('G*7g')).toBe(`_v`);
  expect(convStr('B*7g')).toBe(`_u`);
  expect(convStr('R*7g')).toBe(`_t`);
  expect(convStr('P*7h')).toBe(`hz`);
  expect(convStr('L*7h')).toBe(`hy`);
  expect(convStr('N*7h')).toBe(`hx`);
  expect(convStr('S*7h')).toBe(`hw`);
  expect(convStr('G*7h')).toBe(`hv`);
  expect(convStr('B*7h')).toBe(`hu`);
  expect(convStr('R*7h')).toBe(`ht`);
  expect(convStr('P*7i')).toBe(`qz`);
  expect(convStr('L*7i')).toBe(`qy`);
  expect(convStr('N*7i')).toBe(`qx`);
  expect(convStr('S*7i')).toBe(`qw`);
  expect(convStr('G*7i')).toBe(`qv`);
  expect(convStr('B*7i')).toBe(`qu`);
  expect(convStr('R*7i')).toBe(`qt`);
  expect(convStr('P*8a')).toBe(`*z`);
  expect(convStr('L*8a')).toBe(`*y`);
  expect(convStr('N*8a')).toBe(`*x`);
  expect(convStr('S*8a')).toBe(`*w`);
  expect(convStr('G*8a')).toBe(`*v`);
  expect(convStr('B*8a')).toBe(`*u`);
  expect(convStr('R*8a')).toBe(`*t`);
  expect(convStr('P*8b')).toBe(`3z`);
  expect(convStr('L*8b')).toBe(`3y`);
  expect(convStr('N*8b')).toBe(`3x`);
  expect(convStr('S*8b')).toBe(`3w`);
  expect(convStr('G*8b')).toBe(`3v`);
  expect(convStr('B*8b')).toBe(`3u`);
  expect(convStr('R*8b')).toBe(`3t`);
  expect(convStr('P*8c')).toBe(`<z`);
  expect(convStr('L*8c')).toBe(`<y`);
  expect(convStr('N*8c')).toBe(`<x`);
  expect(convStr('S*8c')).toBe(`<w`);
  expect(convStr('G*8c')).toBe(`<v`);
  expect(convStr('B*8c')).toBe(`<u`);
  expect(convStr('R*8c')).toBe(`<t`);
  expect(convStr('P*8d')).toBe(`Ez`);
  expect(convStr('L*8d')).toBe(`Ey`);
  expect(convStr('N*8d')).toBe(`Ex`);
  expect(convStr('S*8d')).toBe(`Ew`);
  expect(convStr('G*8d')).toBe(`Ev`);
  expect(convStr('B*8d')).toBe(`Eu`);
  expect(convStr('R*8d')).toBe(`Et`);
  expect(convStr('P*8e')).toBe(`Nz`);
  expect(convStr('L*8e')).toBe(`Ny`);
  expect(convStr('N*8e')).toBe(`Nx`);
  expect(convStr('S*8e')).toBe(`Nw`);
  expect(convStr('G*8e')).toBe(`Nv`);
  expect(convStr('B*8e')).toBe(`Nu`);
  expect(convStr('R*8e')).toBe(`Nt`);
  expect(convStr('P*8f')).toBe(`Wz`);
  expect(convStr('L*8f')).toBe(`Wy`);
  expect(convStr('N*8f')).toBe(`Wx`);
  expect(convStr('S*8f')).toBe(`Ww`);
  expect(convStr('G*8f')).toBe(`Wv`);
  expect(convStr('B*8f')).toBe(`Wu`);
  expect(convStr('R*8f')).toBe(`Wt`);
  expect(convStr('P*8g')).toBe(`\`z`);
  expect(convStr('L*8g')).toBe(`\`y`);
  expect(convStr('N*8g')).toBe(`\`x`);
  expect(convStr('S*8g')).toBe(`\`w`);
  expect(convStr('G*8g')).toBe(`\`v`);
  expect(convStr('B*8g')).toBe(`\`u`);
  expect(convStr('R*8g')).toBe(`\`t`);
  expect(convStr('P*8h')).toBe(`iz`);
  expect(convStr('L*8h')).toBe(`iy`);
  expect(convStr('N*8h')).toBe(`ix`);
  expect(convStr('S*8h')).toBe(`iw`);
  expect(convStr('G*8h')).toBe(`iv`);
  expect(convStr('B*8h')).toBe(`iu`);
  expect(convStr('R*8h')).toBe(`it`);
  expect(convStr('P*8i')).toBe(`rz`);
  expect(convStr('L*8i')).toBe(`ry`);
  expect(convStr('N*8i')).toBe(`rx`);
  expect(convStr('S*8i')).toBe(`rw`);
  expect(convStr('G*8i')).toBe(`rv`);
  expect(convStr('B*8i')).toBe(`ru`);
  expect(convStr('R*8i')).toBe(`rt`);
  expect(convStr('P*9a')).toBe(`+z`);
  expect(convStr('L*9a')).toBe(`+y`);
  expect(convStr('N*9a')).toBe(`+x`);
  expect(convStr('S*9a')).toBe(`+w`);
  expect(convStr('G*9a')).toBe(`+v`);
  expect(convStr('B*9a')).toBe(`+u`);
  expect(convStr('R*9a')).toBe(`+t`);
  expect(convStr('P*9b')).toBe(`4z`);
  expect(convStr('L*9b')).toBe(`4y`);
  expect(convStr('N*9b')).toBe(`4x`);
  expect(convStr('S*9b')).toBe(`4w`);
  expect(convStr('G*9b')).toBe(`4v`);
  expect(convStr('B*9b')).toBe(`4u`);
  expect(convStr('R*9b')).toBe(`4t`);
  expect(convStr('P*9c')).toBe(`=z`);
  expect(convStr('L*9c')).toBe(`=y`);
  expect(convStr('N*9c')).toBe(`=x`);
  expect(convStr('S*9c')).toBe(`=w`);
  expect(convStr('G*9c')).toBe(`=v`);
  expect(convStr('B*9c')).toBe(`=u`);
  expect(convStr('R*9c')).toBe(`=t`);
  expect(convStr('P*9d')).toBe(`Fz`);
  expect(convStr('L*9d')).toBe(`Fy`);
  expect(convStr('N*9d')).toBe(`Fx`);
  expect(convStr('S*9d')).toBe(`Fw`);
  expect(convStr('G*9d')).toBe(`Fv`);
  expect(convStr('B*9d')).toBe(`Fu`);
  expect(convStr('R*9d')).toBe(`Ft`);
  expect(convStr('P*9e')).toBe(`Oz`);
  expect(convStr('L*9e')).toBe(`Oy`);
  expect(convStr('N*9e')).toBe(`Ox`);
  expect(convStr('S*9e')).toBe(`Ow`);
  expect(convStr('G*9e')).toBe(`Ov`);
  expect(convStr('B*9e')).toBe(`Ou`);
  expect(convStr('R*9e')).toBe(`Ot`);
  expect(convStr('P*9f')).toBe(`Xz`);
  expect(convStr('L*9f')).toBe(`Xy`);
  expect(convStr('N*9f')).toBe(`Xx`);
  expect(convStr('S*9f')).toBe(`Xw`);
  expect(convStr('G*9f')).toBe(`Xv`);
  expect(convStr('B*9f')).toBe(`Xu`);
  expect(convStr('R*9f')).toBe(`Xt`);
  expect(convStr('P*9g')).toBe(`az`);
  expect(convStr('L*9g')).toBe(`ay`);
  expect(convStr('N*9g')).toBe(`ax`);
  expect(convStr('S*9g')).toBe(`aw`);
  expect(convStr('G*9g')).toBe(`av`);
  expect(convStr('B*9g')).toBe(`au`);
  expect(convStr('R*9g')).toBe(`at`);
  expect(convStr('P*9h')).toBe(`jz`);
  expect(convStr('L*9h')).toBe(`jy`);
  expect(convStr('N*9h')).toBe(`jx`);
  expect(convStr('S*9h')).toBe(`jw`);
  expect(convStr('G*9h')).toBe(`jv`);
  expect(convStr('B*9h')).toBe(`ju`);
  expect(convStr('R*9h')).toBe(`jt`);
  expect(convStr('P*9i')).toBe(`sz`);
  expect(convStr('L*9i')).toBe(`sy`);
  expect(convStr('N*9i')).toBe(`sx`);
  expect(convStr('S*9i')).toBe(`sw`);
  expect(convStr('G*9i')).toBe(`sv`);
  expect(convStr('B*9i')).toBe(`su`);
  expect(convStr('R*9i')).toBe(`st`);
});

test('scalashogiCharPair - lion moves', () => {
  expect(convStr('5e4d3c', 'chushogi')).toBe(`WÎ`);
  expect(convStr('5e4d4c', 'chushogi')).toBe(`WÆ`);
  expect(convStr('5e4d5c', 'chushogi')).toBe(`W¾`);
  expect(convStr('5e4d3d', 'chushogi')).toBe(`W¶`);
  expect(convStr('5e4d5d', 'chushogi')).toBe(`Wî`);
  expect(convStr('5e4d3e', 'chushogi')).toBe(`Wæ`);
  expect(convStr('5e4d4e', 'chushogi')).toBe(`WÞ`);
  expect(convStr('5e4d5e', 'chushogi')).toBe(`WÖ`);
  expect(convStr('5e5d4c', 'chushogi')).toBe(`WÍ`);
  expect(convStr('5e5d5c', 'chushogi')).toBe(`WÅ`);
  expect(convStr('5e5d6c', 'chushogi')).toBe(`W½`);
  expect(convStr('5e5d4d', 'chushogi')).toBe(`Wµ`);
  expect(convStr('5e5d6d', 'chushogi')).toBe(`Wí`);
  expect(convStr('5e5d4e', 'chushogi')).toBe(`Wå`);
  expect(convStr('5e5d5e', 'chushogi')).toBe(`WÝ`);
  expect(convStr('5e5d6e', 'chushogi')).toBe(`WÕ`);
  expect(convStr('5e6d5c', 'chushogi')).toBe(`WÌ`);
  expect(convStr('5e6d6c', 'chushogi')).toBe(`WÄ`);
  expect(convStr('5e6d7c', 'chushogi')).toBe(`W¼`);
  expect(convStr('5e6d5d', 'chushogi')).toBe(`W´`);
  expect(convStr('5e6d7d', 'chushogi')).toBe(`Wì`);
  expect(convStr('5e6d5e', 'chushogi')).toBe(`Wä`);
  expect(convStr('5e6d6e', 'chushogi')).toBe(`WÜ`);
  expect(convStr('5e6d7e', 'chushogi')).toBe(`WÔ`);
  expect(convStr('5e4e3d', 'chushogi')).toBe(`WË`);
  expect(convStr('5e4e4d', 'chushogi')).toBe(`WÃ`);
  expect(convStr('5e4e5d', 'chushogi')).toBe(`W»`);
  expect(convStr('5e4e3e', 'chushogi')).toBe(`W³`);
  expect(convStr('5e4e5e', 'chushogi')).toBe(`Wë`);
  expect(convStr('5e4e3f', 'chushogi')).toBe(`Wã`);
  expect(convStr('5e4e4f', 'chushogi')).toBe(`WÛ`);
  expect(convStr('5e4e5f', 'chushogi')).toBe(`WÓ`);
  expect(convStr('5e6e5d', 'chushogi')).toBe(`WÒ`);
  expect(convStr('5e6e6d', 'chushogi')).toBe(`WÊ`);
  expect(convStr('5e6e7d', 'chushogi')).toBe(`WÂ`);
  expect(convStr('5e6e5e', 'chushogi')).toBe(`Wº`);
  expect(convStr('5e6e7e', 'chushogi')).toBe(`Wò`);
  expect(convStr('5e6e5f', 'chushogi')).toBe(`Wê`);
  expect(convStr('5e6e6f', 'chushogi')).toBe(`Wâ`);
  expect(convStr('5e6e7f', 'chushogi')).toBe(`WÚ`);
  expect(convStr('5e4f3e', 'chushogi')).toBe(`WÑ`);
  expect(convStr('5e4f4e', 'chushogi')).toBe(`WÉ`);
  expect(convStr('5e4f5e', 'chushogi')).toBe(`WÁ`);
  expect(convStr('5e4f3f', 'chushogi')).toBe(`W¹`);
  expect(convStr('5e4f5f', 'chushogi')).toBe(`Wñ`);
  expect(convStr('5e4f3g', 'chushogi')).toBe(`Wé`);
  expect(convStr('5e4f4g', 'chushogi')).toBe(`Wá`);
  expect(convStr('5e4f5g', 'chushogi')).toBe(`WÙ`);
  expect(convStr('5e5f4e', 'chushogi')).toBe(`WÐ`);
  expect(convStr('5e5f5e', 'chushogi')).toBe(`WÈ`);
  expect(convStr('5e5f6e', 'chushogi')).toBe(`WÀ`);
  expect(convStr('5e5f4f', 'chushogi')).toBe(`W¸`);
  expect(convStr('5e5f6f', 'chushogi')).toBe(`Wð`);
  expect(convStr('5e5f4g', 'chushogi')).toBe(`Wè`);
  expect(convStr('5e5f5g', 'chushogi')).toBe(`Wà`);
  expect(convStr('5e5f6g', 'chushogi')).toBe(`WØ`);
  expect(convStr('5e6f5e', 'chushogi')).toBe(`WÏ`);
  expect(convStr('5e6f6e', 'chushogi')).toBe(`WÇ`);
  expect(convStr('5e6f7e', 'chushogi')).toBe(`W¿`);
  expect(convStr('5e6f5f', 'chushogi')).toBe(`W·`);
  expect(convStr('5e6f7f', 'chushogi')).toBe(`Wï`);
  expect(convStr('5e6f5g', 'chushogi')).toBe(`Wç`);
  expect(convStr('5e6f6g', 'chushogi')).toBe(`Wß`);
  expect(convStr('5e6f7g', 'chushogi')).toBe(`W×`);
});
