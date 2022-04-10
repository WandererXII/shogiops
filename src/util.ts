import { FILE_NAMES, RANK_NAMES, Color, Square, Role, Move, isDrop, SquareName } from './types.js';

export function defined<A>(v: A | undefined): v is A {
  return v !== undefined;
}

export function opposite(color: Color): Color {
  return color === 'gote' ? 'sente' : 'gote';
}

export function squareRank(square: Square): number {
  return square >>> 4;
}

export function squareFile(square: Square): number {
  return square & 15;
}

export function roleToString(role: Role): string {
  switch (role) {
    case 'pawn':
      return 'p';
    case 'lance':
      return 'l';
    case 'knight':
      return 'n';
    case 'silver':
      return 's';
    case 'gold':
      return 'g';
    case 'bishop':
      return 'b';
    case 'rook':
      return 'r';
    case 'tokin':
      return '+p';
    case 'promotedlance':
      return '+l';
    case 'promotedknight':
      return '+n';
    case 'promotedsilver':
      return '+s';
    case 'horse':
      return '+b';
    case 'dragon':
      return '+r';
    case 'king':
      return 'k';
  }
}

export function roleToCsa(role: Role): string {
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

export function roleTo1Kanji(role: Role): string {
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
      return '金';
    case 'bishop':
      return '角';
    case 'rook':
      return '飛';
    case 'tokin':
      return 'と';
    case 'promotedlance':
      return '杏';
    case 'promotedknight':
      return '圭';
    case 'promotedsilver':
      return '全';
    case 'horse':
      return '馬';
    case 'dragon':
      return '龍';
    case 'king':
      return '玉';
  }
}

export function roleTo2Kanji(role: Role): string {
  switch (role) {
    case 'promotedlance':
      return '成香';
    case 'promotedknight':
      return '成桂';
    case 'promotedsilver':
      return '成銀';
    default:
      return roleTo1Kanji(role);
  }
}

export function kanjiToRole(str: string): Role | undefined {
  switch (str) {
    case '歩':
      return 'pawn';
    case '香':
      return 'lance';
    case '桂':
      return 'knight';
    case '銀':
      return 'silver';
    case '金':
      return 'gold';
    case '角':
      return 'bishop';
    case '飛':
      return 'rook';
    case 'と':
      return 'tokin';
    case '杏':
    case '成香':
      return 'promotedlance';
    case '圭':
    case '成桂':
      return 'promotedknight';
    case '全':
    case '成銀':
      return 'promotedsilver';
    case '馬':
      return 'horse';
    case '龍':
      return 'dragon';
    case '玉':
    case '王':
      return 'king';
    default:
      return undefined;
  }
}

export function stringToRole(
  ch:
    | 'p'
    | 'l'
    | 'n'
    | 's'
    | 'g'
    | 'b'
    | 'r'
    | '+p'
    | '+l'
    | '+n'
    | '+s'
    | '+b'
    | '+r'
    | 'P'
    | 'L'
    | 'N'
    | 'S'
    | 'G'
    | 'B'
    | 'R'
    | '+P'
    | '+L'
    | '+N'
    | '+S'
    | '+B'
    | '+R'
): Role;
export function stringToRole(ch: string): Role | undefined;
export function stringToRole(ch: string): Role | undefined {
  switch (ch) {
    case 'P':
    case 'p':
      return 'pawn';
    case 'L':
    case 'l':
      return 'lance';
    case 'N':
    case 'n':
      return 'knight';
    case 'S':
    case 's':
      return 'silver';
    case 'G':
    case 'g':
      return 'gold';
    case 'B':
    case 'b':
      return 'bishop';
    case 'R':
    case 'r':
      return 'rook';
    case '+P':
    case '+p':
      return 'tokin';
    case '+L':
    case '+l':
      return 'promotedlance';
    case '+N':
    case '+n':
      return 'promotedknight';
    case '+S':
    case '+s':
      return 'promotedsilver';
    case '+B':
    case '+b':
      return 'horse';
    case '+R':
    case '+r':
      return 'dragon';
    case 'K':
    case 'k':
      return 'king';
    default:
      return;
  }
}

export function parseCoordinates(file: number, rank: number): Square | undefined {
  if (file >= 0 && file < 16 && rank >= 0 && rank < 16) return file + rank * 16;
  return;
}

export function parseSquare(str: SquareName): Square;
export function parseSquare(str: string): Square | undefined;
export function parseSquare(str: string): Square | undefined {
  if (str.length !== 2 && str.length !== 3) return;
  const file = parseInt(str.slice(0, -1)) - 1;
  const rank = str.slice(-1).charCodeAt(0) - 'a'.charCodeAt(0);
  if (isNaN(file) || file < 0 || file >= 16 || rank < 0 || rank >= 16) return;
  return file + 16 * rank;
}

export function makeSquare(square: Square): SquareName {
  return (FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)]) as SquareName;
}

export function parseUsi(str: string): Move | undefined {
  if (str[1] === '*') {
    const role = stringToRole(str[0]);
    const to = parseSquare(str.slice(2));
    if (defined(role) && defined(to)) return { role, to };
  } else if (str.length >= 4 && str.length <= 7) {
    const fromOffset = parseInt(str[2]) ? 2 : 3;
    const toOffset = parseInt(str[fromOffset + 1]) ? 3 : 2;
    const from = parseSquare(str.slice(0, fromOffset));
    const to = parseSquare(str.slice(fromOffset, fromOffset + toOffset));
    const promotion = str[fromOffset + toOffset] === '+' ? true : false;
    if (defined(from) && defined(to)) return { from, to, promotion };
  }
  return;
}

export function makeUsi(move: Move): string {
  if (isDrop(move)) return `${roleToString(move.role).toUpperCase()}*${makeSquare(move.to)}`;
  return makeSquare(move.from) + makeSquare(move.to) + (move.promotion ? '+' : '');
}

export function toBW(color: string): 'b' | 'w' {
  // white, w, gote, g
  if (color[0] === 'w' || color[0] === 'g') return 'w';
  return 'b';
}

export function toBlackWhite(color: string): 'black' | 'white' {
  if (color[0] === 'w' || color[0] === 'g') return 'white';
  return 'black';
}

export function toColor(color: string): Color {
  if (color[0] === 'w' || color[0] === 'g') return 'gote';
  return 'sente';
}
