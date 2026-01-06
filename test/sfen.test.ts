import { expect, test } from 'vitest';
import { Board } from '@/board.js';
import { RULES } from '@/constants.js';
import { Hands } from '@/hands.js';
import { initialSfen, makeBoardSfen, makeSfen, parseSfen } from '@/sfen.js';
import { parseSquareName } from '@/util.js';
import { IllegalSetup } from '@/variant/position.js';

test.each(RULES)('rules - parse sfen and back', (rules) => {
  const pos = parseSfen(rules, initialSfen(rules), false).unwrap();
  expect(makeSfen(pos)).toBe(initialSfen(rules));
});

test('make board sfen', () => {
  expect(makeBoardSfen('standard', Board.empty())).toEqual('9/9/9/9/9/9/9/9/9');
});

test('parse initial sfen', () => {
  const pos = parseSfen('standard', initialSfen('standard'), true).unwrap();
  expect(pos.hands).toEqual(Hands.empty());
  expect(pos.turn).toEqual('sente');
  expect(pos.moveNumber).toEqual(1);
});

test('partial sfen', () => {
  const partialSfen = initialSfen('standard').split(' ')[0];
  const pos = parseSfen('standard', partialSfen, true).unwrap();
  const remadePartialSfen = makeSfen(pos).split(' ')[0];
  expect(remadePartialSfen).toBe(partialSfen);
  expect(pos.hands).toEqual(Hands.empty());
  expect(pos.turn).toEqual('sente');
  expect(pos.moveNumber).toEqual(1);
  expect(parseSfen('standard', 'lnsgkgsnl/9/9/9/9/9/9/9/LNSGKGSNL b - ', true).isOk).toBe(true);
});

test('invalid sfen', () => {
  const pos = parseSfen(
    'standard',
    'lnsgkgsnl/1r5b1/ppppppppp/9/9/8P/PPPPPPP1P/1B5R1/LNSGKGSNL b - 1',
    true,
  );
  expect(pos.isErr).toBe(true);
  expect(pos.isErr ? pos.error.message : undefined).toBe(IllegalSetup.InvalidPiecesDoublePawns);
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
])('parse and make sfen', (sfen) => {
  const pos = parseSfen('standard', sfen, true).unwrap();
  expect(makeSfen(pos)).toEqual(sfen);
});

test('minishogi sfen', () => {
  const pos = parseSfen('minishogi', 'rbsgk/4p/5/P4/KGSBR b - 1', true).unwrap();
  expect(makeBoardSfen('minishogi', pos.board)).toEqual('rbsgk/4p/5/P4/KGSBR');
  expect(makeSfen(pos)).toEqual(initialSfen('minishogi'));
});

test('chushogi sfen', () => {
  const pos = parseSfen(
    'chushogi',
    'lfcsgekgscfl/a1b1txot1b1a/mvrhdqndhrvm/pppppppppppp/3i4i3/12/12/3I4I3/PPPPPPPPPPPP/MVRHDNQDHRVM/A1B1TOXT1B1A/LFCSGKEGSCFL b 5e 1',
    true,
  ).unwrap();
  expect(pos.lastMoveOrDrop).toEqual({ to: parseSquareName('5e') });
  expect(pos.lastLionCapture).toEqual(parseSquareName('5e'));

  const pos2 = parseSfen(
    'chushogi',
    '+l+f+c+s+g+ek+g+s+c+f+l/+a1+b1+t+x+o+t1+b1+a/+m+v+r+h+dqn+d+h+r+v+m/+p+p+p+p+p+p+p+p+p+p+p+p/3+i4+i3/12/12/3+I4+I3/+P+P+P+P+P+P+P+P+P+P+P+P/+M+V+R+H+DNQ+D+H+R+V+M/+A1+B1+T+O+X+T1+B1+A/+L+F+C+S+GK+E+G+S+C+F+L b - 1',
    true,
  ).unwrap();
  expect(makeSfen(pos2)).toEqual(
    '+l+f+c+s+g+ek+g+s+c+f+l/+a1+b1+t+x+o+t1+b1+a/+m+v+r+h+dqn+d+h+r+v+m/+p+p+p+p+p+p+p+p+p+p+p+p/3+i4+i3/12/12/3+I4+I3/+P+P+P+P+P+P+P+P+P+P+P+P/+M+V+R+H+DNQ+D+H+R+V+M/+A1+B1+T+O+X+T1+B1+A/+L+F+C+S+GK+E+G+S+C+F+L b - 1',
  );

  expect(parseSfen('chushogi', '12/12/7k3p/12/7K4/12/12/9+E2/12/3X8/12/12 b', true).isOk).toBe(
    true,
  );
  expect(parseSfen('chushogi', '12/12/7k3p/12/7K4/12/12/9K2/12/3X3+E4/12/12 b', true).isOk).toBe(
    false,
  );
});
