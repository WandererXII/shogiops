import { Result } from '@badrap/result';
import { Rules } from './types';
import { Setup } from './setup';
import { PositionError, Position, IllegalSetup, Context, Shogi } from './shogi';

export { Position, PositionError, IllegalSetup, Context, Shogi };

export function defaultPosition(rules: Rules): Position {
  switch (rules) {
    case 'shogi':
      return Shogi.default();
  }
}

export function setupPosition(rules: Rules, setup: Setup): Result<Position, PositionError> {
  switch (rules) {
    case 'shogi':
      return Shogi.fromSetup(setup);
  }
}
