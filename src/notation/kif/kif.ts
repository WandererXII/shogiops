import { Result } from '@badrap/result';
import { Board } from '../../board.js';
import { Hand, Hands } from '../../hands.js';
import { initialSfen, makeSfen, parseSfen } from '../../sfen.js';
import { Color, Move, Rules, Square, isDrop } from '../../types.js';
import { defined, parseCoordinates } from '../../util.js';
import { Position } from '../../variant/position.js';
import { allRoles, dimensions, handRoles, promote } from '../../variant/util.js';
import { initializePosition } from '../../variant/variant.js';
import {
  kanjiToNumber,
  kanjiToRole,
  makeJapaneseSquare,
  makeNumberSquare,
  numberToKanji,
  parseJapaneseSquare,
  parseNumberSquare,
  roleToFullKanji,
  roleToKanji,
  roleToSingleKanji,
} from '../util.js';
import { handicapNameToSfen, sfenToHandicapName } from './kifHandicaps.js';

//
// KIF HEADER
//

export enum InvalidKif {
  Kif = 'ERR_KIF',
  Board = 'ERR_BOARD',
  Handicap = 'ERR_HANDICAP',
  Hands = 'ERR_HANDS',
}

export class KifError extends Error {}

// Export
export function makeKifHeader(pos: Position): string {
  const handicap = sfenToHandicapName(makeSfen(pos));
  if (defined(handicap)) return '手合割：' + handicap;
  return makeKifPositionHeader(pos);
}

export function makeKifPositionHeader(pos: Position): string {
  return [
    '後手の持駒：' + makeKifHand(pos.rules, pos.hands.color('gote')),
    makeKifBoard(pos.board, pos.rules),
    '先手の持駒：' + makeKifHand(pos.rules, pos.hands.color('sente')),
    ...(pos.turn === 'gote' ? ['後手番'] : []),
  ].join('\n');
}

export function makeKifBoard(board: Board, rules: Rules): string {
  const dims = dimensions(rules);
  const kifFiles = ' ９ ８ ７ ６ ５ ４ ３ ２ １'.slice(-(dims.files * 2));
  const separator = '+' + '-'.repeat(dims.files * 3) + '+';
  const offset = dims.files - 1;
  let kifBoard = ' ' + kifFiles + `\n${separator}\n`;
  for (let rank = 0; rank < dims.ranks; rank++) {
    for (let file = offset; file >= 0; file--) {
      const square = parseCoordinates(file, rank)!;
      const piece = board.get(square);
      if (file === offset) {
        kifBoard += '|';
      }
      if (!piece) kifBoard += ' ・';
      else {
        if (piece.color === 'gote') kifBoard += 'v' + roleToSingleKanji(rules)(piece.role);
        else kifBoard += ' ' + roleToSingleKanji(rules)(piece.role);
      }
      if (file === 0) {
        kifBoard += '|' + numberToKanji(rank + 1) + '\n';
      }
    }
  }
  kifBoard += separator;
  return kifBoard;
}

export function makeKifHand(rules: Rules, hand: Hand): string {
  if (hand.isEmpty()) return 'なし';
  return handRoles(rules)
    .map(role => {
      const r = roleToSingleKanji(rules)(role);
      const n = hand.get(role);
      return n > 1 ? r + numberToKanji(n) : n === 1 ? r : '';
    })
    .filter(p => p.length > 0)
    .join(' ');
}

// Import
export function parseKifHeader(kif: string): Result<Position, KifError> {
  const lines = normalizedKifLines(kif);
  return parseKifPositionHeader(kif).unwrap(
    kifBoard => Result.ok(kifBoard),
    () => {
      const handicap = lines.find(l => l.startsWith('手合割：'));
      const hSfen = defined(handicap) ? handicapNameToSfen(handicap.split('：')[1]) : initialSfen('standard');
      if (!defined(hSfen)) return Result.err(new KifError(InvalidKif.Handicap));
      const rules = hSfen.split('/').length === 5 ? 'minishogi' : 'standard';
      return parseSfen(rules, hSfen);
    }
  );
}

export function parseKifPositionHeader(kif: string): Result<Position, KifError> {
  const lines = normalizedKifLines(kif);
  const rules = lines.filter(l => l.startsWith('|')).length === 5 ? 'minishogi' : 'standard';

  const goteHandStr = lines.find(l => l.startsWith('後手の持駒：'));
  const senteHandStr = lines.find(l => l.startsWith('先手の持駒：'));
  const turn = lines.some(l => l.startsWith('後手番')) ? 'gote' : 'sente';

  const board: Result<Board, KifError> = parseKifBoard(rules, kif);

  const goteHand = defined(goteHandStr) ? parseKifHand(rules, goteHandStr.split('：')[1]) : Result.ok(Hand.empty());
  const senteHand = defined(senteHandStr) ? parseKifHand(rules, senteHandStr.split('：')[1]) : Result.ok(Hand.empty());

  return board.chain(board =>
    goteHand.chain(gHand =>
      senteHand.chain(sHand =>
        initializePosition(
          rules,
          { board, hands: Hands.from(sHand, gHand), turn, moveNumber: 1, lastMove: undefined, lastCapture: undefined },
          true
        )
      )
    )
  );
}

export function parseKifBoard(rules: Rules, kifBoard: string): Result<Board, KifError> {
  const lines = normalizedKifLines(kifBoard).filter(l => l.startsWith('|'));
  if (lines.length === 0) return Result.err(new KifError(InvalidKif.Board));
  const board = Board.empty();

  const offset = lines.length - 1;
  let file = offset;
  let rank = 0;

  for (const l of lines) {
    file = offset;
    let gote = false;
    let prom = false;
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
        default:
          // todo?
          const roles = kanjiToRole(c),
            role = roles.find(r => allRoles(rules).includes(r));
          if (defined(role) && allRoles(rules).includes(role)) {
            const square = parseCoordinates(file, rank);
            if (!defined(square)) return Result.err(new KifError(InvalidKif.Board));
            const piece = { role: (prom && promote(rules)(role)) || role, color: (gote ? 'gote' : 'sente') as Color };
            board.set(square, piece);
            prom = false;
            gote = false;
            file--;
          }
      }
    }
    rank++;
  }
  return Result.ok(board);
}

export function parseKifHand(rules: Rules, handPart: string): Result<Hand, KifError> {
  const hand = Hand.empty();
  const pieces = handPart.replace(/　/g, ' ').trim().split(' ');

  if (handPart.includes('なし')) return Result.ok(hand);
  for (const piece of pieces) {
    for (let i = 0; i < piece.length; i++) {
      const roles = kanjiToRole(piece[i++]),
        role = roles.find(r => allRoles(rules).includes(r));
      if (!role || !handRoles(rules).includes(role)) return Result.err(new KifError(InvalidKif.Hands));
      let countStr = '';
      while (i < piece.length && ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'].includes(piece[i]))
        countStr += piece[i++];
      const count = (kanjiToNumber(countStr) || 1) + hand.get(role);
      hand.set(role, count);
    }
  }
  return Result.ok(hand);
}

export function parseTags(kif: string): [string, string][] {
  return normalizedKifLines(kif)
    .filter(l => !l.startsWith('#') && !l.startsWith('*'))
    .map(l => l.replace('：', ':').split(/:(.*)/, 2) as [string, string]);
}

export function normalizedKifLines(kif: string): string[] {
  return kif
    .replace(/:/g, '：')
    .replace(/　/g, ' ') // full-width space to normal space
    .split(/[\r\n]+/)
    .map(l => l.trim())
    .filter(l => l);
}

//
// KIF MOVES
//

export const kifMoveRegex =
  /((?:[１２３４５６７８９][一二三四五六七八九]|同\s?))(玉|飛|龍|角|馬|金|銀|成銀|桂|成桂|香|成香|歩|と)(不成|成)?\(([1-9][1-9])\)/;
export const kifDropRegex = /((?:[１２３４５６７８９][一二三四五六七八九]|同\s?))(飛|角|金|銀|桂|香|歩)打/;

// Parsing kif moves
export function parseKifMove(kifMove: string, lastDest: Square | undefined = undefined): Move | undefined {
  // Normal move
  const match = kifMove.match(kifMoveRegex);
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
    const match = kifMove.match(kifDropRegex);
    if (!match || !match[1]) return;

    return {
      role: kanjiToRole(match[2])[0]!,
      to: parseJapaneseSquare(match[1])!,
    };
  }
}

export function parseKifMoves(kifMoves: string[], lastDest: Square | undefined = undefined): Move[] {
  const moves: Move[] = [];
  for (const m of kifMoves) {
    const move = parseKifMove(m, lastDest);
    if (!move) return moves;
    lastDest = move.to;
    moves.push(move);
  }
  return moves;
}

// Making kif formatted moves
export function makeKifMove(pos: Position, move: Move, lastDest?: Square): string | undefined {
  if (isDrop(move)) {
    return makeJapaneseSquare(move.to) + roleToKanji(pos.rules)(move.role) + '打';
  } else {
    const sameSquareSymbol = pos.rules === 'chushogi' ? '仝' : '同　',
      sameDest = (lastDest ?? pos.lastMove?.to) === move.to,
      moveDestStr = sameDest ? sameSquareSymbol : makeJapaneseSquare(move.to),
      promStr = move.promotion ? '成' : '',
      role = pos.board.getRole(move.from);
    if (!role) return undefined;
    if (pos.rules === 'chushogi') {
      if (defined(move.midStep)) {
        const isIgui = move.to === move.from && pos.board.has(move.midStep),
          isJitto = move.to === move.from && !isIgui,
          midDestStr = sameDest ? sameSquareSymbol : makeJapaneseSquare(move.midStep),
          move1 =
            '一歩目 ' + midDestStr + roleToFullKanji(pos.rules)(role) + ' （←' + makeJapaneseSquare(move.from) + '）',
          move2 =
            '二歩目 ' +
            moveDestStr +
            roleToFullKanji(pos.rules)(role) +
            (isIgui ? '（居食い）' : isJitto ? '(じっと)' : '') +
            ' （←' +
            makeJapaneseSquare(move.midStep) +
            '）';

        return `${move1},${move2}`;
      }
      return moveDestStr + roleToFullKanji(pos.rules)(role) + promStr + ' （←' + makeJapaneseSquare(move.from) + '）';
    } else return moveDestStr + roleToKanji(pos.rules)(role) + promStr + '(' + makeNumberSquare(move.from) + ')';
  }
}
