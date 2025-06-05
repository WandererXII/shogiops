import { Result } from '@badrap/result';
import { Board } from '../board.js';
import type { Hand } from '../hands.js';
import { Hands } from '../hands.js';
import type { Color, MoveOrDrop } from '../types.js';
import { boolToColor, defined, isDrop, parseCoordinates } from '../util.js';
import { Shogi, standardBoard } from '../variant/shogi.js';
import { allRoles, handRoles, promote } from '../variant/util.js';
import { csaToRole, makeNumberSquare, parseNumberSquare, roleToCsa } from './util.js';

// Olny supports standard shogi no variants

//
// CSA HEADER
//

export enum InvalidCsa {
  CSA = 'ERR_CSA',
  Board = 'ERR_BOARD',
  Handicap = 'ERR_HANDICAP',
  Hands = 'ERR_HANDS',
  AdditionalInfo = 'ERR_ADDITIONAL',
}

export class CsaError extends Error {}

// exporting handicaps differently is prob not worth it, so let's always go with the whole board
export function makeCsaHeader(pos: Shogi): string {
  return [
    makeCsaBoard(pos.board),
    makeCsaHand(pos.hands.color('sente'), 'P+'),
    makeCsaHand(pos.hands.color('gote'), 'P-'),
    pos.turn === 'gote' ? '-' : '+',
  ]
    .filter((p) => p.length > 0)
    .join('\n');
}

export function makeCsaBoard(board: Board): string {
  let csaBoard = '';
  for (let rank = 0; rank < 9; rank++) {
    csaBoard += 'P' + (rank + 1);
    for (let file = 8; file >= 0; file--) {
      const square = parseCoordinates(file, rank)!;
      const piece = board.get(square);
      if (!piece) csaBoard += ' * ';
      else {
        const colorSign = piece.color === 'gote' ? '-' : '+';
        csaBoard += colorSign + roleToCsa(piece.role);
      }
      if (file === 0 && rank < 8) csaBoard += '\n';
    }
  }
  return csaBoard;
}

export function makeCsaHand(hand: Hand, prefix: string): string {
  if (hand.isEmpty()) return '';
  return (
    prefix +
    handRoles('standard')
      .map((role) => {
        const r = roleToCsa(role);
        const n = hand.get(role);
        return ('00' + r).repeat(Math.min(n, 18));
      })
      .filter((p) => p.length > 0)
      .join('')
  );
}

// Import
export function parseCsaHeader(csa: string): Result<Shogi, CsaError> {
  const lines = normalizedCsaLines(csa);
  const handicap = lines.find((l) => l.startsWith('PI'));
  const isWholeBoard = lines.some((l) => l.startsWith('P1'));
  const baseBoard =
    defined(handicap) && !isWholeBoard
      ? parseCsaHandicap(handicap)
      : parseCsaBoard(lines.filter((l) => /^P\d/.test(l)));
  const turn: Color = lines.some((l) => l === '-') ? 'gote' : 'sente';
  return baseBoard.chain((board) => {
    return Shogi.from({ board, hands: Hands.empty(), turn, moveNumber: 1 }, true).chain((pos) =>
      parseAdditions(
        pos,
        lines.filter((l) => /P[+|-]/.test(l)),
      ),
    );
  });
}

export function parseCsaHandicap(handicap: string): Result<Board, CsaError> {
  const splitted = handicap.substring(2).match(/.{4}/g) || [];
  const intitalBoard = standardBoard();
  for (const s of splitted) {
    const sq = parseNumberSquare(s.substring(0, 2));
    if (defined(sq)) {
      intitalBoard.take(sq);
    } else {
      return Result.err(new CsaError(InvalidCsa.Handicap));
    }
  }
  return Result.ok(intitalBoard);
}

function parseCsaBoard(csaBoard: string[]): Result<Board, CsaError> {
  if (csaBoard.length !== 9) return Result.err(new CsaError(InvalidCsa.Board));
  const board = Board.empty();
  let rank = 0;

  for (const r of csaBoard.map((r) => r.substring(2))) {
    let file = 8;
    for (const s of r.match(/.{1,3}/g) || []) {
      if (s.includes('*')) file--;
      else {
        const square = parseCoordinates(file, rank);
        if (!defined(square)) return Result.err(new CsaError(InvalidCsa.Board));
        const role = csaToRole(s.substring(1));
        if (defined(role) && allRoles('standard').includes(role)) {
          const piece = { role: role, color: boolToColor(!s.startsWith('-')) };
          board.set(square, piece);
          file--;
        }
      }
    }
    rank++;
  }

  return Result.ok(board);
}

function parseAdditions(initialPos: Shogi, additions: string[]): Result<Shogi, CsaError> {
  for (const line of additions) {
    const color: Color = line[1] === '+' ? 'sente' : 'gote';
    for (const sp of line.substring(2).match(/.{4}/g) || []) {
      const sqString = sp.substring(0, 2);
      const sq = parseNumberSquare(sqString);
      const role = csaToRole(sp.substring(2, 4));
      if ((defined(sq) || sqString === '00') && defined(role)) {
        if (!defined(sq)) {
          if (!handRoles('standard').includes(role))
            return Result.err(new CsaError(InvalidCsa.Hands));
          initialPos.hands[color].capture(role);
        } else {
          initialPos.board.set(sq, { role: role, color: color });
        }
      } else return Result.err(new CsaError(InvalidCsa.AdditionalInfo));
    }
  }
  return Result.ok(initialPos);
}

export function parseTags(csa: string): [string, string][] {
  return normalizedCsaLines(csa)
    .filter((l) => l.startsWith('$'))
    .map((l) => l.substring(1).split(/:(.*)/, 2) as [string, string]);
}

export function normalizedCsaLines(csa: string): string[] {
  return csa
    .replace(/,/g, '\n')
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter((l) => l);
}

//
// CSA MOVES/DROPS
//

// Parsing CSA moves/drops
export function parseCsaMoveOrDrop(pos: Shogi, csaMd: string): MoveOrDrop | undefined {
  // Move
  const match = csaMd.match(
    /(?:[+-])?([1-9][1-9])([1-9][1-9])(OU|HI|RY|KA|UM|KI|GI|NG|KE|NK|KY|NY|FU|TO)/,
  );
  if (!match) {
    // Drop
    const match = csaMd.match(/(?:[+-])?00([1-9][1-9])(HI|KA|KI|GI|KE|KY|FU)/);
    if (!match) return;
    const drop = {
      role: csaToRole(match[2])!,
      to: parseNumberSquare(match[1])!,
    };
    return drop;
  }
  const role = csaToRole(match[3])!;
  const orig = parseNumberSquare(match[1])!;
  return {
    from: orig,
    to: parseNumberSquare(match[2])!,
    promotion: pos.board.get(orig)?.role !== role,
  };
}

export function parseCsaMovesOrDrops(pos: Shogi, csaMds: string[]): MoveOrDrop[] {
  pos = pos.clone();
  const mds: MoveOrDrop[] = [];
  for (const m of csaMds) {
    const md = parseCsaMoveOrDrop(pos, m);
    if (!md) return mds;
    pos.play(md);
    mds.push(md);
  }
  return mds;
}

// Making CSA formatted moves/drops
export function makeCsaMoveOrDrop(pos: Shogi, md: MoveOrDrop): string | undefined {
  if (isDrop(md)) {
    return '00' + makeNumberSquare(md.to) + roleToCsa(md.role);
  } else {
    const role = pos.board.getRole(md.from);
    if (!role) return undefined;
    return (
      makeNumberSquare(md.from) +
      makeNumberSquare(md.to) +
      roleToCsa((md.promotion && promote('standard')(role)) || role)
    );
  }
}
