import { COLORS, ROLES } from './types';
import { Board } from './board';
import { Setup } from './setup';
import { Hand, Hands } from './hand';

function rol32(n: number, left: number): number {
  return (n << left) | (n >>> (32 - left));
}

export function fxhash32(word: number, state = 0): number {
  return Math.imul(rol32(state, 5) ^ word, 0x9e3779b9);
}

export function hashBoard(board: Board, state = 0): number {
  state = fxhash32(board.gote.lo, fxhash32(board.gote.mid, fxhash32(board.gote.hi, state)));
  for (const role of ROLES)
    state = fxhash32(board[role].lo, fxhash32(board[role].mid, fxhash32(board[role].hi, state)));
  return state;
}

export function hashHand(hand: Hand, state = 0): number {
  for (const role of ROLES) state = fxhash32(hand[role], state);
  return state;
}

export function hashHands(hands: Hands, state = 0): number {
  for (const color of COLORS) state = hashHand(hands[color], state);
  return state;
}

export function hashSetup(setup: Setup, state = 0): number {
  state = hashBoard(setup.board, state);
  state = hashHands(setup.hands, state);
  if (setup.turn === 'sente') state = fxhash32(1, state);
  return state;
}
