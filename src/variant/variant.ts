import { Result } from '@badrap/result';
import { Board } from '../board.js';
import { Hands } from '../hands.js';
import { Color, RulesTypeMap } from '../types.js';
import { Chushogi } from './chushogi.js';
import { Minishogi } from './minishogi.js';
import { PositionError } from './position.js';
import { Shogi } from './shogi.js';

export function defaultPosition<R extends keyof RulesTypeMap>(rules: R): RulesTypeMap[R] {
  switch (rules) {
    case 'chushogi':
      return Chushogi.default();
    case 'minishogi':
      return Minishogi.default();
    default:
      return Shogi.default();
  }
}

export function initializePosition<R extends keyof RulesTypeMap>(
  rules: R,
  board: Board,
  hands: Hands,
  turn: Color,
  moveNumber: number,
  strict: boolean
): Result<RulesTypeMap[R], PositionError> {
  switch (rules) {
    case 'chushogi':
      return Chushogi.from(board, hands, turn, moveNumber, strict);
    case 'minishogi':
      return Minishogi.from(board, hands, turn, moveNumber, strict);
    default:
      return Shogi.from(board, hands, turn, moveNumber, strict);
  }
}
