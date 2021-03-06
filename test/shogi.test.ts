import { makeFen, parseFen } from '../src/fen';
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
  const pos = Shogi.fromSetup(parseFen('4k4/9/7S1/1+PG3NS1/9/9/9/9/4K3L b - 1').unwrap()).unwrap();
  expect(Shogi.default().isLegal({ from: 20, to: 29, promotion: true })).toBe(false); // promoting outside promotion zone
  expect(pos.isLegal({ from: 46, to: 55, promotion: true })).toBe(false); // promoting tokin
  expect(pos.isLegal({ from: 47, to: 56, promotion: true })).toBe(false); // promoting gold
  expect(pos.isLegal({ from: 8, to: 80, promotion: false })).toBe(false); // not promoting lance on last rank
  expect(pos.isLegal({ from: 8, to: 80, promotion: true })).toBe(true);
  expect(pos.isLegal({ from: 51, to: 70, promotion: false })).toBe(false); // not promoting knight on second last rank
  expect(pos.isLegal({ from: 51, to: 70, promotion: true })).toBe(true);
  expect(pos.isLegal({ from: 61, to: 53, promotion: true })).toBe(true); // promoting while leaving the promotion zone
  expect(pos.isLegal({ from: 61, to: 53, promotion: false })).toBe(true);
  expect(pos.isLegal({ from: 52, to: 62, promotion: true })).toBe(true); // promoting while entering the promotion zone
  expect(pos.isLegal({ from: 52, to: 62, promotion: false })).toBe(true);
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
  const posLance = Shogi.fromSetup(parseFen('4k4/4g4/9/4L4/9/9/9/4K4/9 w - 1').unwrap()).unwrap();
  const posRook = Shogi.fromSetup(parseFen('4k4/4g4/9/4R4/9/9/9/4K4/9 w - 1').unwrap()).unwrap();
  expect(perft(posLance, 1, false)).toBe(5);
  expect(perft(posRook, 1, false)).toBe(5);
});

test('capturing', () => {
  const pos = Shogi.fromSetup(parseFen('4k4/9/3g5/3K5/9/9/9/9/9 b - 1').unwrap()).unwrap();
  pos.play(parseUsi('6d6c')!);
  pos.play(parseUsi('5a4a')!);
  expect(pos.isLegal(parseUsi('G*5e')!)).toBe(true);
});

test('promotion', () => {
  const pos = Shogi.default();
  pos.play(parseUsi('1i1h')!);
  expect(makeFen(pos)).toEqual('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5RL/LNSGKGSN1 w - 2');

  const pos2 = Shogi.fromSetup(
    parseFen('lnsgkgsn1/1r5b1/pppppp1p1/6p2/8L/9/PPPPPPPP1/1B5R1/LNSGKGSN1 b LPp 9').unwrap()
  ).unwrap();
  pos2.play(parseUsi('1e1a')!);
  expect(makeFen(pos2)).toEqual('lnsgkgsn+L/1r5b1/pppppp1p1/6p2/9/9/PPPPPPPP1/1B5R1/LNSGKGSN1 w LPp 10');

  const pos3 = Shogi.fromSetup(
    parseFen('lnsgkgsn1/1r5b1/pppppp1p1/6p2/8L/9/PPPPPPPP1/1B5R1/LNSGKGSN1 b LPp 9').unwrap()
  ).unwrap();
  pos3.play(parseUsi('1e1a+')!);
  expect(makeFen(pos3)).toEqual('lnsgkgsn+L/1r5b1/pppppp1p1/6p2/9/9/PPPPPPPP1/1B5R1/LNSGKGSN1 w LPp 10');
});

test.each(random)('random perft: %s: %s', (_, fen, d1, d2) => {
  const pos = Shogi.fromSetup(parseFen(fen).unwrap()).unwrap();
  expect(perft(pos, 1, false)).toBe(d1);
  expect(perft(pos, 2, false)).toBe(d2);
});

test('pawn checkmate', () => {
  const pos = Shogi.fromSetup(parseFen('3rkr3/9/8p/4N4/1B7/9/1SG6/1KS6/9 b LPp 1').unwrap()).unwrap();
  const pos2 = pos.clone();

  expect(pos.isLegal(parseUsi('L*5b')!)).toBe(true);
  expect(pos.isLegal(parseUsi('P*5b')!)).toBe(false);

  // If pawn checkmate is played, opponent is victorious
  pos.play(parseUsi('L*5b')!);
  pos2.play(parseUsi('P*5b')!);
  expect(pos.outcome()).toEqual({ winner: 'sente' });
  expect(pos2.outcome()).toEqual({ winner: 'gote' });

  // Single king
  const skPos = Shogi.fromSetup(parseFen('3rkr3/9/8p/4N4/1B7/9/1SG6/2S6/9 b LPp 1').unwrap()).unwrap();
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

test.each(insufficientMaterial)('insufficient material: %s', (fen, sente, gote) => {
  const pos = Shogi.fromSetup(parseFen(fen).unwrap()).unwrap();
  expect(pos.hasInsufficientMaterial('sente')).toBe(sente);
  expect(pos.hasInsufficientMaterial('gote')).toBe(gote);
});

test('impossible checker alignment', () => {
  // Multiple checkers aligned with king.
  const r1 = Shogi.fromSetup(parseFen('r8/4s4/7k1/b8/9/2K6/3b5/9/9 b - 1').unwrap());
  expect(
    r1.unwrap(
      _ => undefined,
      err => err.message
    )
  ).toEqual(IllegalSetup.ImpossibleCheck);

  // Checkers aligned with opponent king are fine.
  Shogi.fromSetup(parseFen('9/9/2s4k1/9/6N2/9/9/3K5/7L1 w - 2').unwrap()).unwrap();
});

test('impasse', () => {
  const pos = Shogi.fromSetup(parseFen('2SGS4/+B+RGKGLLRB/3G5/9/7pp/8k/9/9/9 b - 1').unwrap()).unwrap();
  expect(pos.isImpasse()).toBe(true);

  // Only 27 points
  const pos2 = Shogi.fromSetup(parseFen('G3+R3S/GG5SS/GLPBKBPLS/9/9/7+p+p/7+pk/7+p+p/9 b - 1').unwrap()).unwrap();
  expect(pos2.isImpasse()).toBe(false);

  // Only 26 points
  const pos3 = Shogi.fromSetup(parseFen('9/9/9/9/9/9/3r1lllg/+P+P1+bkssgg/K+P4ssg w r 2').unwrap()).unwrap();
  expect(pos3.isImpasse()).toBe(false);

  // Not 10+ pieces in prom zone
  const pos4 = Shogi.fromSetup(parseFen('2SGS4/+B+RGKG2RB/9/9/7pp/8k/9/9/9 b g2s4n4l16p 1').unwrap()).unwrap();
  expect(pos4.isImpasse()).toBe(false);

  // King not in prom zone
  const pos5 = Shogi.fromSetup(parseFen('2SGS4/+B+RG1G2RB/3G5/9/7pp/8k/9/9/4K4 b - 1').unwrap()).unwrap();
  expect(pos5.isImpasse()).toBe(false);

  // King not in prom zone
  const pos6 = Shogi.fromSetup(parseFen('2SGS4/+B+RG1G2RB/3G5/9/7pp/8k/9/9/4K4 b - 1').unwrap()).unwrap();
  expect(pos6.isImpasse()).toBe(false);

  // Enough with pocket
  const pos7 = Shogi.fromSetup(parseFen('G8/4K4/PPPPPPPPP/9/9/7ss/7sk/9/9 b 2R2B 1').unwrap()).unwrap();
  expect(pos7.isImpasse()).toBe(true);

  // 27 points gote
  const pos8 = Shogi.fromSetup(parseFen('9/9/9/9/9/9/3r1llll/+P+P1+bkssgg/K+P3ssgg w r 2').unwrap()).unwrap();
  expect(pos8.isImpasse()).toBe(true);

  // 28 points sente
  const pos9 = Shogi.fromSetup(parseFen('G3+R3S/GG2P2SS/GLPBKBPLS/9/9/7+p+p/7+pk/7+p+p/9 b - 1').unwrap()).unwrap();
  expect(pos9.isImpasse()).toBe(true);
});
