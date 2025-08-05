import { Result } from '@badrap/result';
import { Board } from '../board.js';
import { findHandicap, isHandicap } from '../handicaps.js';
import { Hand, Hands } from '../hands.js';
import { initialSfen, makeSfen, parseSfen } from '../sfen.js';
import type { Color, MoveOrDrop, Rules, Square } from '../types.js';
import { boolToColor, defined, isDrop, isMove, parseCoordinates } from '../util.js';
import type { Position } from '../variant/position.js';
import { allRoles, dimensions, handRoles, promote } from '../variant/util.js';
import { initializePosition } from '../variant/variant.js';
import {
  filesByRules,
  kanjiToNumber,
  kanjiToRole,
  makeJapaneseSquare,
  makeJapaneseSquareHalf,
  makeNumberSquare,
  numberToKanji,
  parseJapaneseSquare,
  parseNumberSquare,
  pieceToBoardKanji,
  roleToFullKanji,
  roleToKanji,
} from './util.js';

//
// KIF HEADER
//

export const InvalidKif = {
  Kif: 'ERR_KIF',
  Board: 'ERR_BOARD',
  Hands: 'ERR_HANDS',
} as const;

export class KifError extends Error {}

// Export
export function makeKifHeader(pos: Position): string {
  const sfen = makeSfen(pos),
    handicap = pos.rules === 'standard' ? findHandicap({ sfen, rules: pos.rules }) : undefined;
  if (sfen === initialSfen(pos.rules)) return '手合割：' + defaultHandicap(pos.rules);
  else if (handicap) return '手合割：' + handicap.japaneseName;
  return makeKifPositionHeader(pos);
}

export function makeKifPositionHeader(pos: Position): string {
  const handicap = isHandicap({ sfen: makeSfen(pos) });
  return [
    ['standard', 'chushogi'].includes(pos.rules) ? '' : '手合割：' + defaultHandicap(pos.rules), // not sure about this, but we need something to indicate the variant
    pos.rules !== 'chushogi'
      ? `${colorName('gote', handicap)}の持駒：` + makeKifHand(pos.rules, pos.hands.color('gote'))
      : '',
    makeKifBoard(pos.rules, pos.board),
    pos.rules !== 'chushogi'
      ? `${colorName('sente', handicap)}の持駒：` + makeKifHand(pos.rules, pos.hands.color('sente'))
      : '',
    ...(pos.turn === 'gote' ? [`${colorName('gote', handicap)}番`] : []),
  ]
    .filter((l) => l.length > 0)
    .join('\n');
}

export function makeKifBoard(rules: Rules, board: Board): string {
  const dims = dimensions(rules),
    kifFiles = filesByRules(rules),
    space = rules === 'chushogi' ? 3 : 2,
    separator = '+' + '-'.repeat(dims.files * (space + 1)) + '+',
    offset = dims.files - 1,
    emptySquare = rules === 'chushogi' ? '  ・' : ' ・';
  let kifBoard = kifFiles + `\n${separator}\n`;
  for (let rank = 0; rank < dims.ranks; rank++) {
    for (let file = offset; file >= 0; file--) {
      const square = parseCoordinates(file, rank)!,
        piece = board.get(square);
      if (file === offset) {
        kifBoard += '|';
      }
      if (!piece) kifBoard += emptySquare;
      else kifBoard += pieceToBoardKanji(piece).padStart(space);

      if (file === 0) kifBoard += '|' + numberToKanji(rank + 1) + '\n';
    }
  }
  kifBoard += separator;
  return kifBoard;
}

export function makeKifHand(rules: Rules, hand: Hand): string {
  if (hand.isEmpty()) return 'なし';
  return handRoles(rules)
    .map((role) => {
      const r = roleToKanji(role),
        n = hand.get(role);
      return n > 1 ? r + numberToKanji(n) : n === 1 ? r : '';
    })
    .filter((p) => p.length > 0)
    .join(' ');
}

function colorName(color: Color, handicap: boolean): string {
  if (handicap) return color === 'gote' ? '上手' : '下手';
  else return color === 'gote' ? '後手' : '先手';
}

function defaultHandicap(rules: Rules): string {
  switch (rules) {
    case 'minishogi':
      return '5五将棋';
    case 'chushogi':
      return '';
    case 'annanshogi':
      return '安南将棋';
    case 'kyotoshogi':
      return '京都将棋';
    case 'checkshogi':
      return '王手将棋';
    default:
      return '平手';
  }
}

// Import
export function parseKifHeader(kif: string): Result<Position, KifError> {
  const lines = normalizedKifLines(kif);
  return parseKifPositionHeader(kif).unwrap(
    (pos) => Result.ok(pos),
    () => {
      const handicapTag = lines.find((l) => l.startsWith('手合割：')),
        handicap = defined(handicapTag)
          ? findHandicap({ japaneseName: handicapTag.split('：')[1] })
          : undefined;

      const hSfen = handicap?.sfen,
        rules = detectVariant(hSfen?.split('/').length, handicapTag);
      return parseSfen(rules, hSfen ?? initialSfen(rules));
    },
  );
}

function parseKifPositionHeader(kif: string, rulesOpt?: Rules): Result<Position, KifError> {
  const lines = normalizedKifLines(kif),
    handicapTag = lines.find((l) => l.startsWith('手合割：')),
    rules = rulesOpt || detectVariant(lines.filter((l) => l.startsWith('|')).length, handicapTag),
    goteHandStr = lines.find((l) => l.startsWith('後手の持駒：') || l.startsWith('上手の持駒：')),
    senteHandStr = lines.find((l) => l.startsWith('先手の持駒：') || l.startsWith('下手の持駒：')),
    turn = lines.some((l) => l.startsWith('後手番') || l.startsWith('上手番')) ? 'gote' : 'sente';

  const board: Result<Board, KifError> = parseKifBoard(rules, kif);

  const goteHand = defined(goteHandStr)
      ? parseKifHand(rules, goteHandStr.split('：')[1])
      : Result.ok(Hand.empty()),
    senteHand = defined(senteHandStr)
      ? parseKifHand(rules, senteHandStr.split('：')[1])
      : Result.ok(Hand.empty());

  return board.chain((board) =>
    goteHand.chain((gHand) =>
      senteHand.chain((sHand) =>
        initializePosition(
          rules,
          {
            board,
            hands: Hands.from(sHand, gHand),
            turn,
            moveNumber: 1,
          },
          false,
        ),
      ),
    ),
  );
}

function detectVariant(lines: number | undefined, tag: string | undefined): Rules {
  if (lines === 12) return 'chushogi';
  else if (
    (!defined(lines) || lines === 0 || lines === 5) &&
    defined(tag) &&
    tag.startsWith('手合割：京都')
  )
    return 'kyotoshogi';
  else if ((defined(tag) && tag.startsWith('手合割：5五')) || lines === 5) return 'minishogi';
  else if (defined(tag) && tag.startsWith('手合割：安南')) return 'annanshogi';
  else if (defined(tag) && tag.startsWith('手合割：王手')) return 'checkshogi';
  else return 'standard';
}

export function parseKifBoard(rules: Rules, kifBoard: string): Result<Board, KifError> {
  const lines = normalizedKifLines(kifBoard).filter((l) => l.startsWith('|'));
  if (lines.length === 0) return Result.err(new KifError(InvalidKif.Board));
  const board = Board.empty();

  const offset = lines.length - 1;
  let file = offset,
    rank = 0;

  for (const l of lines) {
    file = offset;
    let gote = false,
      prom = false;
    for (const c of l) {
      switch (c) {
        case '・':
          file--;
          break;
        case 'v':
          gote = true;
          break;
        case '成':
          prom = true;
          break;
        default: {
          const cSoFar = rules === 'chushogi' && prom ? `成${c}` : c,
            roles = kanjiToRole(cSoFar),
            role = roles.find((r) => allRoles(rules).includes(r));
          if (defined(role) && allRoles(rules).includes(role)) {
            const square = parseCoordinates(file, rank);
            if (!defined(square)) return Result.err(new KifError(InvalidKif.Board));
            const piece = {
              role: (prom && promote(rules)(role)) || role,
              color: boolToColor(!gote),
            };
            board.set(square, piece);
            prom = false;
            gote = false;
            file--;
          }
        }
      }
    }
    rank++;
  }
  return Result.ok(board);
}

export function parseKifHand(rules: Rules, handPart: string): Result<Hand, KifError> {
  const hand = Hand.empty(),
    pieces = handPart.replace(/　/g, ' ').trim().split(' ');

  if (handPart.includes('なし')) return Result.ok(hand);
  for (const piece of pieces) {
    for (let i = 0; i < piece.length; i++) {
      const roles = kanjiToRole(piece[i++]),
        role = roles.find((r) => allRoles(rules).includes(r));
      if (!role || !handRoles(rules).includes(role))
        return Result.err(new KifError(InvalidKif.Hands));
      let countStr = '';
      while (
        i < piece.length &&
        ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'].includes(piece[i])
      )
        countStr += piece[i++];
      const count = Math.max(kanjiToNumber(countStr), 1) + hand.get(role);
      hand.set(role, count);
    }
  }
  return Result.ok(hand);
}

export function parseTags(kif: string): [string, string][] {
  return normalizedKifLines(kif)
    .filter((l) => !l.startsWith('#') && !l.startsWith('*'))
    .map((l) => l.replace('：', ':').split(/:(.*)/, 2) as [string, string]);
}

export function normalizedKifLines(kif: string): string[] {
  return kif
    .replace(/:/g, '：')
    .replace(/　/g, ' ') // full-width space to normal space
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter((l) => l);
}

//
// KIF MOVES
//

export const chushogiKifMoveRegex: RegExp =
  /((?:(?:[１２３４５６７８９]{1,2}|\d\d?)(?:十?[一二三四五六七八九十]))|仝|同)(\S{1,2})((?:（居食い）)|不成|成)?\s?[（|(|←]*((?:[１２３４５６７８９]{1,2}|\d\d?)(?:十?[一二三四五六七八九十]))[）|)]/;
function parseChushogiMove(
  kifMd: string,
  lastDest: Square | undefined = undefined,
): MoveOrDrop | undefined {
  const match = kifMd.match(chushogiKifMoveRegex);
  if (match) {
    const dest = parseJapaneseSquare(match[1]) ?? lastDest;
    if (!defined(dest)) return;

    return {
      from: parseJapaneseSquare(match[4])!,
      to: dest,
      promotion: match[3] === '成',
    };
  }
  return;
}

export const kifMoveRegex: RegExp =
  /((?:[１２３４５６７８９][一二三四五六七八九]|同\s?))(玉|飛|龍|角|馬|金|銀|成銀|桂|成桂|香|成香|歩|と)(不成|成)?\(([1-9][1-9])\)/;
export const kifDropRegex: RegExp =
  /((?:[１２３４５６７８９][一二三四五六七八九]|同\s?))(飛|角|金|銀|桂|香|歩)打/;

// Parsing kif moves/drops
export function parseKifMoveOrDrop(
  kifMd: string,
  lastDest: Square | undefined = undefined,
): MoveOrDrop | undefined {
  // Move
  const match = kifMd.match(kifMoveRegex);
  if (match) {
    const dest = parseJapaneseSquare(match[1]) ?? lastDest;
    if (!defined(dest)) return;

    return {
      from: parseNumberSquare(match[4])!,
      to: dest,
      promotion: match[3] === '成',
    };
  } else {
    // Drop
    const match = kifMd.match(kifDropRegex);
    if (!match || !match[1]) return parseChushogiMove(kifMd, lastDest);

    return {
      role: kanjiToRole(match[2])[0],
      to: parseJapaneseSquare(match[1])!,
    };
  }
}

function isLionDouble(kifMd: string | undefined): boolean {
  const m = defined(kifMd) ? (kifMd || '').split('*')[0].trim() : '';
  return m.includes('一歩目') || m.includes('二歩目');
}

export function parseKifMovesOrDrops(
  kifMds: string[],
  lastDest: Square | undefined = undefined,
): MoveOrDrop[] {
  const mds: MoveOrDrop[] = [];
  for (let i = 0; i < kifMds.length; i++) {
    const m = kifMds[i];
    let md: MoveOrDrop | undefined;
    if (isLionDouble(m) && isLionDouble(kifMds[i + 1])) {
      const firstMove = parseChushogiMove(m),
        secondMove = parseChushogiMove(kifMds[++i]);
      if (firstMove && secondMove && isMove(firstMove) && isMove(secondMove)) {
        md = { from: firstMove.from, to: secondMove.to, midStep: firstMove.to, promotion: false };
      }
    } else md = parseKifMoveOrDrop(m, lastDest);
    if (!md) return mds;
    lastDest = md.to;
    mds.push(md);
  }
  return mds;
}

// Making kif formatted moves/drops
export function makeKifMoveOrDrop(
  pos: Position,
  md: MoveOrDrop,
  lastDest?: Square,
): string | undefined {
  const ms = pos.rules === 'chushogi' ? makeJapaneseSquareHalf : makeJapaneseSquare;
  if (isDrop(md)) {
    return ms(md.to) + roleToKanji(md.role) + '打';
  } else {
    const sameSquareSymbol = pos.rules === 'chushogi' ? '仝' : '同　',
      sameDest = (lastDest ?? pos.lastMoveOrDrop?.to) === md.to,
      moveDestStr = sameDest ? sameSquareSymbol : ms(md.to),
      promStr = md.promotion ? '成' : '',
      role = pos.board.getRole(md.from);
    if (!role) return undefined;
    if (pos.rules === 'chushogi') {
      if (defined(md.midStep)) {
        const isIgui = md.to === md.from && pos.board.has(md.midStep),
          isJitto = md.to === md.from && !isIgui,
          midDestStr = sameDest ? sameSquareSymbol : ms(md.midStep),
          move1 = '一歩目 ' + midDestStr + roleToFullKanji(role) + ' （←' + ms(md.from) + '）',
          move2 =
            '二歩目 ' +
            moveDestStr +
            roleToFullKanji(role) +
            (isIgui ? '（居食い）' : isJitto ? '(じっと)' : '') +
            ' （←' +
            ms(md.midStep) +
            '）';

        return `${move1}\n${move2}`;
      }
      return moveDestStr + roleToFullKanji(role) + promStr + ' （←' + ms(md.from) + '）';
    } else return moveDestStr + roleToKanji(role) + promStr + '(' + makeNumberSquare(md.from) + ')';
  }
}
