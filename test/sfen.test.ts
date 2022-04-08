import { parseSfen, makeSfen, makeBoardSfen, INITIAL_SFEN, INITIAL_BOARD_SFEN, EMPTY_BOARD_SFEN } from '../src/sfen';
import { Board } from '../src/board';
import { defaultSetup } from '../src/setup';
import { defaultPosition, setupPosition } from '../src/variant';
import { Hands } from '../src/hand';

test('make board sfen', () => {
  expect(makeBoardSfen(Board.default())).toEqual(INITIAL_BOARD_SFEN);
  expect(makeBoardSfen(Board.empty({ files: 9, ranks: 9 }))).toEqual(EMPTY_BOARD_SFEN);
});

test('make initial sfen', () => {
  expect(makeSfen(defaultSetup())).toEqual(INITIAL_SFEN);
});

test('parse initial sfen', () => {
  const setup = parseSfen(INITIAL_SFEN).unwrap();
  expect(setup.board).toEqual(Board.default());
  expect(setup.hands).toEqual(Hands.empty());
  expect(setup.turn).toEqual('sente');
  expect(setup.fullmoves).toEqual(1);
});

test('partial sfen', () => {
  const setup = parseSfen(INITIAL_BOARD_SFEN).unwrap();
  expect(setup.board).toEqual(Board.default());
  expect(setup.hands).toEqual(Hands.empty());
  expect(setup.turn).toEqual('sente');
  expect(setup.fullmoves).toEqual(1);
});

test.each([
  'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b RG4P2b2s3p 143',
  'lnsgkgsnl/1r5b1/9/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  'lnsgkgsnl/1r5b1/p+pppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1',
  '+lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5+R1/+L+N+SGKGSNL b - 1',
  '8l/1l+R2P3/p2pBG1pp/kps1p4/Nn1P2G2/P1P1P2PP/1PS6/1KSG3+r1/LN2+p3L w Sbgn3p 124',
  'lnsgkgsnl/9/9/9/9/9/9/9/LNSGKGSNL b - 10',
  'lnsgkgsnl/9/9/9/9/9/9/9/LNSGKGSNL b 15p 10',
  'lnsgkgsnl/9/9/9/9/9/9/9/LNSGKGSNL b 10p 10',
  'lnsgkgsnl/9/9/9/9/9/9/9/LNSGKGSNL b 15R10P10p 10',
])('parse and make sfen', sfen => {
  const setup = parseSfen(sfen).unwrap();
  expect(makeSfen(setup)).toEqual(sfen);
});

test('minishogi sfen', () => {
  const setup = parseSfen('rbsgk/4p/5/P4/KGSBR b - 1').unwrap();
  expect(setupPosition('minishogi', setup).unwrap()).toEqual(defaultPosition('minishogi'));
  expect(makeBoardSfen(defaultPosition('minishogi').board)).toEqual('rbsgk/4p/5/P4/KGSBR');
  expect(makeBoardSfen(setup.board)).toEqual('rbsgk/4p/5/P4/KGSBR');
});
