import { parseFen, makeFen, makeBoardFen, INITIAL_FEN, INITIAL_BOARD_FEN, EMPTY_BOARD_FEN } from '../src/fen';
import { Board } from '../src/board';
import { defaultSetup, Material } from '../src/setup';

test('make board fen', () => {
  expect(makeBoardFen(Board.default())).toEqual(INITIAL_BOARD_FEN);
  expect(makeBoardFen(Board.empty())).toEqual(EMPTY_BOARD_FEN);
});

test('make initial fen', () => {
  expect(makeFen(defaultSetup())).toEqual(INITIAL_FEN);
});

test('parse initial fen', () => {
  const setup = parseFen(INITIAL_FEN).unwrap();
  expect(setup.board).toEqual(Board.default());
  expect(setup.pockets).toEqual(Material.empty());
  expect(setup.turn).toEqual('black');
  expect(setup.fullmoves).toEqual(1);
});

test('partial fen', () => {
  const setup = parseFen(INITIAL_BOARD_FEN).unwrap();
  expect(setup.board).toEqual(Board.default());
  expect(setup.pockets).toEqual(Material.empty());
  expect(setup.turn).toEqual('black');
  expect(setup.fullmoves).toEqual(1);
});

test.each([
  'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b RG4P2b2s3p 143',
  'lnsgkgsnl/1r5b1/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  'lnsgkgsnl/1r5b1/p+pppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  '+lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5+R1/+L+N+SGKGSNL b - 1',
  '8l/1l+R2P3/p2pBG1pp/kps1p4/Nn1P2G2/P1P1P2PP/1PS6/1KSG3+r1/LN2+p3L w Sbgn3p 124',
  'lnsgkgsnl/9/9/9/9/9/9/9/LNSGKGSNL b - 10',
])('parse and make fen', fen => {
  const setup = parseFen(fen).unwrap();
  expect(makeFen(setup)).toEqual(fen);
});
