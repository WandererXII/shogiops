import { Square, Piece, Role, ROLES, POCKET_ROLES, PROMOTABLE_ROLES } from './types';
import { opposite, squareRank, makeSquare, makeUsi } from './util';
import { makePiece } from './fen';
import { SquareSet } from './squareSet';
import { Board } from './board';
import { Position } from './shogi';

export function squareSet(squares: SquareSet): string {
  const r = [];
  for (let y = 8; y >= 0; y--) {
    for (let x = 0; x < 9; x++) {
      const square = x + y * 9;
      r.push(squares.has(square) ? '1' : '.');
      r.push(x < 8 ? ' ' : '\n');
    }
  }
  return r.join('');
}

export function piece(piece: Piece): string {
  return makePiece(piece);
}

export function board(board: Board): string {
  const r = [];
  for (let y = 8; y >= 0; y--) {
    for (let x = 0; x < 9; x++) {
      const square = x + y * 9;
      const p = board.get(square);
      const col = p ? piece(p) : '.';
      r.push(col);
      r.push(x < 8 ? (col.length < 2 ? ' ' : '') : '\n');
    }
  }
  return r.join('');
}

export function square(sq: Square): string {
  return makeSquare(sq);
}

export function dests(dests: Map<Square, SquareSet>): string {
  const lines = [];
  for (const [from, to] of dests) {
    lines.push(`${makeSquare(from)}: ${Array.from(to, square).join(' ')}`);
  }
  return lines.join('\n');
}

export function perft(pos: Position, depth: number, log = false): number {
  if (depth < 1) return 1;

  const ctx = pos.ctx();
  const dropDests = pos.allDropDests(ctx);

  if (!log && depth === 1 && pos.pockets.isEmpty()) {
    // Optimization for leaf nodes.
    let nodes = 0;
    for (const [from, to] of pos.allDests(ctx)) {
	  nodes += to.size();
	  const role = pos.board.getRole(from);
	  if ((PROMOTABLE_ROLES as ReadonlyArray<string>).includes(role!)) {
		const promMoves = SquareSet.promotionZone(pos.turn).has(from) ? to : to.intersect(SquareSet.promotionZone(pos.turn));
		const forceProm = role === 'pawn' || role === 'lance' ? SquareSet.backrank(pos.turn) : role === 'knight' ? SquareSet.backrank2(pos.turn) : SquareSet.empty();
        nodes += promMoves.diff(forceProm).size();
      }
    }
    return nodes;
  } else {
    let nodes = 0;
    for (const [from, dests] of pos.allDests(ctx)) {
      for (const to of dests) {
		let promotions: Array<boolean> = [];
		const role = pos.board.get(from)!.role;
		const canPromote: boolean = (PROMOTABLE_ROLES as ReadonlyArray<string>).includes(role!) &&
			(SquareSet.promotionZone(pos.turn).has(to) || SquareSet.promotionZone(pos.turn).has(from));
		if (canPromote){
			promotions.push(true);
			if(!(
					((role === 'pawn' || role === 'lance') && SquareSet.backrank(pos.turn).has(to)) ||
					(role === 'knight' && SquareSet.backrank2(pos.turn).has(to))
				))
				promotions.push(false);
		}
		else promotions.push(false);

        for (const promotion of promotions) {
          const child = pos.clone();
          const move = { from, to, promotion };
          child.play(move);
          const children = perft(child, depth - 1, false);
          if (log) console.log(makeUsi(move), children);
          nodes += children;
        }
      }
    }
    for (const [role, dropDestsOfRole] of dropDests) {
		for(const to of dropDestsOfRole) {
			const child = pos.clone();
			const move = { role, to };
			child.play(move);
			const children = perft(child, depth - 1, false);
			if (log) console.log(makeUsi(move), children);
			nodes += children;
		}
    }
    return nodes;
  }
}
