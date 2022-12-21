import { Board } from '../src/board';
import { Hands } from '../src/hands';
import { initialSfen, makeBoardSfen, makeSfen, parseSfen } from '../src/sfen';
import { parseSquare } from '../src/util';
import { defaultPosition } from '../src/variant/variant';

test('make board sfen', () => {
  expect(makeBoardSfen('standard', defaultPosition('standard').board)).toEqual(initialSfen('standard').split(' ')[0]);
  expect(makeBoardSfen('standard', Board.empty())).toEqual('9/9/9/9/9/9/9/9/9');
});

test('make initial sfen', () => {
  expect(makeSfen(defaultPosition('standard'))).toEqual(initialSfen('standard'));
});

test('parse initial sfen', () => {
  const pos = parseSfen('standard', initialSfen('standard')).unwrap();
  expect(pos.board).toEqual(defaultPosition('standard').board);
  expect(pos.hands).toEqual(Hands.empty());
  expect(pos.turn).toEqual('sente');
  expect(pos.moveNumber).toEqual(1);
});

test('partial sfen', () => {
  const pos = parseSfen('standard', initialSfen('standard').split(' ')[0]).unwrap();
  expect(pos.board).toEqual(defaultPosition('standard').board);
  expect(pos.hands).toEqual(Hands.empty());
  expect(pos.turn).toEqual('sente');
  expect(pos.moveNumber).toEqual(1);
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
  const pos = parseSfen('standard', sfen).unwrap();
  expect(makeSfen(pos)).toEqual(sfen);
});

test('minishogi sfen', () => {
  const pos = parseSfen('minishogi', 'rbsgk/4p/5/P4/KGSBR b - 1').unwrap();
  expect(pos).toEqual(defaultPosition('minishogi'));
  expect(makeBoardSfen('minishogi', pos.board)).toEqual('rbsgk/4p/5/P4/KGSBR');
  expect(makeBoardSfen('minishogi', defaultPosition('minishogi').board)).toEqual('rbsgk/4p/5/P4/KGSBR');
  expect(makeSfen(pos)).toEqual(initialSfen('minishogi'));
});

test('chushogi sfen', () => {
  const pos = parseSfen(
    'chushogi',
    'lfcsgekgscfl/a1b1txot1b1a/mvrhdqndhrvm/pppppppppppp/3i4i3/12/12/3I4I3/PPPPPPPPPPPP/MVRHDNQDHRVM/A1B1TOXT1B1A/LFCSGKEGSCFL b - 1'
  ).unwrap();
  expect(pos).toEqual(defaultPosition('chushogi'));
  expect(makeSfen(pos)).toEqual(initialSfen('chushogi'));

  const pos2 = parseSfen(
    'chushogi',
    'lfcsgekgscfl/a1b1txot1b1a/mvrhdqndhrvm/pppppppppppp/3i4i3/12/12/3I4I3/PPPPPPPPPPPP/MVRHDNQDHRVM/A1B1TOXT1B1A/LFCSGKEGSCFL b 5e 1'
  ).unwrap();
  expect(pos2.lastMove).toEqual({ to: parseSquare('5e') });
  expect(pos2.lastLionCapture).toEqual(parseSquare('5e'));

  const pos3 = parseSfen(
    'chushogi',
    '+l+f+c+s+g+ek+g+s+c+f+l/+a1+b1+t+x+o+t1+b1+a/+m+v+r+h+dqn+d+h+r+v+m/+p+p+p+p+p+p+p+p+p+p+p+p/3+i4+i3/12/12/3+I4+I3/+P+P+P+P+P+P+P+P+P+P+P+P/+M+V+R+H+DNQ+D+H+R+V+M/+A1+B1+T+O+X+T1+B1+A/+L+F+C+S+GK+E+G+S+C+F+L b - 1'
  ).unwrap();
  expect(makeSfen(pos3)).toEqual(
    '+l+f+c+s+g+ek+g+s+c+f+l/+a1+b1+t+x+o+t1+b1+a/+m+v+r+h+dqn+d+h+r+v+m/+p+p+p+p+p+p+p+p+p+p+p+p/3+i4+i3/12/12/3+I4+I3/+P+P+P+P+P+P+P+P+P+P+P+P/+M+V+R+H+DNQ+D+H+R+V+M/+A1+B1+T+O+X+T1+B1+A/+L+F+C+S+GK+E+G+S+C+F+L b - 1'
  );
});
