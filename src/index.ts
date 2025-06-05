export type {
  FileName,
  RankName,
  Square,
  SquareName,
  Color,
  Dimensions,
  Role,
  Piece,
  PieceName,
  RoleMap,
  ColorMap,
  HandMap,
  NormalMove,
  DropMove,
  MoveOrDrop,
  Setup,
  Result,
  Rules,
  Outcome,
  Handicap,
} from './types.js';

export {
  defined,
  makeSquareName,
  makeUsi,
  makePieceName,
  opposite,
  parseCoordinates,
  parseSquareName,
  parseUsi,
  parsePieceName,
  isDrop,
  isMove,
  squareFile,
  squareRank,
  toBW,
  toBlackWhite,
  toColor,
  boolToColor,
} from './util.js';

export { FILE_NAMES, RANK_NAMES, COLORS, ROLES, RESULTS, RULES } from './constants.js';

export type { BitRows } from './square-set.js';
export { SquareSet } from './square-set.js';

export { Board } from './board.js';

export type { Context } from './variant/position.js';
export { IllegalSetup, Position, PositionError } from './variant/position.js';

export { Shogi } from './variant/shogi.js';

export { Minishogi } from './variant/minishogi.js';

export { Chushogi } from './variant/chushogi.js';

export { Annanshogi } from './variant/annanshogi.js';

export { Kyotoshogi } from './variant/kyotoshogi.js';

export { Checkshogi } from './variant/checkshogi.js';

export * as variant from './variant/variant.js';

export * as variantUtil from './variant/util.js';

export * as attacks from './attacks.js';

export * as compat from './compat.js';

export * as sfen from './sfen.js';

export * as hands from './hands.js';

export * as handicaps from './handicaps.js';

export * as japanese from './notation/japanese.js';

export * as kitaoKawasaki from './notation/kitao-kawasaki.js';

export * as western from './notation/western.js';

export * as westernEngine from './notation/western-engine.js';

export * as kif from './notation/kif.js';

export * as csa from './notation/csa.js';

export * as notationUtil from './notation/util.js';
