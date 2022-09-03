import { SquareSet } from './squareSet.js';
import { Color, Role, Rules, Piece, Square, Dimensions } from './types.js';
import { squareRank } from './util.js';

export function pieceCanPromote(rules: Rules): (piece: Piece, from: Square, to: Square) => boolean {
  switch (rules) {
    default:
      return (piece: Piece, from: Square, to: Square) =>
        promotableRoles(rules).includes(piece.role) &&
        (promotionZone(rules)(piece.color).has(from) || promotionZone(rules)(piece.color).has(to));
  }
}
export function pieceForcePromote(rules: Rules): (piece: Piece, sq: Square) => boolean {
  switch (rules) {
    default:
      return (piece: Piece, sq: Square) => {
        const dims = dimensions(rules),
          rank = squareRank(sq);
        if (piece.role === 'lance' || piece.role === 'pawn')
          return rank === (piece.color === 'sente' ? 0 : dims.ranks - 1);
        else if (piece.role === 'knight')
          return (
            rank === (piece.color === 'sente' ? 0 : dims.ranks - 1) ||
            rank === (piece.color === 'sente' ? 1 : dims.ranks - 2)
          );
        else return false;
      };
  }
}

export function allRoles(rules: Rules): Role[] {
  switch (rules) {
    case 'minishogi':
      return ['rook', 'bishop', 'gold', 'silver', 'pawn', 'king', 'dragon', 'horse', 'promotedsilver', 'tokin'];
    default:
      return [
        'rook',
        'bishop',
        'gold',
        'silver',
        'knight',
        'lance',
        'pawn',
        'dragon',
        'horse',
        'tokin',
        'promotedsilver',
        'promotedknight',
        'promotedlance',
        'king',
      ];
  }
}

// correct order for sfen export
export function handRoles(rules: Rules): Role[] {
  switch (rules) {
    case 'minishogi':
      return ['rook', 'bishop', 'gold', 'silver', 'pawn'];
    default:
      return ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'];
  }
}

export function promotableRoles(rules: Rules): Role[] {
  switch (rules) {
    case 'minishogi':
      return ['pawn', 'silver', 'bishop', 'rook'];
    default:
      return ['pawn', 'lance', 'knight', 'silver', 'bishop', 'rook'];
  }
}

export function promote(rules: Rules): (role: Role) => Role | undefined {
  switch (rules) {
    case 'minishogi':
      return standardPromote;
    default:
      return standardPromote;
  }
}

export function unpromote(rules: Rules): (role: Role) => Role | undefined {
  switch (rules) {
    case 'minishogi':
      return standardUnpromote;
    default:
      return standardUnpromote;
  }
}

export function promotionZone(rules: Rules): (color: Color) => SquareSet {
  switch (rules) {
    case 'minishogi':
      return (color: Color) => (color === 'sente' ? SquareSet.fromRank(0) : SquareSet.fromRank(4));
    default:
      return (color: Color) =>
        color === 'sente'
          ? new SquareSet([0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
          : new SquareSet([0x0, 0x0, 0x0, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]);
  }
}

export function dimensions(rules: Rules): Dimensions {
  switch (rules) {
    case 'minishogi':
      return { files: 5, ranks: 5 };
    default:
      return { files: 9, ranks: 9 };
  }
}

function standardUnpromote(role: Role): Role | undefined {
  switch (role) {
    case 'tokin':
      return 'pawn';
    case 'promotedlance':
      return 'lance';
    case 'promotedknight':
      return 'knight';
    case 'promotedsilver':
      return 'silver';
    case 'horse':
      return 'bishop';
    case 'dragon':
      return 'rook';
    default:
      return undefined;
  }
}

function standardPromote(role: Role): Role | undefined {
  switch (role) {
    case 'pawn':
      return 'tokin';
    case 'lance':
      return 'promotedlance';
    case 'knight':
      return 'promotedknight';
    case 'silver':
      return 'promotedsilver';
    case 'bishop':
      return 'horse';
    case 'rook':
      return 'dragon';
    default:
      return undefined;
  }
}
