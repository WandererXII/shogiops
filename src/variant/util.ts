import { SquareSet } from '../square-set.js';
import type { Color, Dimensions, Piece, Role, Rules, Square } from '../types.js';
import { squareRank } from '../util.js';

export function pieceCanPromote(
  rules: Rules,
): (piece: Piece, from: Square, to: Square, capture: Piece | undefined) => boolean {
  switch (rules) {
    case 'chushogi':
      return (piece: Piece, from: Square, to: Square, capture: Piece | undefined) => {
        const pZone = promotionZone(rules)(piece.color);
        return (
          promotableRoles(rules).includes(piece.role) &&
          ((!pZone.has(from) && pZone.has(to)) ||
            (!!capture && (pZone.has(from) || pZone.has(to))) ||
            (['pawn', 'lance'].includes(piece.role) &&
              squareRank(to) === (piece.color === 'sente' ? 0 : dimensions(rules).ranks - 1)))
        );
      };
    case 'kyotoshogi':
      return (piece: Piece) => promotableRoles(rules).includes(piece.role);
    default:
      return (piece: Piece, from: Square, to: Square) =>
        promotableRoles(rules).includes(piece.role) &&
        (promotionZone(rules)(piece.color).has(from) || promotionZone(rules)(piece.color).has(to));
  }
}
export function pieceForcePromote(rules: Rules): (piece: Piece, sq: Square) => boolean {
  switch (rules) {
    case 'chushogi':
    case 'annanshogi':
      return () => false;
    case 'kyotoshogi':
      return (piece: Piece) => promotableRoles(rules).includes(piece.role);
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

export function promotableOnDrop(rules: Rules): (piece: Piece) => boolean {
  switch (rules) {
    case 'kyotoshogi':
      return (piece: Piece) => promotableRoles(rules).includes(piece.role);
    default:
      return () => false;
  }
}

export function allRoles(rules: Rules): Role[] {
  switch (rules) {
    case 'chushogi':
      return [
        'lance',
        'leopard',
        'copper',
        'silver',
        'gold',
        'elephant',
        'chariot',
        'bishop',
        'tiger',
        'phoenix',
        'kirin',
        'sidemover',
        'verticalmover',
        'rook',
        'horse',
        'dragon',
        'queen',
        'lion',
        'pawn',
        'gobetween',
        'king',
        'promotedpawn',
        'ox',
        'stag',
        'boar',
        'falcon',
        'prince',
        'eagle',
        'whale',
        'whitehorse',
        'dragonpromoted',
        'horsepromoted',
        'lionpromoted',
        'queenpromoted',
        'bishoppromoted',
        'elephantpromoted',
        'sidemoverpromoted',
        'verticalmoverpromoted',
        'rookpromoted',
      ];
    case 'minishogi':
      return [
        'rook',
        'bishop',
        'gold',
        'silver',
        'pawn',
        'dragon',
        'horse',
        'promotedsilver',
        'tokin',
        'king',
      ];
    case 'kyotoshogi':
      return ['rook', 'pawn', 'silver', 'bishop', 'gold', 'knight', 'lance', 'tokin', 'king'];
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
    case 'chushogi':
      return [];
    case 'minishogi':
      return ['rook', 'bishop', 'gold', 'silver', 'pawn'];
    case 'kyotoshogi':
      return ['tokin', 'gold', 'silver', 'pawn'];
    default:
      return ['rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'];
  }
}

export function promotableRoles(rules: Rules): Role[] {
  switch (rules) {
    case 'chushogi':
      return [
        'pawn',
        'gobetween',
        'sidemover',
        'verticalmover',
        'rook',
        'bishop',
        'dragon',
        'horse',
        'elephant',
        'chariot',
        'tiger',
        'kirin',
        'phoenix',
        'lance',
        'leopard',
        'copper',
        'silver',
        'gold',
      ];
    case 'minishogi':
      return ['pawn', 'silver', 'bishop', 'rook'];
    case 'kyotoshogi':
      return ['rook', 'pawn', 'silver', 'bishop', 'gold', 'knight', 'lance', 'tokin'];
    default:
      return ['pawn', 'lance', 'knight', 'silver', 'bishop', 'rook'];
  }
}

export function fullSquareSet(rules: Rules): SquareSet {
  switch (rules) {
    case 'chushogi':
      return new SquareSet([
        0xfff0fff, 0xfff0fff, 0xfff0fff, 0xfff0fff, 0xfff0fff, 0xfff0fff, 0x0, 0x0,
      ]);
    case 'minishogi':
    case 'kyotoshogi':
      return new SquareSet([0x1f001f, 0x1f001f, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
    default:
      return new SquareSet([0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]);
  }
}

export function promote(rules: Rules): (role: Role) => Role | undefined {
  switch (rules) {
    case 'chushogi':
      return chuushogiPromote;
    case 'kyotoshogi':
      return kyotoPromote;
    default:
      return standardPromote;
  }
}

export function unpromote(rules: Rules): (role: Role) => Role | undefined {
  switch (rules) {
    case 'chushogi':
      return chuushogiUnpromote;
    case 'kyotoshogi':
      return kyotoPromote;
    default:
      return standardUnpromote;
  }
}

export function promotionZone(rules: Rules): (color: Color) => SquareSet {
  switch (rules) {
    case 'chushogi':
      return (color: Color) =>
        color === 'sente'
          ? new SquareSet([0xfff0fff, 0xfff0fff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
          : new SquareSet([0x0, 0x0, 0x0, 0x0, 0xfff0fff, 0xfff0fff, 0x0, 0x0]);
    case 'minishogi':
      return (color: Color) =>
        color === 'sente'
          ? new SquareSet([0x1f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
          : new SquareSet([0x0, 0x0, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
    case 'kyotoshogi':
      return () => new SquareSet([0x1f001f, 0x1f001f, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0]);
    default:
      return (color: Color) =>
        color === 'sente'
          ? new SquareSet([0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
          : new SquareSet([0x0, 0x0, 0x0, 0x1ff01ff, 0x1ff, 0x0, 0x0, 0x0]);
  }
}

export function dimensions(rules: Rules): Dimensions {
  switch (rules) {
    case 'chushogi':
      return { files: 12, ranks: 12 };
    case 'minishogi':
    case 'kyotoshogi':
      return { files: 5, ranks: 5 };
    default:
      return { files: 9, ranks: 9 };
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
      return;
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
      return;
  }
}

function chuushogiPromote(role: Role): Role | undefined {
  switch (role) {
    case 'pawn':
      return 'promotedpawn';
    case 'gobetween':
      return 'elephantpromoted';
    case 'sidemover':
      return 'boar';
    case 'verticalmover':
      return 'ox';
    case 'rook':
      return 'dragonpromoted';
    case 'bishop':
      return 'horsepromoted';
    case 'dragon':
      return 'eagle';
    case 'horse':
      return 'falcon';
    case 'elephant':
      return 'prince';
    case 'chariot':
      return 'whale';
    case 'tiger':
      return 'stag';
    case 'kirin':
      return 'lionpromoted';
    case 'phoenix':
      return 'queenpromoted';
    case 'lance':
      return 'whitehorse';
    case 'leopard':
      return 'bishoppromoted';
    case 'copper':
      return 'sidemoverpromoted';
    case 'silver':
      return 'verticalmoverpromoted';
    case 'gold':
      return 'rookpromoted';
    default:
      return;
  }
}

function chuushogiUnpromote(role: Role): Role | undefined {
  switch (role) {
    case 'promotedpawn':
      return 'pawn';
    case 'elephantpromoted':
      return 'gobetween';
    case 'boar':
      return 'sidemover';
    case 'ox':
      return 'verticalmover';
    case 'dragonpromoted':
      return 'rook';
    case 'horsepromoted':
      return 'bishop';
    case 'eagle':
      return 'dragon';
    case 'falcon':
      return 'horse';
    case 'prince':
      return 'elephant';
    case 'whale':
      return 'chariot';
    case 'stag':
      return 'tiger';
    case 'lionpromoted':
      return 'kirin';
    case 'queenpromoted':
      return 'phoenix';
    case 'whitehorse':
      return 'lance';
    case 'bishoppromoted':
      return 'leopard';
    case 'sidemoverpromoted':
      return 'copper';
    case 'verticalmoverpromoted':
      return 'silver';
    case 'rookpromoted':
      return 'gold';
    default:
      return;
  }
}

function kyotoPromote(role: Role): Role | undefined {
  switch (role) {
    case 'rook':
      return 'pawn';
    case 'pawn':
      return 'rook';
    case 'silver':
      return 'bishop';
    case 'bishop':
      return 'silver';
    case 'gold':
      return 'knight';
    case 'knight':
      return 'gold';
    case 'tokin':
      return 'lance';
    case 'lance':
      return 'tokin';
    default:
      return;
  }
}
