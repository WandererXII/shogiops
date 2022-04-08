import { Result } from '@badrap/result';
import { Board } from '../../board';
import { INITIAL_SFEN, makeSfen, parseSfen } from '../../sfen';
import { handicapNameToSfen, sfenToHandicapName } from './kifHandicaps';
import { Setup } from '../../setup';
import { Position } from '../../shogi';
import { Color, isDrop, Move, Square } from '../../types';
import { defined, kanjiToRole, parseCoordinates, roleTo1Kanji, roleTo2Kanji } from '../../util';

import { Hand, Hands } from '../../hand';
import { allRoles, handRoles, promote } from '../../variantUtil';
import {
  kanjiToNumber,
  makeJapaneseSquare,
  makeNumberSquare,
  numberToKanji,
  parseJapaneseSquare,
  parseNumberSquare,
} from '../notationUtil';

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
export function makeKifHeader(setup: Setup): string {
  const handicap = sfenToHandicapName(makeSfen(setup, { epd: true }));
  if (defined(handicap)) return '手合割：' + handicap;
  return makeKifPositionHeader(setup);
}

export function makeKifPositionHeader(setup: Setup): string {
  return [
    '後手の持駒：' + makeKifHand(setup.hands.gote),
    makeKifBoard(setup.board),
    '先手の持駒：' + makeKifHand(setup.hands.sente),
    ...(setup.turn === 'gote' ? ['後手番'] : []),
  ].join('\n');
}

export function makeKifBoard(board: Board): string {
  const kifFiles = ' ９ ８ ７ ６ ５ ４ ３ ２ １'.slice(-(board.dimensions.files * 2));
  const separator = '+' + '-'.repeat(board.dimensions.files * 3) + '+';
  const offset = board.dimensions.files - 1;
  let kifBoard = ' ' + kifFiles + `\n${separator}\n`;
  for (let rank = 0; rank < board.dimensions.ranks; rank++) {
    for (let file = offset; file >= 0; file--) {
      const square = parseCoordinates(file, rank)!;
      const piece = board.get(square);
      if (file === offset) {
        kifBoard += '|';
      }
      if (!piece) kifBoard += ' ・';
      else {
        if (piece.color === 'gote') kifBoard += 'v' + roleTo1Kanji(piece.role);
        else kifBoard += ' ' + roleTo1Kanji(piece.role);
      }
      if (file === 0) {
        kifBoard += '|' + numberToKanji(rank + 1) + '\n';
      }
    }
  }
  kifBoard += separator;
  return kifBoard;
}

export function makeKifHand(hand: Hand): string {
  if (hand.isEmpty()) return 'なし';
  return handRoles('shogi')
    .map(role => {
      const r = roleTo1Kanji(role);
      const n = hand[role];
      return n > 1 ? r + numberToKanji(n) : n === 1 ? r : '';
    })
    .filter(p => p.length > 0)
    .join(' ');
}

// Import
export function parseKifHeader(kif: string): Result<Setup, KifError> {
  const lines = normalizedKifLines(kif);
  const handicap = lines.find(l => l.startsWith('手合割：'));
  const hSfen = defined(handicap) ? handicapNameToSfen(handicap.split('：')[1]) : INITIAL_SFEN;
  return parseKifPositionHeader(kif).unwrap(
    kifBoard => Result.ok(kifBoard),
    () => {
      if (!defined(hSfen)) return Result.err(new KifError(InvalidKif.Handicap));
      return parseSfen(hSfen);
    }
  );
}

export function parseKifPositionHeader(kif: string): Result<Setup, KifError> {
  const lines = normalizedKifLines(kif);

  const goteHandStr = lines.find(l => l.startsWith('後手の持駒：'));
  const senteHandStr = lines.find(l => l.startsWith('先手の持駒：'));
  const turn = lines.some(l => l.startsWith('後手番')) ? 'gote' : 'sente';

  const board: Result<Board, KifError> = parseKifBoard(kif);

  const goteHand = defined(goteHandStr) ? parseKifHand(goteHandStr.split('：')[1]) : Result.ok(Hand.empty());
  const senteHand = defined(senteHandStr) ? parseKifHand(senteHandStr.split('：')[1]) : Result.ok(Hand.empty());

  return board.chain(board =>
    goteHand.chain(gHand =>
      senteHand.map(sHand => {
        return {
          board,
          hands: new Hands(gHand, sHand),
          turn,
          fullmoves: 1,
        };
      })
    )
  );
}

export function parseKifBoard(kifBoard: string): Result<Board, KifError> {
  const lines = normalizedKifLines(kifBoard).filter(l => l.startsWith('|'));
  if (lines.length === 0) return Result.err(new KifError(InvalidKif.Board));
  const board = Board.empty({ files: lines.length, ranks: lines.length });

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
          const role = kanjiToRole(c);
          if (defined(role) && allRoles('shogi').includes(role)) {
            const square = parseCoordinates(file, rank);
            if (!defined(square)) return Result.err(new KifError(InvalidKif.Board));
            const piece = { role: prom ? promote('shogi')(role) : role, color: (gote ? 'gote' : 'sente') as Color };
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

export function parseKifHand(handPart: string): Result<Hand, KifError> {
  const hand = Hand.empty();
  const pieces = handPart.replace(/　/g, ' ').trim().split(' ');

  if (handPart.includes('なし')) return Result.ok(hand);
  for (const piece of pieces) {
    for (let i = 0; i < piece.length; i++) {
      const role = kanjiToRole(piece[i++]);
      if (!role || !handRoles('shogi').includes(role)) return Result.err(new KifError(InvalidKif.Hands));
      let countStr = '';
      while (i < piece.length && ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'].includes(piece[i]))
        countStr += piece[i++];
      const count = kanjiToNumber(countStr) || 1;
      hand[role] += count;
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

// Parsing kif moves
export function parseKifMove(kifMove: string, lastDest: Square | undefined = undefined): Move | undefined {
  // Normal move
  const match = kifMove.match(
    /((?:[１２３４５６７８９][一二三四五六七八九]|同\s?))(玉|飛|龍|角|馬|金|銀|成銀|桂|成桂|香|成香|歩|と)(成)?\(([1-9][1-9])\)/
  );
  if (!match) {
    // Drop
    const match = kifMove.match(/((?:[１２３４５６７８９][一二三四五六七八九]|同\s?))(飛|角|金|銀|桂|香|歩)打/);
    if (!match) return;
    const move = {
      role: kanjiToRole(match[2])!,
      to: parseJapaneseSquare(match[1]) ?? lastDest!,
    };
    return move;
  }

  return {
    from: parseNumberSquare(match[4])!,
    to: parseJapaneseSquare(match[1]) ?? lastDest!,
    promotion: !!match[3],
  };
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
  const moveDest = lastDest === move.to ? '同　' : makeJapaneseSquare(move.to);
  if (isDrop(move)) {
    return moveDest + roleTo1Kanji(move.role) + '打';
  } else {
    const role = pos.board.getRole(move.from);
    if (!role) return undefined;
    return moveDest + roleTo2Kanji(role) + (move.promotion ? '成' : '') + '(' + makeNumberSquare(move.from) + ')';
  }
}
