import type { Result } from '@badrap/result';
import type { Setup } from '../types.js';
import type { PositionError } from './position.js';
import { Annanshogi } from './rules/annanshogi.js';
import { Checkshogi } from './rules/checkshogi.js';
import { Chushogi } from './rules/chushogi.js';
import { Dobutsu } from './rules/dobutsu.js';
import { Kyotoshogi } from './rules/kyotoshogi.js';
import { Minishogi } from './rules/minishogi.js';
import { Shogi } from './rules/shogi.js';

export interface RulesTypeMap {
  standard: Shogi;
  minishogi: Minishogi;
  chushogi: Chushogi;
  annanshogi: Annanshogi;
  kyotoshogi: Kyotoshogi;
  checkshogi: Checkshogi;
  dobutsu: Dobutsu;
}

export function initializePosition<R extends keyof RulesTypeMap>(
  rules: R,
  setup: Setup,
  strict: boolean,
): Result<RulesTypeMap[R], PositionError> {
  switch (rules) {
    case 'chushogi':
      return Chushogi.from(setup, strict);
    case 'minishogi':
      return Minishogi.from(setup, strict);
    case 'annanshogi':
      return Annanshogi.from(setup, strict);
    case 'kyotoshogi':
      return Kyotoshogi.from(setup, strict);
    case 'checkshogi':
      return Checkshogi.from(setup, strict);
    case 'dobutsu':
      return Dobutsu.from(setup, strict);
    default:
      return Shogi.from(setup, strict);
  }
}
