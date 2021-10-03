import { Result } from '@badrap/result';
import { Board } from './board';
import { Material, MaterialSide, Setup } from './setup';
import { Position } from './shogi';
import { Color, isDrop, Move, PocketRole, POCKET_ROLES } from './types';
import { csaToRole, defined, promote, roleToCsa } from './util';
import { makeCsaSquare, parseCsaSquare } from './csaUtil';

//
// CSA HEADER
//

export enum InvalidCsa {
  CSA = 'ERR_CSA',
  Board = 'ERR_BOARD',
  Handicap = 'ERR_HANDICAP',
  Pockets = 'ERR_POCKETS',
  AdditionalInfo = 'ERR_ADDITIONAL',
}

export class CsaError extends Error {}

// exporting handicaps differently is prob not worth it, so let's always go with the whole board
export function makeCsaHeader(setup: Setup): string {
  return [
    makeCsaBoard(setup.board),
    makeCsaPocket(setup.pockets.sente, 'P+'),
    makeCsaPocket(setup.pockets.gote, 'P-'),
    setup.turn === 'gote' ? '-' : '+',
  ]
    .filter(p => p.length > 0)
    .join('\n');
}

export function makeCsaBoard(board: Board): string {
  let csaBoard = '';
  for (let rank = 8; rank >= 0; rank--) {
    csaBoard += 'P' + (9 - rank);
    for (let file = 0; file < 9; file++) {
      const square = file + rank * 9;
      const piece = board.get(square);
      if (!piece) csaBoard += ' * ';
      else {
        const colorSign = piece.color === 'gote' ? '-' : '+';
        csaBoard += colorSign + roleToCsa(piece.role);
      }
      if (file === 8 && rank > 0) csaBoard += '\n';
    }
  }
  return csaBoard;
}

export function makeCsaPocket(material: MaterialSide, prefix: string): string {
  if (material.isEmpty()) return '';
  return (
    prefix +
    POCKET_ROLES.map(role => {
      const r = roleToCsa(role);
      const n = material[role];
      return ('00' + r).repeat(Math.min(n, 18));
    })
      .filter(p => p.length > 0)
      .join('')
  );
}

// Import
export function parseCsaHeader(csa: string): Result<Setup, CsaError> {
  const lines = normalizedCsaLines(csa);
  const handicap = lines.find(l => l.startsWith('PI'));
  const isWholeBoard = lines.some(l => l.startsWith('P1'));
  const baseBoard =
    defined(handicap) && !isWholeBoard ? parseCsaHandicap(handicap) : parseCsaBoard(lines.filter(l => /^P\d/.test(l)));
  const turn: Color = lines.some(l => l === '-') ? 'gote' : 'sente';
  return baseBoard.chain(board => {
    const setup = {
      board: board,
      pockets: Material.empty(),
      turn: turn,
      fullmoves: 1,
    };
    return parseAdditions(
      setup,
      lines.filter(l => /P[\+|-]/.test(l))
    );
  });
}

export function parseCsaHandicap(handicap: string): Result<Board, CsaError> {
  const splitted = handicap.substring(2).match(/.{4}/g) || [];
  const intitalBoard = Board.default();
  for (const s of splitted) {
    const sq = parseCsaSquare(s.substring(0, 2));
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
  let file = 0;
  let rank = 9;

  for (const r of csaBoard.map(r => r.substring(2))) {
    file = 0;
    rank--;
    for (const s of r.match(/.{1,3}/g) || []) {
      if (s.includes('*')) file++;
      else {
        if (file >= 9 || rank < 0) return Result.err(new CsaError(InvalidCsa.Board));
        const role = csaToRole(s.substring(1));
        if (defined(role)) {
          const square = file + rank * 9;
          const piece = { role: role, color: (s.startsWith('-') ? 'gote' : 'sente') as Color };
          board.set(square, piece);
          file++;
        }
      }
    }
  }
  if (rank !== 0 || file !== 9) return Result.err(new CsaError(InvalidCsa.Board));
  return Result.ok(board);
}

function parseAdditions(initialSetup: Setup, additions: string[]): Result<Setup, CsaError> {
  for (const line of additions) {
    const color: Color = line[1] === '+' ? 'sente' : 'gote';
    for (const sp of line.substring(2).match(/.{4}/g) || []) {
      const sq = parseCsaSquare(sp.substring(0, 2));
      const role = csaToRole(sp.substring(2, 4));
      if (defined(sq) && defined(role)) {
        if (sq === 0) {
          if (!(POCKET_ROLES as ReadonlyArray<string>).includes(role))
            return Result.err(new CsaError(InvalidCsa.Pockets));
          initialSetup.pockets[color][role as PocketRole]++;
        } else {
          initialSetup.board.set(sq, { role: role, color: color });
        }
      } else return Result.err(new CsaError(InvalidCsa.AdditionalInfo));
    }
  }
  return Result.ok(initialSetup);
}

export function parseTags(csa: string): [string, string][] {
  return normalizedCsaLines(csa)
    .filter(l => l.startsWith('$'))
    .map(l => l.substring(1).split(/:(.*)/, 2) as [string, string]);
}

//
// CSA MOVES
//

// Parsing CSA moves
export function parseCsaMove(pos: Position, csaMove: string): Move | undefined {
  // Normal move
  const match = csaMove.match(/(?:[\+-])?([1-9][1-9])([1-9][1-9])(OU|HI|RY|KA|UM|KI|GI|NG|KE|NK|KY|NY|FU|TO)/);
  if (!match) {
    // Drop
    const match = csaMove.match(/(?:[\+-])?00([1-9][1-9])(HI|KA|KI|GI|KE|KY|FU)/);
    if (!match) return;
    const drop = {
      role: csaToRole(match[2]) as PocketRole,
      to: parseCsaSquare(match[1])!,
    };
    return drop;
  }
  const role = csaToRole(match[3])!;
  const orig = parseCsaSquare(match[1])!;
  return {
    from: orig,
    to: parseCsaSquare(match[2])!,
    promotion: pos.board.get(orig)?.role !== role,
  };
}

export function parseCsaMoves(pos: Position, csaMoves: string[]): Move[] {
  pos = pos.clone();
  const moves: Move[] = [];
  for (const m of csaMoves) {
    const move = parseCsaMove(pos, m);
    if (!move) return moves;
    pos.play(move);
    moves.push(move);
  }
  return moves;
}

// Making CSA formatted moves
export function makeCsaMove(pos: Position, move: Move): string {
  if (isDrop(move)) {
    return '00' + makeCsaSquare(move.to) + roleToCsa(move.role);
  } else {
    const role = pos.board.getRole(move.from);
    if (!role) return '%ERROR';
    return makeCsaSquare(move.from) + makeCsaSquare(move.to) + roleToCsa(move.promotion ? promote(role) : role);
  }
}

export function makeCsaVariation(pos: Position, variation: Move[]): string {
  pos = pos.clone();
  const line = [];
  for (const m of variation) {
    line.push((pos.turn === 'sente' ? '+' : '-') + makeCsaMove(pos, m));
    pos.play(m);
  }
  return line.join('\n');
}

export function normalizedCsaLines(csa: string): string[] {
  return csa
    .replace(/,/g, '\n')
    .split(/[\r\n]+/)
    .map(l => l.trim())
    .filter(l => l);
}
