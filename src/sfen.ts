import { Result } from '@badrap/result';
import { Board } from './board.js';
import { Hand, Hands } from './hands.js';
import { Color, Piece, Rules, RulesTypeMap } from './types.js';
import { defined, parseCoordinates, roleToString, stringToRole, toBW } from './util.js';
import { Position } from './variant/position.js';
import { dimensions, handRoles } from './variant/util.js';
import { initializePosition } from './variant/variant.js';

export enum InvalidSfen {
  Sfen = 'ERR_SFEN',
  Board = 'ERR_BOARD',
  Hands = 'ERR_HANDS',
  Turn = 'ERR_TURN',
  MoveNumber = 'ERR_MOVENUMBER',
}

export function initialSfen(rules: Rules): string {
  switch (rules) {
    case 'minishogi':
      return 'rbsgk/4p/5/P4/KGSBR b - 1';
    default:
      return 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1';
  }
}

export class SfenError extends Error {}

function parseSmallUint(str: string): number | undefined {
  return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}

function parseColorLetter(str: string): Color | undefined {
  if (str === 'b') return 'sente';
  else if (str === 'w') return 'gote';
  return;
}

function stringToPiece(s: string): Piece | undefined {
  const role = stringToRole(s);
  return role && { role, color: s.toLowerCase() === s ? 'gote' : 'sente' };
}

export function parseBoardSfen(rules: Rules, boardPart: string): Result<Board, SfenError> {
  const ranks = boardPart.split('/');
  // we assume the board is square, since that's good enough for all current variants...
  const dims = { files: ranks.length, ranks: ranks.length },
    ruleDims = dimensions(rules);
  if (dims.files !== ruleDims.files || dims.ranks !== ruleDims.ranks)
    return Result.err(new SfenError(InvalidSfen.Board));
  const board = Board.empty();
  let empty = 0,
    rank = 0,
    file = dims.files - 1;
  for (let i = 0; i < boardPart.length; i++) {
    let c = boardPart[i];
    if (c === '/' && file < 0) {
      empty = 0;
      file = dims.files - 1;
      rank++;
    } else {
      const step = parseInt(c, 10);
      if (step) {
        file = file + empty - (empty * 10 + step);
        empty = empty * 10 + step;
      } else {
        if (file < 0 || file >= dims.files || rank < 0 || rank >= dims.ranks)
          return Result.err(new SfenError(InvalidSfen.Board));
        if (c === '+' && i + 1 < boardPart.length) c += boardPart[++i];
        const square = parseCoordinates(file, rank)!,
          piece = stringToPiece(c);
        if (!piece) return Result.err(new SfenError(InvalidSfen.Board));
        board.set(square, piece);
        empty = 0;
        file--;
      }
    }
  }

  if (rank !== dims.ranks - 1 || file !== -1) return Result.err(new SfenError(InvalidSfen.Board));
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
    count += hands[piece.color].get(piece.role);
    hands[piece.color].set(piece.role, count);
  }
  return Result.ok(hands);
}

export function parseSfen<R extends keyof RulesTypeMap>(
  rules: R,
  sfen: string,
  strict?: boolean
): Result<RulesTypeMap[R], SfenError> {
  const parts = sfen.split(' ');

  // Board
  const boardPart = parts.shift()!,
    board: Result<Board, SfenError> = parseBoardSfen(rules, boardPart);

  // Turn
  const turnPart = parts.shift(),
    turn = defined(turnPart) ? parseColorLetter(turnPart) : 'sente';
  if (!defined(turn)) return Result.err(new SfenError(InvalidSfen.Turn));

  // Hands
  const handsPart = parts.shift(),
    hands = defined(handsPart) ? parseHands(handsPart) : Result.ok(Hands.empty());

  // Move number
  const moveNumberPart = parts.shift(),
    moveNumber = defined(moveNumberPart) ? parseSmallUint(moveNumberPart) : 1;
  if (!defined(moveNumber)) return Result.err(new SfenError(InvalidSfen.MoveNumber));

  if (parts.length > 0) return Result.err(new SfenError(InvalidSfen.Sfen));

  return board.chain(board =>
    hands.chain(hands => initializePosition(rules, board, hands, turn, Math.max(1, moveNumber), !!strict))
  );
}

export function makePiece(piece: Piece): string {
  let r = roleToString(piece.role);
  if (piece.color === 'sente') r = r.toUpperCase();
  return r;
}

export function makeBoardSfen(rules: Rules, board: Board): string {
  const dims = dimensions(rules);
  let sfen = '';
  let empty = 0;
  for (let rank = 0; rank < dims.ranks; rank++) {
    for (let file = dims.files - 1; file >= 0; file--) {
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
        if (rank !== dims.ranks - 1) sfen += '/';
      }
    }
  }
  return sfen;
}

export function makeHand(rules: Rules, hand: Hand): string {
  return handRoles(rules)
    .map(role => {
      const r = roleToString(role);
      const n = hand.get(role);
      return n > 1 ? n + r : n === 1 ? r : '';
    })
    .join('');
}

export function makeHands(rules: Rules, hands: Hands): string {
  const handsStr = makeHand(rules, hands.color('sente')).toUpperCase() + makeHand(rules, hands.color('gote'));
  return handsStr === '' ? '-' : handsStr;
}

export function makeSfen(pos: Position): string {
  return [
    makeBoardSfen(pos.rules, pos.board),
    toBW(pos.turn),
    makeHands(pos.rules, pos.hands),
    Math.max(1, Math.min(pos.moveNumber, 9999)),
  ].join(' ');
}
