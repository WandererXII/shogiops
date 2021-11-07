import { SquareSet } from './squareSet';
import { Color, Role, Rules } from './types';

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
      return (color: Color) => (color === 'sente' ? SquareSet.fromRank(8) : SquareSet.fromRank(4));
    default:
      return (color: Color) => (color === 'sente' ? new SquareSet(0, 0, 0x07ffffff) : new SquareSet(0x07ffffff, 0, 0));
  }
}

export function backrank(rules: Rules): (color: Color) => SquareSet {
  switch (rules) {
    case 'minishogi':
      return promotionZone(rules);
    default:
      return (color: Color) => (color === 'sente' ? SquareSet.fromRank(8) : SquareSet.fromRank(0));
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
