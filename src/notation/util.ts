import { SquareSet } from '../squareSet.js';
import { Role, Rules, Square } from '../types.js';
import { squareFile, squareRank } from '../util.js';
import { Position } from '../variant/position.js';

export function aimingAt(pos: Position, pieces: SquareSet, to: Square): SquareSet {
  let ambs = SquareSet.empty();
  for (const p of pieces) if (pos.moveDests(p).has(to)) ambs = ambs.with(p);
  return ambs;
}

export function roleToWestern(rules: Rules): (role: Role) => string {
  return role => {
    switch (role) {
      case 'pawn':
        return 'P';
      case 'lance':
        return 'L';
      case 'knight':
        return 'N';
      case 'silver':
        return 'S';
      case 'gold':
        return 'G';
      case 'bishop':
        return 'B';
      case 'rook':
        return 'R';
      case 'tokin':
      case 'promotedgold':
        return '+P';
      case 'promotedlance':
        return '+L';
      case 'promotedknight':
        return '+N';
      case 'promotedsilver':
        return '+S';
      case 'horse':
        return rules === 'chushogi' ? 'H' : '+B';
      case 'dragon':
        return rules === 'chushogi' ? 'D' : '+R';
      case 'king':
        return 'K';
      case 'leopard':
        return 'FL';
      case 'copper':
        return 'C';
      case 'elephant':
        return 'DE';
      case 'chariot':
        return 'RC';
      case 'tiger':
        return 'BT';
      case 'kirin':
        return 'Kr';
      case 'phoenix':
        return 'Ph';
      case 'sidemover':
        return 'SM';
      case 'verticalmover':
        return 'VM';
      case 'lion':
        return 'Ln';
      case 'queen':
        return 'FK';
      case 'gobetween':
        return 'GB';
      case 'whitehorse':
        return '+L';
      case 'promotedbishop':
        return '+FL';
      case 'promotedsidemover':
        return '+C';
      case 'promotedverticalmover':
        return '+S';
      case 'promotedrook':
        return '+G';
      case 'prince':
        return '+DE';
      case 'whale':
        return '+RC';
      case 'promotedhorse':
        return '+B';
      case 'stag':
        return '+BT';
      case 'promotedlion':
        return '+Kr';
      case 'promotedqueen':
        return '+Ph';
      case 'boar':
        return '+SM';
      case 'ox':
        return '+VM';
      case 'falcon':
        return '+H';
      case 'eagle':
        return '+D';
      case 'promoteddragon':
        return '+R';
      case 'promotedelephant':
        return '+GB';
    }
  };
}

// for kanji disambiguation
export function roleKanjiDuplicates(role: Role): Role[] {
  const roles: Role[][] = [
    ['gold', 'promotedgold'],
    ['elephant', 'promotedelephant'],
    ['sidemover', 'promotedsidemover'],
    ['verticalmover', 'promotedverticalmover'],
    ['horse', 'promotedhorse'],
    ['dragon', 'promoteddragon'],
    ['lion', 'promotedlion'],
    ['queen', 'promotedqueen'],
  ];
  for (const rs of roles) {
    if (rs.includes(role)) return rs.filter(r => r !== role);
  }
  return [];
}

export function roleToKanji(role: Role): string {
  switch (role) {
    case 'pawn':
      return '歩';
    case 'lance':
      return '香';
    case 'knight':
      return '桂';
    case 'silver':
      return '銀';
    case 'gold':
    case 'promotedgold':
      return '金';
    case 'bishop':
      return '角';
    case 'rook':
      return '飛';
    case 'tokin':
      return 'と';
    case 'promotedlance':
      return '成香';
    case 'promotedknight':
      return '成桂';
    case 'promotedsilver':
      return '成銀';
    case 'horse':
    case 'promotedhorse':
      return '馬';
    case 'dragon':
    case 'promoteddragon':
      return '龍';
    case 'king':
      return '玉';
    case 'leopard':
      return '豹';
    case 'copper':
      return '銅';
    case 'elephant':
    case 'promotedelephant':
      return '象';
    case 'chariot':
      return '反';
    case 'tiger':
      return '虎';
    case 'kirin':
      return '麒';
    case 'phoenix':
      return '鳳';
    case 'sidemover':
    case 'promotedsidemover':
      return '横';
    case 'verticalmover':
    case 'promotedverticalmover':
      return '竪';
    case 'lion':
    case 'promotedlion':
      return '獅';
    case 'queen':
    case 'promotedqueen':
      return '奔';
    case 'gobetween':
      return '仲';
    case 'whitehorse':
      return '駒';
    case 'promotedbishop':
      return '小角';
    case 'promotedrook':
      return '金飛車';
    case 'prince':
      return '太';
    case 'whale':
      return '鯨';
    case 'stag':
      return '鹿';
    case 'boar':
      return '猪';
    case 'ox':
      return '牛';
    case 'falcon':
      return '鷹';
    case 'eagle':
      return '鷲';
  }
}

export function roleToSingleKanji(role: Role): string {
  switch (role) {
    case 'promotedlance':
      return '杏';
    case 'promotedknight':
      return '圭';
    case 'promotedsilver':
      return '全';
    case 'promotedbishop':
      return '角';
    case 'promotedrook':
      return '車';
    default:
      return roleToKanji(role);
  }
}

export function roleToFullKanji(role: Role): string {
  switch (role) {
    case 'pawn':
      return '歩兵';
    case 'lance':
      return '香車';
    case 'knight':
      return '桂馬';
    case 'silver':
      return '銀将';
    case 'gold':
    case 'promotedgold':
      return '金将';
    case 'bishop':
      return '角行';
    case 'rook':
      return '飛車';
    case 'tokin':
      return 'と金';
    case 'promotedlance':
      return '成香';
    case 'promotedknight':
      return '成桂';
    case 'promotedsilver':
      return '成銀';
    case 'horse':
    case 'promotedhorse':
      return '龍馬';
    case 'dragon':
    case 'promoteddragon':
      return '龍王';
    case 'king':
      return '玉将';
    case 'leopard':
      return '猛豹';
    case 'copper':
      return '銅将';
    case 'elephant':
    case 'promotedelephant':
      return '醉象';
    case 'chariot':
      return '反車';
    case 'tiger':
      return '盲虎';
    case 'kirin':
      return '麒麟';
    case 'phoenix':
      return '鳳凰';
    case 'sidemover':
    case 'promotedsidemover':
      return '横行';
    case 'verticalmover':
    case 'promotedverticalmover':
      return '竪行';
    case 'lion':
    case 'promotedlion':
      return '獅子';
    case 'queen':
    case 'promotedqueen':
      return '奔王';
    case 'gobetween':
      return '仲人';
    case 'whitehorse':
      return '白駒';
    case 'promotedbishop':
      return '小角';
    case 'promotedrook':
      return '金飛車';
    case 'prince':
      return '太子';
    case 'whale':
      return '鯨鯢';
    case 'stag':
      return '飛鹿';
    case 'boar':
      return '奔猪';
    case 'ox':
      return '飛牛';
    case 'falcon':
      return '角鷹';
    case 'eagle':
      return '飛鷲';
  }
}

export function kanjiToRole(str: string): Role | undefined {
  switch (str) {
    case '歩':
    case '歩兵':
      return 'pawn';
    case '香':
    case '香車':
      return 'lance';
    case '桂':
    case '桂馬':
      return 'knight';
    case '銀':
    case '銀将':
      return 'silver';
    case '金':
    case '金将':
      return 'gold';
    case '角':
    case '角行':
      return 'bishop';
    case '飛':
    case '飛車':
      return 'rook';
    case 'と':
    case 'と金':
      return 'tokin';
    case '杏':
    case '仝':
    case '成香':
      return 'promotedlance';
    case '圭':
    case '今':
    case '成桂':
      return 'promotedknight';
    case '全':
    case '成銀':
      return 'promotedsilver';
    case '馬':
    case '龍馬':
    case '竜馬':
      return 'horse';
    case '龍':
    case '龍王':
    case '竜王':
      return 'dragon';
    case '玉':
    case '王':
    case '王将':
    case '玉将':
      return 'king';
    case '豹':
    case '猛豹':
      return 'leopard';
    case '銅':
    case '銅将':
      return 'copper';
    case '象':
    case '醉象':
      return 'elephant';
    case '反':
    case '反車':
      return 'chariot';
    case '虎':
    case '盲虎':
      return 'tiger';
    case '麒':
    case '麒麟':
      return 'kirin';
    case '鳳':
    case '鳳凰':
      return 'phoenix';
    case '横':
    case '横行':
      return 'sidemover';
    case '竪':
    case '竪行':
      return 'verticalmover';
    case '獅':
    case '師':
    case '獅子':
      return 'lion';
    case '奔':
    case '奔王':
      return 'queen';
    case '仲':
    case '仲人':
      return 'gobetween';
    case '駒':
    case '白駒':
      return 'whitehorse';
    case '小角':
      return 'promotedbishop';
    case '金飛車':
    case '金飛':
      return 'promotedrook';
    case '太':
    case '太子':
      return 'prince';
    case '鯨':
    case '鯨鯢':
      return 'whale';
    case '鹿':
    case '飛鹿':
      return 'stag';
    case '猪':
    case '奔猪':
      return 'boar';
    case '牛':
    case '飛牛':
      return 'ox';
    case '鷹':
    case '角鷹':
      return 'falcon';
    case '鷲':
    case '飛鷲':
      return 'eagle';
    default:
      return;
  }
}

export function roleToCsa(role: Role): string | undefined {
  switch (role) {
    case 'pawn':
      return 'FU';
    case 'lance':
      return 'KY';
    case 'knight':
      return 'KE';
    case 'silver':
      return 'GI';
    case 'gold':
      return 'KI';
    case 'bishop':
      return 'KA';
    case 'rook':
      return 'HI';
    case 'tokin':
      return 'TO';
    case 'promotedlance':
      return 'NY';
    case 'promotedknight':
      return 'NK';
    case 'promotedsilver':
      return 'NG';
    case 'horse':
      return 'UM';
    case 'dragon':
      return 'RY';
    case 'king':
      return 'OU';
    default:
      return;
  }
}

export function csaToRole(str: string): Role | undefined {
  switch (str) {
    case 'FU':
      return 'pawn';
    case 'KY':
      return 'lance';
    case 'KE':
      return 'knight';
    case 'GI':
      return 'silver';
    case 'KI':
      return 'gold';
    case 'KA':
      return 'bishop';
    case 'HI':
      return 'rook';
    case 'TO':
      return 'tokin';
    case 'NY':
      return 'promotedlance';
    case 'NK':
      return 'promotedknight';
    case 'NG':
      return 'promotedsilver';
    case 'UM':
      return 'horse';
    case 'RY':
      return 'dragon';
    case 'OU':
      return 'king';
    default:
      return undefined;
  }
}

export function makeNumberSquare(sq: Square): string {
  const file = squareFile(sq) + 1,
    rank = squareRank(sq) + 1,
    fileStr = file >= 10 ? String.fromCharCode(file + 87) : file.toString(),
    rankStr = rank >= 10 ? String.fromCharCode(rank + 87) : rank.toString();
  return fileStr + rankStr;
}

// only for single digit boards - something like 111 would be amiguous
export function parseNumberSquare(str: string): Square | undefined {
  if (str.length !== 2) return;
  const file = str.charCodeAt(0) - '1'.charCodeAt(0),
    rank = str.charCodeAt(1) - '1'.charCodeAt(0);
  if (file < 0 || file >= 16 || rank < 0 || rank >= 16) return;
  return file + 16 * rank;
}

export function makeJapaneseSquare(sq: Square): string {
  return (
    (squareFile(sq) + 1)
      .toString()
      .split('')
      .map(c => String.fromCharCode(c.charCodeAt(0) + 0xfee0))
      .join('') + numberToKanji(squareRank(sq) + 1)
  );
}

export function parseJapaneseSquare(str: string): Square | undefined {
  if (str.length < 2 || str.length > 4) return;
  const fileOffset = str.length === 2 || (str.length === 3 && str[1] === '十') ? 1 : 2,
    file =
      parseInt(
        str
          .slice(0, fileOffset)
          .split('')
          .map(c => (c.charCodeAt(0) >= 0xfee0 + 48 ? String.fromCharCode(c.charCodeAt(0) - 0xfee0) : c))
          .join('')
      ) - 1,
    rank = kanjiToNumber(str.slice(fileOffset)) - 1;
  if (isNaN(file) || file < 0 || file >= 16 || rank < 0 || rank >= 16) return;
  return file + 16 * rank;
}

export function toKanjiDigit(str: string): string {
  switch (str) {
    case '1':
      return '一';
    case '2':
      return '二';
    case '3':
      return '三';
    case '4':
      return '四';
    case '5':
      return '五';
    case '6':
      return '六';
    case '7':
      return '七';
    case '8':
      return '八';
    case '9':
      return '九';
    case '10':
      return '十';
    default:
      return '';
  }
}

export function fromKanjiDigit(str: string): number {
  switch (str) {
    case '一':
      return 1;
    case '二':
      return 2;
    case '三':
      return 3;
    case '四':
      return 4;
    case '五':
      return 5;
    case '六':
      return 6;
    case '七':
      return 7;
    case '八':
      return 8;
    case '九':
      return 9;
    case '十':
      return 10;
    default:
      return 0;
  }
}

// max 99
export function numberToKanji(n: number): string {
  n = Math.max(0, Math.min(n, 99));
  const res = n >= 20 ? toKanjiDigit(Math.floor(n / 10).toString()) + '十' : n >= 10 ? '十' : '';
  return res + toKanjiDigit(Math.floor(n % 10).toString());
}

// max 99
export function kanjiToNumber(str: string): number {
  let res = str.startsWith('十') ? 1 : 0;
  for (const s of str) {
    if (s === '十') res *= 10;
    else res += fromKanjiDigit(s);
  }
  return Math.max(0, Math.min(res, 99));
}
