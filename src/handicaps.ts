import type { Handicap } from './types.js';
import { defined } from './util.js';

export function findHandicaps(handicapOpt: Partial<Handicap>): Handicap[] {
  return handicaps.filter((obj) =>
    (Object.keys(handicapOpt) as Array<keyof typeof handicapOpt>).every((key) => {
      if (key === 'sfen' && defined(handicapOpt.sfen))
        return compareSfens(obj.sfen, handicapOpt.sfen);
      else return obj[key] === handicapOpt[key];
    }),
  );
}

export function findHandicap(handicapOpt: Partial<Handicap>): Handicap | undefined {
  const hs = findHandicaps(handicapOpt);
  return defined(hs) ? hs[0] : undefined;
}

export function isHandicap(handicapOpt: Partial<Handicap>): boolean {
  return defined(findHandicap(handicapOpt));
}

const standardHandicaps: Omit<Handicap, 'rules'>[] = [
  {
    sfen: 'lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '香落ち',
    englishName: 'Lance',
  },
  {
    sfen: '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '右香落ち',
    englishName: 'Right Lance',
  },
  {
    sfen: '1nsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '兩香落ち',
    englishName: 'Both Lance',
  },
  {
    sfen: 'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '角落ち',
    englishName: 'Bishop',
  },
  {
    sfen: 'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '飛車落ち',
    englishName: 'Rook',
  },
  {
    sfen: 'lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '飛香落ち',
    englishName: 'Rook-Lance',
  },
  {
    sfen: 'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '二枚落ち',
    englishName: '2-piece',
  },
  {
    sfen: '1nsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '三枚落ち',
    englishName: '3-piece',
  },
  {
    sfen: '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '四枚落ち',
    englishName: '4-piece',
  },
  {
    sfen: '2sgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '五枚落ち',
    englishName: '5-piece',
  },
  {
    sfen: '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '六枚落ち',
    englishName: '6-piece',
  },
  {
    sfen: '3gkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '七枚落ち',
    englishName: '7-piece',
  },
  {
    sfen: '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '八枚落ち',
    englishName: '8-piece',
  },
  {
    sfen: '4kg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '九枚落ち',
    englishName: '9-piece',
  },
  {
    sfen: '4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '十枚落ち',
    englishName: '10-piece',
  },
  {
    sfen: '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w 3p 1',
    japaneseName: '歩三兵',
    englishName: '3 Pawns',
  },
  {
    sfen: '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '裸玉',
    englishName: 'Naked King',
  },
  {
    sfen: 'ln2k2nl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: 'トンボ＋桂香',
    englishName: 'Dragonfly + NL',
  },
  {
    sfen: 'l3k3l/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: 'トンボ＋香',
    englishName: 'Dragonfly + L',
  },
  {
    sfen: '4k4/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: 'トンボ',
    englishName: 'Dragonfly',
  },
  {
    sfen: 'lnsgkgsnl/1r5b1/p1ppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
    japaneseName: '太閤落ち',
    englishName: 'Taiko',
  },
  {
    sfen: 'lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w L 1',
    japaneseName: '香得',
    englishName: 'Lance Gained',
  },
  {
    sfen: '1nsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w 2L 1',
    japaneseName: '兩香得',
    englishName: 'Two Lance Gained',
  },
  {
    sfen: 'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w B 1',
    japaneseName: '角得',
    englishName: 'Bishop Gained',
  },
  {
    sfen: 'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w R 1',
    japaneseName: '飛車得',
    englishName: 'Rook Gained',
  },
  {
    sfen: 'lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RL 1',
    japaneseName: '飛香得',
    englishName: 'Rook-Lance Gained',
  },
  {
    sfen: 'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB 1',
    japaneseName: '二枚得',
    englishName: '2-piece Gained',
  },
  {
    sfen: '1nsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RBL 1',
    japaneseName: '三枚得',
    englishName: '3-piece Gained',
  },
  {
    sfen: '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2L 1',
    japaneseName: '四枚得',
    englishName: '4-piece Gained',
  },
  {
    sfen: '2sgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RBN2L 1',
    japaneseName: '五枚得',
    englishName: '5-piece Gained',
  },
  {
    sfen: '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2N2L 1',
    japaneseName: '六枚得',
    englishName: '6-piece Gained',
  },
  {
    sfen: '3gkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RBS2N2L 1',
    japaneseName: '七枚得',
    englishName: '7-piece Gained',
  },
  {
    sfen: '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2S2N2L 1',
    japaneseName: '八枚得',
    englishName: '8-piece Gained',
  },
  {
    sfen: '4kg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RBG2S2N2L 1',
    japaneseName: '九枚得',
    englishName: '9-piece Gained',
  },
];

export const handicaps: Handicap[] = [
  // standard
  ...standardHandicaps.map((h) => {
    return {
      rules: 'standard',
      ...h,
    } as Handicap;
  }),
  // minishogi
  {
    rules: 'minishogi',
    sfen: 'r1sgk/4p/5/P4/KGSBR w - 1',
    japaneseName: '角落ち',
    englishName: 'Bishop',
  },
  {
    rules: 'minishogi',
    sfen: '1bsgk/4p/5/P4/KGSBR w - 1',
    japaneseName: '飛車落ち',
    englishName: 'Rook',
  },
  {
    rules: 'minishogi',
    sfen: '2sgk/4p/5/P4/KGSBR w - 1',
    japaneseName: '二枚落ち',
    englishName: '2-piece',
  },
  {
    rules: 'minishogi',
    sfen: '3gk/4p/5/P4/KGSBR w - 1',
    japaneseName: '三枚落ち',
    englishName: '3-piece',
  },
  {
    rules: 'minishogi',
    sfen: '4k/4p/5/P4/KGSBR w - 1',
    japaneseName: '四枚落ち',
    englishName: '4-piece',
  },
  // chushogi
  {
    rules: 'chushogi',
    sfen: 'lfcsgekgscfl/a1b1txxt1b1a/mvrhdqndhrvm/pppppppppppp/3i4i3/12/12/3I4I3/PPPPPPPPPPPP/MVRHDNQDHRVM/A1B1T+O+OT1B1A/LFCSGKEGSCFL w - 1',
    japaneseName: '3枚獅子',
    englishName: '3-piece lion',
  },
  {
    rules: 'chushogi',
    sfen: 'lfcsgekgscfl/a1b1txot1b1a/mvrhdqndhrvm/pppppppppppp/3i4i3/12/12/3I4I3/PPPPPPPPPPPP/MVRHDNQDHRVM/A1B1T+OXT1B1A/LFCSGKEGSCFL w - 1',
    japaneseName: '2枚獅子',
    englishName: '2-lions',
  },
  {
    rules: 'chushogi',
    sfen: 'lfcsgekgscfl/a1b1txot1b1a/mvrhdqndhrvm/pppppppppppp/3i4i3/12/12/3I4I3/PPPPPPPPPPPP/MVRHDNQDHRVM/A1B1TOXT1B1A/LFCSGK+EGSCFL w - 1',
    japaneseName: '2枚王',
    englishName: '2-kings',
  },
  // annanshogi
  {
    sfen: 'lnsgkgsn1/1r5b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '香落ち',
    englishName: 'Lance',
  },
  {
    sfen: '1nsgkgsnl/1r5b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '右香落ち',
    englishName: 'Right Lance',
  },
  {
    sfen: 'lnsgkgsnl/1r7/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '角落ち',
    englishName: 'Bishop',
  },
  {
    sfen: 'lnsgkgsnl/7b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '飛車落ち',
    englishName: 'Rook',
  },
  {
    sfen: 'lnsgkgsn1/7b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '飛香落ち',
    englishName: 'Rook-Lance',
  },
  {
    sfen: 'lnsgkgsnl/9/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '二枚落ち',
    englishName: '2-piece',
  },
  {
    sfen: '1nsgkgsn1/9/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '四枚落ち',
    englishName: '4-piece',
  },
  {
    sfen: '2sgkgs2/9/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '六枚落ち',
    englishName: '6-piece',
  },
  {
    sfen: '3gkg3/9/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '八枚落ち',
    englishName: '8-piece',
  },
  {
    sfen: '4k4/9/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '十枚落ち',
    englishName: '10-piece',
  },
  {
    sfen: '4k4/9/9/9/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w 3p 1',
    rules: 'annanshogi',
    japaneseName: '歩三兵',
    englishName: '3 Pawns',
  },
  {
    sfen: '4k4/9/9/9/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: '裸玉',
    englishName: 'Naked King',
  },
  {
    sfen: 'ln2k2nl/1r5b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: 'トンボ＋桂香',
    englishName: 'Dragonfly + NL',
  },
  {
    sfen: 'l3k3l/1r5b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: 'トンボ＋香',
    englishName: 'Dragonfly + L',
  },
  {
    sfen: '4k4/1r5b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL w - 1',
    rules: 'annanshogi',
    japaneseName: 'トンボ',
    englishName: 'Dragonfly',
  },
  // kyotoshogi
  {
    rules: 'kyotoshogi',
    sfen: 'pgks1/5/5/5/TSKGP w - 1',
    japaneseName: 'と落ち',
    englishName: 'Tokin',
  },
  {
    rules: 'kyotoshogi',
    sfen: 'pgk1t/5/5/5/TSKGP w - 1',
    japaneseName: '銀落ち',
    englishName: 'Silver',
  },
  {
    rules: 'kyotoshogi',
    sfen: '1gkst/5/5/5/TSKGP w - 1',
    japaneseName: '歩落ち',
    englishName: 'Pawn',
  },
  {
    rules: 'kyotoshogi',
    sfen: 'p1kst/5/5/5/TSKGP w - 1',
    japaneseName: '金落ち',
    englishName: 'Gold',
  },
  {
    rules: 'kyotoshogi',
    sfen: '1gks1/5/5/5/TSKGP w - 1',
    japaneseName: '二枚落ち',
    englishName: '2-piece',
  },
  {
    rules: 'kyotoshogi',
    sfen: '1gk2/5/5/5/TSKGP w - 1',
    japaneseName: '三枚落ち',
    englishName: '3-piece',
  },
  {
    rules: 'kyotoshogi',
    sfen: '2k2/5/5/5/TSKGP w - 1',
    japaneseName: '裸玉',
    englishName: 'Naked King',
  },
  // checkshogi
  ...standardHandicaps.map((h) => {
    return {
      rules: 'checkshogi',
      ...h,
    } as Handicap;
  }),
  // dobutsu
  {
    rules: 'dobutsu',
    sfen: 'rkb/3/1P1/BKR w - 1',
    japaneseName: 'ひよこ落ち',
    englishName: 'Chick',
  },
];

function compareSfens(a: string, b: string): boolean {
  const aSplit = a.split(' ');
  const bSplit = b.split(' ');

  return (
    aSplit.length >= 2 &&
    aSplit[0] === bSplit[0] &&
    aSplit[1] === bSplit[1] &&
    (aSplit[2] === bSplit[2] || (aSplit[2] ?? '-') === (bSplit[2] ?? '-'))
  );
}
