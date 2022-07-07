import { makeSfen, parseSfen } from '../src/sfen';
import { Shogi, IllegalSetup } from '../src/shogi';
import { perft } from '../src/debug';
import { parseUsi } from '../src/util';

// http://www.talkchess.com/forum3/viewtopic.php?f=7&t=71550&start=16
// http://www.talkchess.com/forum3/viewtopic.php?f=7&t=71550
const random: [string, string, number, number][] = [
  ['gentest-1', 'l2kg2+R1/4n3+L/p1gpps3/4np3/6P1N/PP+rP2pS1/1pG2P3/4P1G2/LN3KB1+p b SPbslpppp', 107, 20080],
  ['gentest-2', 'l+Rl2+R3/3k1s2+L/p1p1p4/2Ppnp1S1/4n1Pbp/PP2G4/1G3P+n2/Kp2P4/L8 w GSPPPPbgsnp', 240, 39392],
  ['gentest-3', 'l+Rl2g2+R/3k1s2+L/p1p1p4/2Ppnp1S1/4n1Pbp/PP2G4/1G3P+n2/Kp2P4/L8 b SPPPPbgsnp', 110, 24582],
  ['gentest-4', 'l2kgb1+R1/4n3+L/p1gpps3/4np3/6P1N/PPGP2pS1/1p3P3/4P1G2/LN3KB1+p b RSPslpppp', 158, 21443],
  ['gentest-5', 'l8/1r1gk3+L/p1Npp2S1/2Psnpg2/5+r2N/PP1P2pS1/1pG1BP3/4P1G2/LN3KB1+p b SPPlppp', 109, 10902],
  ['gentest-6', 'lr6l/3g1kg2/p2pp2s+P/2Ps1ppp1/8L/P1nP2PR1/1P3PS2/1SGK5/LN3G3 b BNNPPPbpp', 7, 755],
  ['gentest-7', 'lr7/3g1kg2/p2pp2s+L/2Ps1ppp1/9/PP1P1BPS1/5P1PS/1G6+r/LN3KB2 b GNNLPPPnpp', 184, 18331],
  ['gentest-8', 'l+Rl2g2+R/2p+Sks2+L/p3p4/2Ppnp1S1/4n1Pbp/PP2G4/1G3P+n2/Kp2P4/L8 w GSPPPPbnp', 2, 326],
  ['gentest-9', 'l2s5/3kn2R+L/p1gpp+B3/4np3/2+r3P1N/PP1P2pS1/1pG2P3/4P1G2/LN3KB1+p b GLPsspppp', 165, 16018],
  ['gentest-11', 'lr7/3g1kg2/p2pp2s+L/2Psnp1p1/5+rS2/PP1P5/4BPS2/1G2P1G2/LN3KB1L w NNPPPpppp', 72, 6928],
  ['gentest-12', 'lr7/3g1kg2/p2pp2s+L/2Ps1ppp1/9/P2P1BPS1/1P3P3/1G3B3/LN2KG1r1 w NNNLPPPsppp', 123, 16661],
  ['gentest-13', 'l+Rl2+R3/3k1s2+L/p1p1p4/2Ppnp1S1/4n1Pbp/PP2G4/KG3P+n2/1p2P4/Ls7 w GSPPPPbgnp', 188, 30364],
  ['gentest-14', 'lr6l/3g1kg2/p2pp2s+P/2Ps1ppp1/7nL/P2P2PR1/1P3PN2/1SGK2S2/LN3G3 w BNPPPbpp', 109, 14585],
  ['gentest-15', 'l1S6/r3k3+L/p1gppl3/4np+B2/2+r3P1N/PP1P2pS1/1pG2P3/4P1G2/LN3KB1+p b GSPsnpppp', 163, 21883],
  ['gentest-16', 'lr7/3g1kg2/p2pp2sl/2Ps1ppp1/8L/P2P2PR1/1P3PS2/1G7/LN2KG3 b BNNNPPPbsppp', 145, 23120],
  ['gentest-17', 'l8/1r1g1k3/p1Npp1gs+L/2Psnp1p1/5+rS2/PP1P2pS1/1pG1BP3/4P1G1p/LN3KB1L b NPPpp', 84, 4399],
  ['gentest-18', 'lr7/3g1kg2/p2pp2s+L/2Ps1p1p1/5+rp2/PP1P1B1S1/5PP1S/1G2P1G2/LN3KB1L b NNPnpppp', 86, 8763],
  ['gentest-18', 'l2kgs1+R1/4n+B2+L/p1gpp4/4np3/6P1N/PP+rP2pS1/1pG2P3/4P1G2/LN3KB1+p w SSPlpppp', 95, 10625],
  ['gentest-19', 'l8/1r1gk3+L/p1Npp4/2Psnp+r2/8N/PP1P2pS1/1pG1BP3/4P1G2/LN3KB1+p b GSPPslppp', 156, 22669],
  ['gentest-20', 'lr7/3g1kg2/p2pp2s+L/2Ps1ppp1/9/PP1P1BPS1/5P1P1/1G3B1g1/LN3KN1+r b SNNLPPPpp', 181, 12037],
  ['gentest-21', '7lk/9/8S/9/9/9/9/7L1/8K b P', 85, 639],
];

test('test promotions', () => {
  const pos = parseSfen('standard', '4k4/9/7S1/1+PG3NS1/9/9/9/9/4K3L b - 1').unwrap();
  expect(Shogi.default().isLegal({ from: 20, to: 29, promotion: true })).toBe(false); // promoting outside promotion zone
  expect(pos.isLegal(parseUsi('8d8c+')!)).toBe(false); // promoting tokin
  expect(pos.isLegal(parseUsi('7d7c+')!)).toBe(false); // promoting gold
  expect(pos.isLegal(parseUsi('1i1a')!)).toBe(false); // not promoting lance on last rank
  expect(pos.isLegal(parseUsi('1i1a+')!)).toBe(true);
  expect(pos.isLegal(parseUsi('3d2b')!)).toBe(false); // not promoting knight on second last rank
  expect(pos.isLegal(parseUsi('3d2b+')!)).toBe(true);
  expect(pos.isLegal(parseUsi('2c1d+')!)).toBe(true); // promoting while leaving the promotion zone
  expect(pos.isLegal(parseUsi('2c1d')!)).toBe(true);
  expect(pos.isLegal(parseUsi('2d1c+')!)).toBe(true); // promoting while entering the promotion zone
  expect(pos.isLegal(parseUsi('2d1c')!)).toBe(true);
});

// http://www.talkchess.com/forum3/viewtopic.php?t=60445
test('starting perft', () => {
  const pos = Shogi.default();
  expect(perft(pos, 0, false)).toBe(1);
  expect(perft(pos, 1, false)).toBe(30);
  expect(perft(pos, 2, false)).toBe(900);
  expect(perft(pos, 3, false)).toBe(25470);
  expect(perft(pos, 4, false)).toBe(719731);
  //expect(perft(pos, 5, false)).toBe(19861490);
});

test('blockers perft', () => {
  const posLance = parseSfen('standard', '4k4/4g4/9/4L4/9/9/9/4K4/9 w - 1').unwrap();
  const posRook = parseSfen('standard', '4k4/4g4/9/4R4/9/9/9/4K4/9 w - 1').unwrap();
  expect(perft(posLance, 1, false)).toBe(5);
  expect(perft(posRook, 1, false)).toBe(5);
});

test('capturing', () => {
  const pos = parseSfen('standard', '4k4/9/3g5/3K5/9/9/9/9/9 b - 1').unwrap();
  pos.play(parseUsi('6d6c')!);
  pos.play(parseUsi('5a4a')!);
  expect(pos.isLegal(parseUsi('G*5e')!)).toBe(true);
});

test('promotion', () => {
  const pos = Shogi.default();
  pos.play(parseUsi('1i1h')!);
  expect(makeSfen(pos)).toEqual('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5RL/LNSGKGSN1 w - 2');

  const pos2 = parseSfen('standard', 'lnsgkgsn1/1r5b1/pppppp1p1/6p2/8L/9/PPPPPPPP1/1B5R1/LNSGKGSN1 b LPp 9').unwrap();
  pos2.play(parseUsi('1e1a')!);
  expect(makeSfen(pos2)).toEqual('lnsgkgsn+L/1r5b1/pppppp1p1/6p2/9/9/PPPPPPPP1/1B5R1/LNSGKGSN1 w LPp 10');

  const pos3 = parseSfen('standard', 'lnsgkgsn1/1r5b1/pppppp1p1/6p2/8L/9/PPPPPPPP1/1B5R1/LNSGKGSN1 b LPp 9').unwrap();
  pos3.play(parseUsi('1e1a+')!);
  expect(makeSfen(pos3)).toEqual('lnsgkgsn+L/1r5b1/pppppp1p1/6p2/9/9/PPPPPPPP1/1B5R1/LNSGKGSN1 w LPp 10');
});

test.each(random)('random perft: %s: %s', (_, sfen, d1, d2) => {
  const pos = parseSfen('standard', sfen).unwrap();
  expect(perft(pos, 1, false)).toBe(d1);
  expect(perft(pos, 2, false)).toBe(d2);
});

test('pawn checkmate', () => {
  const pos = parseSfen('standard', '3rkr3/9/8p/4N4/1B7/9/1SG6/1KS6/9 b LPp 1').unwrap();
  const pos2 = pos.clone();

  expect(pos.isLegal(parseUsi('L*5b')!)).toBe(true);
  expect(pos.isLegal(parseUsi('P*5b')!)).toBe(false);

  // If pawn checkmate is played, opponent is victorious
  pos.play(parseUsi('L*5b')!);
  pos2.play(parseUsi('P*5b')!);
  expect(pos.outcome()).toEqual({ winner: 'sente' });
  expect(pos2.outcome()).toEqual({ winner: 'gote' });

  // Single king
  const skPos = parseSfen('standard', '3rkr3/9/8p/4N4/1B7/9/1SG6/2S6/9 b LPp 1').unwrap();
  const skPos2 = skPos.clone();

  expect(skPos.isLegal(parseUsi('L*5b')!)).toBe(true);
  expect(skPos.isLegal(parseUsi('P*5b')!)).toBe(false);

  // If pawn checkmate is played, opponent is victorious
  skPos.play(parseUsi('L*5b')!);
  skPos2.play(parseUsi('P*5b')!);
  expect(skPos.outcome()).toEqual({ winner: 'sente' });
  expect(skPos2.outcome()).toEqual({ winner: 'gote' });
});

const insufficientMaterial: [string, boolean, boolean][] = [
  ['lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1', false, false],
  ['9/4k4/9/9/9/9/9/4K4/9 b - 1', true, true],
  ['9/4k4/9/9/9/9/2G6/4K4/9 b - 1', false, true],
];

test.each(insufficientMaterial)('insufficient material: %s', (sfen, sente, gote) => {
  const pos = parseSfen('standard', sfen).unwrap();
  expect(pos.hasInsufficientMaterial('sente')).toBe(sente);
  expect(pos.hasInsufficientMaterial('gote')).toBe(gote);
});

test('impossible checker alignment', () => {
  // Multiple checkers aligned with king.
  const r1 = parseSfen('standard', 'r8/4s4/7k1/b8/9/2K6/3b5/9/9 b - 1');
  expect(
    r1.unwrap(
      _ => undefined,
      err => err.message
    )
  ).toEqual(IllegalSetup.ImpossibleCheck);

  // Checkers aligned with opponent king are fine.
  parseSfen('standard', '9/9/2s4k1/9/6N2/9/9/3K5/7L1 w - 2').unwrap();
});
