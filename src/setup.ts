import { Color } from './types.js';
import { Board } from './board.js';
import { Hands } from './hand.js';

export interface Setup {
  board: Board;
  hands: Hands;
  turn: Color;
  fullmoves: number;
}

export function defaultSetup(): Setup {
  return {
    board: Board.default(),
    hands: Hands.empty(),
    turn: 'sente',
    fullmoves: 1,
  };
}
