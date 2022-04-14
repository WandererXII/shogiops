import { SquareSet } from './squareSet.js';
import { Color, Role, Rules, Piece, Square, Dimensions } from './types.js';

export function pieceCanPromote(rules: Rules): (piece: Piece, from: Square, to: Square) => boolean {
  switch (rules) {
    default:
      return (piece: Piece, from: Square, to: Square) =>
        promotableRoles(rules).includes(piece.role) &&
        (promotionZone(rules)(piece.color).has(from) || promotionZone(rules)(piece.color).has(to));
  }
}
export function pieceInDeadZone(rules: Rules): (piece: Piece, sq: Square) => boolean {
  switch (rules) {
    default:
      return (piece: Piece, sq: Square) => {
        if (piece.role === 'lance' || piece.role === 'pawn')
          return backrank(rules)(piece.color).intersect(SquareSet.fromSquare(sq)).nonEmpty();
        if (piece.role === 'knight')
          return secondBackrank(rules)(piece.color)
            .union(backrank(rules)(piece.color))
            .intersect(SquareSet.fromSquare(sq))
            .nonEmpty();
        return false;
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

export function promote(rules: Rules): (role: Role) => Role {
  switch (rules) {
    case 'minishogi':
      return standardPromote;
    default:
      return standardPromote;
  }
}

export function unpromote(rules: Rules): (role: Role) => Role {
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

export function backrank(rules: Rules): (color: Color) => SquareSet {
  switch (rules) {
    case 'minishogi':
      return promotionZone(rules);
    default:
      return (color: Color) => (color === 'sente' ? SquareSet.fromRank(0) : SquareSet.fromRank(8));
  }
}

export function secondBackrank(rules: Rules): (color: Color) => SquareSet {
  switch (rules) {
    case 'minishogi':
      return (color: Color) => (color === 'sente' ? SquareSet.fromRank(1) : SquareSet.fromRank(3));
    default:
      return (color: Color) => (color === 'sente' ? SquareSet.fromRank(1) : SquareSet.fromRank(7));
  }
}

function standardUnpromote(role: Role): Role {
  switch (role) {
    case 'pawn':
    case 'tokin':
      return 'pawn';
    case 'lance':
    case 'promotedlance':
      return 'lance';
    case 'knight':
    case 'promotedknight':
      return 'knight';
    case 'silver':
    case 'promotedsilver':
      return 'silver';
    case 'gold':
      return 'gold';
    case 'bishop':
    case 'horse':
      return 'bishop';
    case 'rook':
    case 'dragon':
      return 'rook';
    default:
      return role;
  }
}

function standardPromote(role: Role): Role {
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
      return role;
  }
}
