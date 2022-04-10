import { Result } from '@badrap/result';
import { Piece, Color } from './types.js';
import { Board } from './board.js';
import { Setup } from './setup.js';
import { defined, parseCoordinates, roleToString, stringToRole, toBW } from './util.js';
import { Hand, Hands } from './hand.js';
import { ROLES } from './types.js';

export const INITIAL_BOARD_SFEN = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
export const INITIAL_EPD = INITIAL_BOARD_SFEN + ' b -';
export const INITIAL_SFEN = INITIAL_EPD + ' 1';
export const EMPTY_BOARD_SFEN = '9/9/9/9/9/9/9/9/9';
export const EMPTY_EPD = EMPTY_BOARD_SFEN + ' b -';
export const EMPTY_SFEN = EMPTY_EPD + ' 1';

export enum InvalidSfen {
  Sfen = 'ERR_SFEN',
  Board = 'ERR_BOARD',
  Hands = 'ERR_HANDS',
  Turn = 'ERR_TURN',
  Fullmoves = 'ERR_FULLMOVES',
}

export class SfenError extends Error {}

function parseSmallUint(str: string): number | undefined {
  return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}

function stringToPiece(s: string): Piece | undefined {
  const role = stringToRole(s);
  return role && { role, color: s.toLowerCase() === s ? 'gote' : 'sente' };
}

export function parseBoardSfen(boardPart: string): Result<Board, SfenError> {
  const ranks = boardPart.split('/');
  // we assume the board is square
  // since that's good enough for now...
  const board = Board.empty({ files: ranks.length, ranks: ranks.length });
  let empty = 0;
  let rank = 0;
  let file = board.dimensions.files - 1;
  for (let i = 0; i < boardPart.length; i++) {
    let c = boardPart[i];
    if (c === '/' && file < 0) {
      empty = 0;
      file = board.dimensions.files - 1;
      rank++;
    } else {
      const step = parseInt(c, 10);
      if (step) {
        file = file + empty - (empty * 10 + step);
        empty = empty * 10 + step;
      } else {
        if (file < 0 || file >= board.dimensions.files || rank < 0 || rank >= board.dimensions.ranks)
          return Result.err(new SfenError(InvalidSfen.Board));
        if (c === '+' && i + 1 < boardPart.length) c += boardPart[++i];
        const square = parseCoordinates(file, rank)!;
        const piece = stringToPiece(c);
        if (!piece) return Result.err(new SfenError(InvalidSfen.Board));
        board.set(square, piece);
        empty = 0;
        file--;
      }
    }
  }

  if (rank !== board.dimensions.ranks - 1 || file !== -1) return Result.err(new SfenError(InvalidSfen.Board));
  return Result.ok(board);
}

export function parseHands(handsPart: string): Result<Hands, SfenError> {
  const hands = Hands.empty();
  for (let i = 0; i < handsPart.length; i++) {
    if (handsPart[i] === '-') break;
    // max 99
    let count = parseInt(handsPart[i]);
    if (!isNaN(count)) {
      const secondNum = parseInt(handsPart[++i]);
      if (!isNaN(secondNum)) {
        count = count * 10 + secondNum;
        i++;
      }
    } else count = 1;
    const piece = stringToPiece(handsPart[i]);
    if (!piece) return Result.err(new SfenError(InvalidSfen.Hands));
    hands[piece.color][piece.role] += count;
  }
  return Result.ok(hands);
}

export function parseSfen(sfen: string): Result<Setup, SfenError> {
  const parts = sfen.split(' ');

  // Board
  const boardPart = parts.shift()!;
  const board: Result<Board, SfenError> = parseBoardSfen(boardPart);

  // Turn
  const turnPart = parts.shift();
  let turn: Color;
  if (!defined(turnPart) || turnPart === 'b') turn = 'sente';
  else if (turnPart === 'w') turn = 'gote';
  else return Result.err(new SfenError(InvalidSfen.Turn));

  // Hands
  const handsPart = parts.shift();
  let hands: Result<Hands, SfenError>;
  if (!defined(handsPart)) hands = Result.ok(Hands.empty());
  else hands = parseHands(handsPart);

  // Turn
  const fullmovesPart = parts.shift();
  const fullmoves = defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
  if (!defined(fullmoves)) return Result.err(new SfenError(InvalidSfen.Fullmoves));

  if (parts.length > 0) return Result.err(new SfenError(InvalidSfen.Sfen));

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

interface SfenOpts {
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

export function makeBoardSfen(board: Board): string {
  let sfen = '';
  let empty = 0;
  for (let rank = 0; rank < board.dimensions.ranks; rank++) {
    for (let file = board.dimensions.files - 1; file >= 0; file--) {
      const square = parseCoordinates(file, rank)!;
      const piece = board.get(square);
      if (!piece) empty++;
      else {
        if (empty > 0) {
          sfen += empty;
          empty = 0;
        }
        sfen += makePiece(piece);
      }

      if (file === 0) {
        if (empty > 0) {
          sfen += empty;
          empty = 0;
        }
        if (rank !== board.dimensions.ranks - 1) sfen += '/';
      }
    }
  }
  return sfen;
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

export function makeSfen(setup: Setup, opts?: SfenOpts): string {
  return [
    makeBoardSfen(setup.board),
    toBW(setup.turn),
    makeHands(setup.hands),
    ...(opts?.epd ? [] : [Math.max(1, Math.min(setup.fullmoves, 9999))]),
  ].join(' ');
}
