// Exporting only the most common handicaps
export function sfenToHandicapName(sfen: string): string | undefined {
  switch (sfen.split(' ').slice(0, 3).join(' ')) {
    case 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -':
      return '平手';
    case 'lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '香落ち';
    case '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '右香落ち';
    case 'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '角落ち';
    case 'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '飛車落ち';
    case 'lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '飛香落ち';
    case 'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '二枚落ち';
    case '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '四枚落ち';
    case '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '六枚落ち';
    case '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '八枚落ち';
    case '4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w -':
      return '十枚落ち';
    // minishogi
    case 'rbsgk/4p/5/P4/KGSBR b -':
      return '5五将棋';
    default:
      return undefined;
  }
}

// Importing more handicaps
export function handicapNameToSfen(name: string): string | undefined {
  switch (name) {
    case '平手':
      return 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1';
    case '香落ち':
      return 'lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '右香落ち':
      return '1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '角落ち':
      return 'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '飛車落ち':
      return 'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '飛香落ち':
      return 'lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '二枚落ち':
      return 'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '四枚落ち':
      return '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '六枚落ち':
      return '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '八枚落ち':
      return '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '十枚落ち':
      return '4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '歩三兵':
      return '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w 3p 1';
    case '裸玉':
      return '4k4/9/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case 'トンボ＋桂香':
      return 'ln2k2nl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case 'トンボ＋香':
      return 'l3k3l/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case 'トンボ':
      return '4k4/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1';
    case '香得':
      return 'lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w L 1';
    case '角得':
      return 'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w B 1';
    case '飛車得':
      return 'lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w R 1';
    case '飛香得':
      return 'lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RL 1';
    case '二枚得':
      return 'lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB 1';
    case '四枚得':
      return '1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2L 1';
    case '六枚得':
      return '2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2N2L 1';
    case '八枚得':
      return '3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w RB2S2N2L 1';
    case '五々将棋':
    case '5五将棋':
    case '５五将棋':
      return 'rbsgk/4p/5/P4/KGSBR b - 1';
    default:
      return undefined;
  }
}
