import { Result } from '@badrap/result';
import { Board } from './board.js';
import { Hand, Hands } from './hands.js';
import { Color, MoveOrDrop, Piece, Role, Rules, Square } from './types.js';
import { defined, makeSquareName, parseCoordinates, parseSquareName, toBW } from './util.js';
import { Position, PositionError } from './variant/position.js';
import { dimensions, handRoles } from './variant/util.js';
import { RulesTypeMap, initializePosition } from './variant/variant.js';

export enum InvalidSfen {
  Sfen = 'ERR_SFEN',
  BoardDims = 'ERR_BOARD_DIMS',
  BoardPiece = 'ERR_BOARD_PIECE',
  Hands = 'ERR_HANDS',
  Turn = 'ERR_TURN',
  MoveNumber = 'ERR_MOVENUMBER',
}
export class SfenError extends Error {}

export function initialSfen(rules: Rules): string {
  switch (rules) {
    case 'chushogi':
      return 'lfcsgekgscfl/a1b1txot1b1a/mvrhdqndhrvm/pppppppppppp/3i4i3/12/12/3I4I3/PPPPPPPPPPPP/MVRHDNQDHRVM/A1B1TOXT1B1A/LFCSGKEGSCFL b - 1';
    case 'minishogi':
      return 'rbsgk/4p/5/P4/KGSBR b - 1';
    case 'annanshogi':
      return 'lnsgkgsnl/1r5b1/p1ppppp1p/1p5p1/9/1P5P1/P1PPPPP1P/1B5R1/LNSGKGSNL b - 1';
    case 'kyotoshogi':
      return 'pgkst/5/5/5/TSKGP b - 1';
    default:
      return 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1';
  }
}

export function roleToForsyth(rules: Rules): (role: Role) => string | undefined {
  switch (rules) {
    case 'chushogi':
      return chushogiRoleToForsyth;
    case 'minishogi':
      return minishogiRoleToForsyth;
    case 'kyotoshogi':
      return kyotoshogiRoleToForsyth;
    default:
      return standardRoleToForsyth;
  }
}

export function forsythToRole(rules: Rules): (str: string) => Role | undefined {
  switch (rules) {
    case 'chushogi':
      return chushogiForsythToRole;
    case 'minishogi':
      return minishogiForsythToRole;
    case 'kyotoshogi':
      return kyotoshogiForsythToRole;
    default:
      return standardForsythToRole;
  }
}

export function pieceToForsyth(rules: Rules): (piece: Piece) => string | undefined {
  return piece => {
    const r = roleToForsyth(rules)(piece.role);
    if (defined(r) && piece.color === 'sente') return r.toUpperCase();
    else return r;
  };
}

export function forsythToPiece(rules: Rules): (s: string) => Piece | undefined {
  return s => {
    const role = forsythToRole(rules)(s);
    return role && { role, color: s.toLowerCase() === s ? 'gote' : 'sente' };
  };
}

function parseSmallUint(str: string): number | undefined {
  return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}

function parseColorLetter(str: string): Color | undefined {
  if (str === 'b') return 'sente';
  else if (str === 'w') return 'gote';
  else return;
}

export function parseBoardSfen(rules: Rules, boardPart: string): Result<Board, SfenError> {
  const ranks = boardPart.split('/');
  // we assume the board is square, since that's good enough for all current variants...
  const dims = { files: ranks.length, ranks: ranks.length },
    ruleDims = dimensions(rules);
  if (dims.files !== ruleDims.files || dims.ranks !== ruleDims.ranks)
    return Result.err(new SfenError(InvalidSfen.BoardDims));
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
      if (!isNaN(step)) {
        file = file + empty - (empty * 10 + step);
        empty = empty * 10 + step;
      } else {
        if (file < 0 || file >= dims.files || rank < 0 || rank >= dims.ranks)
          return Result.err(new SfenError(InvalidSfen.BoardDims));
        if (c === '+' && i + 1 < boardPart.length) c += boardPart[++i];
        const square = parseCoordinates(file, rank)!,
          piece = forsythToPiece(rules)(c);
        if (!piece) return Result.err(new SfenError(InvalidSfen.BoardPiece));
        board.set(square, piece);
        empty = 0;
        file--;
      }
    }
  }

  if (rank !== dims.ranks - 1 || file !== -1) return Result.err(new SfenError(InvalidSfen.BoardDims));
  return Result.ok(board);
}

export function parseHands(rules: Rules, handsPart: string): Result<Hands, SfenError> {
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
    const piece = forsythToPiece(rules)(handsPart[i]);
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
): Result<RulesTypeMap[R], SfenError | PositionError> {
  const parts = sfen.split(/[\s_]+/);

  // Board
  const boardPart = parts.shift()!,
    board: Result<Board, SfenError> = parseBoardSfen(rules, boardPart);

  // Turn
  const turnPart = parts.shift(),
    turn = defined(turnPart) ? parseColorLetter(turnPart) : 'sente';
  if (!defined(turn)) return Result.err(new SfenError(InvalidSfen.Turn));

  // Hands
  const handsPart = parts.shift();
  let hands = Result.ok(Hands.empty()),
    lastMoveOrDrop: MoveOrDrop | { to: Square } | undefined,
    lastLionCapture: Square | undefined;
  if (rules === 'chushogi') {
    const destSquare = defined(handsPart) ? parseSquareName(handsPart) : undefined;
    if (defined(destSquare)) {
      lastMoveOrDrop = { to: destSquare };
      lastLionCapture = destSquare;
    }
  } else if (defined(handsPart)) hands = parseHands(rules, handsPart);

  // Move number
  const moveNumberPart = parts.shift(),
    moveNumber = defined(moveNumberPart) && moveNumberPart ? parseSmallUint(moveNumberPart) : 1;
  if (!defined(moveNumber)) return Result.err(new SfenError(InvalidSfen.MoveNumber));

  if (parts.length > 0) return Result.err(new SfenError(InvalidSfen.Sfen));

  return board.chain(board =>
    hands.chain(hands =>
      initializePosition(
        rules,
        { board, hands, turn, moveNumber: Math.max(1, moveNumber), lastMoveOrDrop, lastLionCapture },
        !!strict
      )
    )
  );
}

export function makeBoardSfen(rules: Rules, board: Board): string {
  const dims = dimensions(rules);
  let sfen = '',
    empty = 0;
  for (let rank = 0; rank < dims.ranks; rank++) {
    for (let file = dims.files - 1; file >= 0; file--) {
      const square = parseCoordinates(file, rank)!,
        piece = board.get(square);
      if (!piece) empty++;
      else {
        if (empty > 0) {
          sfen += empty;
          empty = 0;
        }
        sfen += pieceToForsyth(rules)(piece)!;
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

export function makeHandSfen(rules: Rules, hand: Hand): string {
  return handRoles(rules)
    .map(role => {
      const r = roleToForsyth(rules)(role)!,
        n = hand.get(role);
      return n > 1 ? n + r : n === 1 ? r : '';
    })
    .join('');
}

export function makeHandsSfen(rules: Rules, hands: Hands): string {
  const handsStr = makeHandSfen(rules, hands.color('sente')).toUpperCase() + makeHandSfen(rules, hands.color('gote'));
  return handsStr === '' ? '-' : handsStr;
}

function lastLionCapture(pos: Position): string {
  return defined(pos.lastLionCapture) ? makeSquareName(pos.lastLionCapture) : '-';
}

export function makeSfen(pos: Position): string {
  return [
    makeBoardSfen(pos.rules, pos.board),
    toBW(pos.turn),
    pos.rules === 'chushogi' ? lastLionCapture(pos) : makeHandsSfen(pos.rules, pos.hands),
    Math.max(1, Math.min(pos.moveNumber, 9999)),
  ].join(' ');
}

function chushogiRoleToForsyth(role: Role): string | undefined {
  switch (role) {
    case 'lance':
      return 'l';
    case 'whitehorse':
      return '+l';
    case 'leopard':
      return 'f';
    case 'bishoppromoted':
      return '+f';
    case 'copper':
      return 'c';
    case 'sidemoverpromoted':
      return '+c';
    case 'silver':
      return 's';
    case 'verticalmoverpromoted':
      return '+s';
    case 'gold':
      return 'g';
    case 'rookpromoted':
      return '+g';
    case 'king':
      return 'k';
    case 'elephant':
      return 'e';
    case 'prince':
      return '+e';
    case 'chariot':
      return 'a';
    case 'whale':
      return '+a';
    case 'bishop':
      return 'b';
    case 'horsepromoted':
      return '+b';
    case 'tiger':
      return 't';
    case 'stag':
      return '+t';
    case 'kirin':
      return 'o';
    case 'lionpromoted':
      return '+o';
    case 'phoenix':
      return 'x';
    case 'queenpromoted':
      return '+x';
    case 'sidemover':
      return 'm';
    case 'boar':
      return '+m';
    case 'verticalmover':
      return 'v';
    case 'ox':
      return '+v';
    case 'rook':
      return 'r';
    case 'dragonpromoted':
      return '+r';
    case 'horse':
      return 'h';
    case 'falcon':
      return '+h';
    case 'dragon':
      return 'd';
    case 'eagle':
      return '+d';
    case 'lion':
      return 'n';
    case 'queen':
      return 'q';
    case 'pawn':
      return 'p';
    case 'promotedpawn':
      return '+p';
    case 'gobetween':
      return 'i';
    case 'elephantpromoted':
      return '+i';
    default:
      return;
  }
}

function chushogiForsythToRole(str: string): Role | undefined {
  switch (str.toLowerCase()) {
    case 'l':
      return 'lance';
    case '+l':
      return 'whitehorse';
    case 'f':
      return 'leopard';
    case '+f':
      return 'bishoppromoted';
    case 'c':
      return 'copper';
    case '+c':
      return 'sidemoverpromoted';
    case 's':
      return 'silver';
    case '+s':
      return 'verticalmoverpromoted';
    case 'g':
      return 'gold';
    case '+g':
      return 'rookpromoted';
    case 'k':
      return 'king';
    case 'e':
      return 'elephant';
    case '+e':
      return 'prince';
    case 'a':
      return 'chariot';
    case '+a':
      return 'whale';
    case 'b':
      return 'bishop';
    case '+b':
      return 'horsepromoted';
    case 't':
      return 'tiger';
    case '+t':
      return 'stag';
    case 'o':
      return 'kirin';
    case '+o':
      return 'lionpromoted';
    case 'x':
      return 'phoenix';
    case '+x':
      return 'queenpromoted';
    case 'm':
      return 'sidemover';
    case '+m':
      return 'boar';
    case 'v':
      return 'verticalmover';
    case '+v':
      return 'ox';
    case 'r':
      return 'rook';
    case '+r':
      return 'dragonpromoted';
    case 'h':
      return 'horse';
    case '+h':
      return 'falcon';
    case 'd':
      return 'dragon';
    case '+d':
      return 'eagle';
    case 'n':
      return 'lion';
    case 'q':
      return 'queen';
    case 'p':
      return 'pawn';
    case '+p':
      return 'promotedpawn';
    case 'i':
      return 'gobetween';
    case '+i':
      return 'elephantpromoted';
    default:
      return;
  }
}

function minishogiRoleToForsyth(role: Role): string | undefined {
  switch (role) {
    case 'king':
      return 'k';
    case 'gold':
      return 'g';
    case 'silver':
      return 's';
    case 'promotedsilver':
      return '+s';
    case 'bishop':
      return 'b';
    case 'horse':
      return '+b';
    case 'rook':
      return 'r';
    case 'dragon':
      return '+r';
    case 'pawn':
      return 'p';
    case 'tokin':
      return '+p';
    default:
      return;
  }
}

function minishogiForsythToRole(ch: string): Role | undefined {
  switch (ch.toLowerCase()) {
    case 'k':
      return 'king';
    case 's':
      return 'silver';
    case '+s':
      return 'promotedsilver';
    case 'g':
      return 'gold';
    case 'b':
      return 'bishop';
    case '+b':
      return 'horse';
    case 'r':
      return 'rook';
    case '+r':
      return 'dragon';
    case 'p':
      return 'pawn';
    case '+p':
      return 'tokin';
    default:
      return;
  }
}

function standardRoleToForsyth(role: Role): string | undefined {
  switch (role) {
    case 'lance':
      return 'l';
    case 'promotedlance':
      return '+l';
    case 'knight':
      return 'n';
    case 'promotedknight':
      return '+n';
    case 'silver':
      return 's';
    case 'promotedsilver':
      return '+s';
    case 'gold':
      return 'g';
    case 'king':
      return 'k';
    case 'bishop':
      return 'b';
    case 'horse':
      return '+b';
    case 'rook':
      return 'r';
    case 'dragon':
      return '+r';
    case 'pawn':
      return 'p';
    case 'tokin':
      return '+p';
    default:
      return;
  }
}

function standardForsythToRole(ch: string): Role | undefined {
  switch (ch.toLowerCase()) {
    case 'l':
      return 'lance';
    case '+l':
      return 'promotedlance';
    case 'n':
      return 'knight';
    case '+n':
      return 'promotedknight';
    case 's':
      return 'silver';
    case '+s':
      return 'promotedsilver';
    case 'g':
      return 'gold';
    case 'k':
      return 'king';
    case 'b':
      return 'bishop';
    case '+b':
      return 'horse';
    case 'r':
      return 'rook';
    case '+r':
      return 'dragon';
    case 'p':
      return 'pawn';
    case '+p':
      return 'tokin';
    default:
      return;
  }
}

function kyotoshogiRoleToForsyth(role: Role): string | undefined {
  switch (role) {
    case 'king':
      return 'k';
    case 'pawn':
      return 'p';
    case 'rook':
      return 'r';
    case 'silver':
      return 's';
    case 'bishop':
      return 'b';
    case 'gold':
      return 'g';
    case 'knight':
      return 'n';
    case 'tokin':
      return 't';
    case 'lance':
      return 'l';
    default:
      return;
  }
}

function kyotoshogiForsythToRole(ch: string): Role | undefined {
  switch (ch.toLowerCase()) {
    case 'k':
      return 'king';
    case 'p':
      return 'pawn';
    case 'r':
      return 'rook';
    case 's':
      return 'silver';
    case 'b':
      return 'bishop';
    case 'g':
      return 'gold';
    case 'n':
      return 'knight';
    case 't':
      return 'tokin';
    case 'l':
      return 'lance';
    default:
      return;
  }
}
