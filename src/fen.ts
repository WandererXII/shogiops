import { Result } from '@badrap/result';
import { Piece, Color, POCKET_ROLES, PocketRole } from './types';
import { Board } from './board';
import { Setup, MaterialSide, Material } from './setup';
import { defined, roleToChar, charToRole } from './util';

export const INITIAL_BOARD_FEN = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
export const INITIAL_EPD = INITIAL_BOARD_FEN + ' b -';
export const INITIAL_FEN = INITIAL_EPD + ' 1';
export const EMPTY_BOARD_FEN = '9/9/9/9/9/9/9/9/9';
export const EMPTY_EPD = EMPTY_BOARD_FEN + ' b -';
export const EMPTY_FEN = EMPTY_EPD + ' 1';

export enum InvalidFen {
  Fen = 'ERR_FEN',
  Board = 'ERR_BOARD',
  Pockets = 'ERR_POCKETS',
  Turn = 'ERR_TURN',
  Fullmoves = 'ERR_FULLMOVES',
}

export class FenError extends Error {}

function parseSmallUint(str: string): number | undefined {
  return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}

function charToPiece(ch: string): Piece | undefined {
  const role = charToRole(ch);
  return role && { role, color: ch.toLowerCase() === ch ? 'white' : 'black' };
}

export function parseBoardFen(boardPart: string): Result<Board, FenError> {
  const board = Board.empty();
  let rank = 8;
  let file = 0;
  for (let i = 0; i < boardPart.length; i++) {
    let c = boardPart[i];
    if (c === '/' && file === 9) {
      file = 0;
      rank--;
    } else {
      const step = parseInt(c, 10);
      if (step > 0) file += step;
      else {
        if (file >= 9 || rank < 0) return Result.err(new FenError(InvalidFen.Board));
        if (c === '+' && i + 1 < boardPart.length) c += boardPart[++i];
        const square = file + rank * 9;
        const piece = charToPiece(c);
        if (!piece) return Result.err(new FenError(InvalidFen.Board));
        board.set(square, piece);
        file++;
      }
    }
  }
  if (rank !== 0 || file !== 9) return Result.err(new FenError(InvalidFen.Board));
  return Result.ok(board);
}

export function parsePockets(pocketPart: string): Result<Material, FenError> {
  if (pocketPart.toLowerCase().includes('k')) return Result.err(new FenError(InvalidFen.Pockets));
  const pockets = Material.empty();
  for (let i = 0; i < pocketPart.length; i++) {
    if (pocketPart[i] === '-') break;
    // max 99
    let count: number;
    if (parseInt(pocketPart[i]) >= 0) {
      count = parseInt(pocketPart[i++], 10);
      if (parseInt(pocketPart[i]) >= 0) count = count * 10 + parseInt(pocketPart[i++], 10);
    } else count = 1;
    const piece = charToPiece(pocketPart[i]);
    if (!piece) return Result.err(new FenError(InvalidFen.Pockets));
    pockets[piece.color][piece.role as PocketRole] += count;
  }
  return Result.ok(pockets);
}

export function parseFen(fen: string): Result<Setup, FenError> {
  const parts = fen.split(' ');

  // Board
  const boardPart = parts.shift()!;
  const board: Result<Board, FenError> = parseBoardFen(boardPart);

  // Turn
  const turnPart = parts.shift();
  let turn: Color;
  if (!defined(turnPart) || turnPart === 'b') turn = 'black';
  else if (turnPart === 'w') turn = 'white';
  else return Result.err(new FenError(InvalidFen.Turn));

  // Pocket
  const pocketPart = parts.shift();
  let pockets: Result<Material, FenError>;
  if (!defined(pocketPart)) pockets = Result.ok(Material.empty());
  else pockets = parsePockets(pocketPart);

  // Turn
  const fullmovesPart = parts.shift();
  const fullmoves = defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
  if (!defined(fullmoves)) return Result.err(new FenError(InvalidFen.Fullmoves));

  if (parts.length > 0) return Result.err(new FenError(InvalidFen.Fen));

  return board.chain(board =>
    pockets.map(pockets => {
      return {
        board,
        pockets,
        turn,
        fullmoves: Math.max(1, fullmoves),
      };
    })
  );
}

interface FenOpts {
  epd?: boolean;
}

export function parsePiece(str: string): Piece | undefined {
  if (!str) return;
  const piece = charToPiece(str[0]);
  if (!piece) return;
  else if (str.length > 1 && str[1] !== '+') return;
  return piece;
}

export function makePiece(piece: Piece): string {
  let r = roleToChar(piece.role);
  if (piece.color === 'black') r = r.toUpperCase();
  return r;
}

export function makeBoardFen(board: Board): string {
  let fen = '';
  let empty = 0;
  for (let rank = 8; rank >= 0; rank--) {
    for (let file = 0; file < 9; file++) {
      const square = file + rank * 9;
      const piece = board.get(square);
      if (!piece) empty++;
      else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        fen += makePiece(piece);
      }

      if (file === 8) {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        if (rank !== 0) fen += '/';
      }
    }
  }
  return fen;
}

export function makePocket(material: MaterialSide): string {
  return POCKET_ROLES.map(role => {
    const r = roleToChar(role);
    const n = material[role];
    return n > 1 ? n + r : n === 1 ? r : '';
  }).join('');
}

export function makePockets(pocket: Material): string {
  const pockets = makePocket(pocket.black).toUpperCase() + makePocket(pocket.white);
  return pockets === '' ? '-' : pockets;
}

export function makeFen(setup: Setup, opts?: FenOpts): string {
  return [
    makeBoardFen(setup.board),
    setup.turn[0],
    makePockets(setup.pockets),
    ...(opts?.epd ? [] : [Math.max(1, Math.min(setup.fullmoves, 9999))]),
  ].join(' ');
}
