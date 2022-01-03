import { Result } from '@badrap/result';
import { Piece, Color } from './types';
import { Board } from './board';
import { Setup } from './setup';
import { defined, roleToString, stringToRole, toBW } from './util';
import { Hand, Hands } from './hand';
import { ROLES } from './types';

export const INITIAL_BOARD_FEN = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
export const INITIAL_EPD = INITIAL_BOARD_FEN + ' b -';
export const INITIAL_FEN = INITIAL_EPD + ' 1';
export const EMPTY_BOARD_FEN = '9/9/9/9/9/9/9/9/9';
export const EMPTY_EPD = EMPTY_BOARD_FEN + ' b -';
export const EMPTY_FEN = EMPTY_EPD + ' 1';

export enum InvalidFen {
  Fen = 'ERR_FEN',
  Board = 'ERR_BOARD',
  Hands = 'ERR_HANDS',
  Turn = 'ERR_TURN',
  Fullmoves = 'ERR_FULLMOVES',
}

export class FenError extends Error {}

function parseSmallUint(str: string): number | undefined {
  return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}

function stringToPiece(s: string): Piece | undefined {
  const role = stringToRole(s);
  return role && { role, color: s.toLowerCase() === s ? 'gote' : 'sente' };
}

export function parseBoardFen(boardPart: string): Result<Board, FenError> {
  const board = Board.empty();
  const ranks = boardPart.split('/');
  board.numberOfRanks = ranks.length;
  // we assume the board is square
  // since that's good enough for now...
  board.numberOfFiles = board.numberOfRanks;
  const offset = 9 - board.numberOfFiles;
  let rank = 8;
  let file = offset;
  for (let i = 0; i < boardPart.length; i++) {
    let c = boardPart[i];
    if (c === '/' && file === 9) {
      file = offset;
      rank--;
    } else {
      const step = parseInt(c, 10);
      if (step > 0) file += step;
      else {
        if (file >= 9 || rank < 0) return Result.err(new FenError(InvalidFen.Board));
        if (c === '+' && i + 1 < boardPart.length) c += boardPart[++i];
        const square = file + rank * 9;
        const piece = stringToPiece(c);
        if (!piece) return Result.err(new FenError(InvalidFen.Board));
        board.set(square, piece);
        file++;
      }
    }
  }
  if (rank !== offset || file !== 9) return Result.err(new FenError(InvalidFen.Board));
  return Result.ok(board);
}

export function parseHands(handsPart: string): Result<Hands, FenError> {
  const hands = Hands.empty();
  for (let i = 0; i < handsPart.length; i++) {
    if (handsPart[i] === '-') break;
    // max 99
    let count: number;
    if (parseInt(handsPart[i]) >= 0) {
      count = parseInt(handsPart[i++], 10);
      if (parseInt(handsPart[i]) >= 0) count = count * 10 + parseInt(handsPart[i++], 10);
    } else count = 1;
    const piece = stringToPiece(handsPart[i]);
    if (!piece) return Result.err(new FenError(InvalidFen.Hands));
    hands[piece.color][piece.role] += count;
  }
  return Result.ok(hands);
}

export function parseFen(fen: string): Result<Setup, FenError> {
  const parts = fen.split(' ');

  // Board
  const boardPart = parts.shift()!;
  const board: Result<Board, FenError> = parseBoardFen(boardPart);

  // Turn
  const turnPart = parts.shift();
  let turn: Color;
  if (!defined(turnPart) || turnPart === 'b') turn = 'sente';
  else if (turnPart === 'w') turn = 'gote';
  else return Result.err(new FenError(InvalidFen.Turn));

  // Hands
  const handsPart = parts.shift();
  let hands: Result<Hands, FenError>;
  if (!defined(handsPart)) hands = Result.ok(Hands.empty());
  else hands = parseHands(handsPart);

  // Turn
  const fullmovesPart = parts.shift();
  const fullmoves = defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
  if (!defined(fullmoves)) return Result.err(new FenError(InvalidFen.Fullmoves));

  if (parts.length > 0) return Result.err(new FenError(InvalidFen.Fen));

  return board.chain(board =>
    hands.map(hands => {
      return {
        board,
        hands,
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
  const piece = stringToPiece(str[0]);
  if (!piece) return;
  else if (str.length > 1 && str[1] !== '+') return;
  return piece;
}

export function makePiece(piece: Piece): string {
  let r = roleToString(piece.role);
  if (piece.color === 'sente') r = r.toUpperCase();
  return r;
}

export function makeBoardFen(board: Board): string {
  let fen = '';
  let empty = 0;
  for (let rank = 8; rank >= 9 - board.numberOfRanks; rank--) {
    for (let file = 9 - board.numberOfFiles; file < 9; file++) {
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
        if (rank !== 9 - board.numberOfRanks) fen += '/';
      }
    }
  }
  return fen;
}

export function makeHand(hand: Hand): string {
  return ROLES.map(role => {
    const r = roleToString(role);
    const n = hand[role];
    return n > 1 ? n + r : n === 1 ? r : '';
  }).join('');
}

export function makeHands(hands: Hands): string {
  const handsStr = makeHand(hands.sente).toUpperCase() + makeHand(hands.gote);
  return handsStr === '' ? '-' : handsStr;
}

export function makeFen(setup: Setup, opts?: FenOpts): string {
  return [
    makeBoardFen(setup.board),
    toBW(setup.turn),
    makeHands(setup.hands),
    ...(opts?.epd ? [] : [Math.max(1, Math.min(setup.fullmoves, 9999))]),
  ].join(' ');
}
