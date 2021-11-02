import { Color } from './types';
import { Board } from './board';
import { Hands } from './hand';

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
