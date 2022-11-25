import { Result } from '@badrap/result';
import { Setup } from '../types.js';
import { Chushogi } from './chushogi.js';
import { Minishogi } from './minishogi.js';
import { PositionError } from './position.js';
import { Shogi } from './shogi.js';

export interface RulesTypeMap {
  standard: Shogi;
  minishogi: Minishogi;
  chushogi: Chushogi;
}

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
  setup: Setup,
  strict: boolean
): Result<RulesTypeMap[R], PositionError> {
  switch (rules) {
    case 'chushogi':
      return Chushogi.from(setup, strict);
    case 'minishogi':
      return Minishogi.from(setup, strict);
    default:
      return Shogi.from(setup, strict);
  }
}
