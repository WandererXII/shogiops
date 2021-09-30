import { Result } from '@badrap/result';
import { Board } from './board';
import { INITIAL_FEN, makeFen, parseFen } from './fen';
import { handicapNameToSfen, sfenToHandicapName } from './kifHandicaps';
import { Material, MaterialSide, Setup } from './setup';
import { Position } from './shogi';
import { Color, isDrop, Move, PocketRole, POCKET_ROLES, Square } from './types';
import { defined, kanjiToRole, promote, roleTo1Kanji, roleTo2Kanji } from './util';

import {
  kanjiToNumber,
  kifDestSquare,
  kifOrigSquare,
  normalizedKifLines,
  numberToKanji,
  parseKifSquare,
} from './kifUtil';

//
// KIF HEADER
//

export enum InvalidKif {
  Kif = 'ERR_KIF',
  Board = 'ERR_BOARD',
  Handicap = 'ERR_HANDICAP',
  Pockets = 'ERR_POCKETS',
}

export class KifError extends Error {}

// Export
export function makeKifHeader(setup: Setup): string {
  const handicap = sfenToHandicapName(makeFen(setup, { epd: true }));
  if (defined(handicap)) return '手合割：' + handicap;
  return makeKifPositionHeader(setup);
}

export function makeKifPositionHeader(setup: Setup): string {
  return [
    '後手の持駒：' + makeKifPocket(setup.pockets.gote),
    makeKifBoard(setup.board),
    '先手の持駒：' + makeKifPocket(setup.pockets.sente),
    ...(setup.turn === 'gote' ? ['後手番'] : []),
  ].join('\n');
}

export function makeKifBoard(board: Board): string {
  let kifBoard = '  ９ ８ ７ ６ ５ ４ ３ ２ １\n+---------------------------+\n';
  for (let rank = 8; rank >= 0; rank--) {
    for (let file = 0; file < 9; file++) {
      const square = file + rank * 9;
      const piece = board.get(square);
      if (file === 0) {
        kifBoard += '|';
      }
      if (!piece) kifBoard += ' ・';
      else {
        if (piece.color === 'gote') kifBoard += 'v' + roleTo1Kanji(piece.role);
        else kifBoard += ' ' + roleTo1Kanji(piece.role);
      }
      if (file === 8) {
        kifBoard += '|' + numberToKanji(9 - rank) + '\n';
      }
    }
  }
  kifBoard += '+---------------------------+';
  return kifBoard;
}

export function makeKifPocket(material: MaterialSide): string {
  if (material.isEmpty()) return 'なし';
  return POCKET_ROLES.map(role => {
    const r = roleTo1Kanji(role);
    const n = material[role];
    return n > 1 ? r + numberToKanji(n) : n === 1 ? r : '';
  })
    .filter(p => p.length > 0)
    .join(' ');
}

// Import
export function parseKifHeader(kif: string): Result<Setup, KifError> {
  const lines = normalizedKifLines(kif);
  const handicap = lines.find(l => l.startsWith('手合割：'));
  const hSfen = defined(handicap) ? handicapNameToSfen(handicap.split('：')[1]) : INITIAL_FEN;
  return parseKifPositionHeader(kif).unwrap(
    kifBoard => Result.ok(kifBoard),
    () => {
      if (!defined(hSfen)) return Result.err(new KifError(InvalidKif.Handicap));
      return parseFen(hSfen);
    }
  );
}

export function parseKifPositionHeader(kif: string): Result<Setup, KifError> {
  const lines = normalizedKifLines(kif);

  const gotePocketStr = lines.find(l => l.startsWith('後手の持駒：'));
  const sentePocketStr = lines.find(l => l.startsWith('先手の持駒：'));
  const turn = lines.some(l => l.startsWith('後手番')) ? 'gote' : 'sente';

  const board: Result<Board, KifError> = parseKifBoard(kif);

  const gotePocket = defined(gotePocketStr)
    ? parseKifHand(gotePocketStr.split('：')[1])
    : Result.ok(MaterialSide.empty());
  const sentePocket = defined(sentePocketStr)
    ? parseKifHand(sentePocketStr.split('：')[1])
    : Result.ok(MaterialSide.empty());

  return board.chain(board =>
    gotePocket.chain(gPocket =>
      sentePocket.map(sPocket => {
        return {
          board,
          pockets: new Material(gPocket, sPocket),
          turn,
          fullmoves: 1,
        };
      })
    )
  );
}

export function parseKifBoard(kifBoard: string): Result<Board, KifError> {
  const lines = normalizedKifLines(kifBoard).filter(l => l.startsWith('|'));
  if (lines.length !== 9) return Result.err(new KifError(InvalidKif.Board));
  const board = Board.empty();
  let file = 0;
  let rank = 9;

  for (const l of lines) {
    file = 0;
    rank--;
    let gote = false;
    let prom = false;
    for (const c of l) {
      switch (c) {
        case '・':
          file++;
          break;
        case 'v':
          gote = true;
          break;
        case '成':
          prom = true;
          break;
        default:
          if (file > 9 || rank < 0) return Result.err(new KifError(InvalidKif.Board));
          const role = kanjiToRole(c);
          if (defined(role)) {
            const square = file + rank * 9;
            const piece = { role: prom ? promote(role) : role, color: (gote ? 'gote' : 'sente') as Color };
            board.set(square, piece);
            prom = false;
            gote = false;
            file++;
          }
      }
    }
  }
  if (rank !== 0 || file !== 9) return Result.err(new KifError(InvalidKif.Board));
  return Result.ok(board);
}

export function parseKifHand(pocketPart: string): Result<MaterialSide, KifError> {
  const pockets = MaterialSide.empty();
  const pieces = pocketPart.replace(/　/g, ' ').trim().split(' ');

  if (pocketPart.includes('なし')) return Result.ok(pockets);
  for (const piece of pieces) {
    for (let i = 0; i < piece.length; i++) {
      const role = kanjiToRole(piece[i++]);
      if (!role) return Result.err(new KifError(InvalidKif.Pockets));
      let countStr = '';
      while (i < piece.length && ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'].includes(piece[i]))
        countStr += piece[i++];
      const count = kanjiToNumber(countStr) || 1;
      pockets[role as PocketRole] += count;
    }
  }
  return Result.ok(pockets);
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
      role: kanjiToRole(match[2]) as PocketRole,
      to: parseKifSquare(match[1]) ?? lastDest!,
    };
    return move;
  }

  return {
    from: parseKifSquare(match[4])!,
    to: parseKifSquare(match[1]) ?? lastDest!,
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
export function makeKifMove(pos: Position, move: Move, same = false): string {
  const moveDest = same ? '同　' : kifDestSquare(move.to);
  if (isDrop(move)) {
    return moveDest + roleTo1Kanji(move.role) + '打';
  } else {
    const role = pos.board.getRole(move.from);
    if (!role) return '反則';
    return moveDest + roleTo2Kanji(role) + (move.promotion ? '成' : '') + '(' + kifOrigSquare(move.from) + ')';
  }
}

export function makeKifVariation(
  pos: Position,
  variation: Move[],
  lastDest: Square | undefined = undefined,
  startTurn = 1
): string {
  pos = pos.clone();
  const line = [];
  const padding = (startTurn + variation.length - 1).toString().length;
  for (const m of variation) {
    line.push((startTurn++).toString().padStart(padding) + ' ' + makeKifMove(pos, m, m.to === lastDest));
    pos.play(m);
    lastDest = m.to;
  }
  return line.join('\n');
}
