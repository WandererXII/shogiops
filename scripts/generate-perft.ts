import type { Position } from '../src/position/position.js';
import { dimensions, pieceCanPromote } from '../src/position/util.js';
import { initialSfen, makeSfen, parseSfen } from '../src/sfen.js';
import type { DropMove, MoveOrDrop, NormalMove } from '../src/types.js';
import { parsePieceName } from '../src/util.js';
import { perft } from '../test/debug.js';

const targetVariant = 'dobutsu';
const perftDepth = 1;

function getRandomMoveOrDrop(pos: Position): MoveOrDrop | undefined {
  if (Math.random() < 0.75) return getRandomMove(pos) || getRandomDrop(pos);
  else return getRandomDrop(pos) || getRandomMove(pos);
}

function getRandomMove(pos: Position): NormalMove | undefined {
  const moveDests = pos.allMoveDests();
  const origs = Array.from(moveDests.keys()).filter((sq) => moveDests.get(sq)?.nonEmpty());
  const randomOrig = origs[Math.floor(Math.random() * origs.length)];
  const piece = pos.board.get(randomOrig);
  const rDests = moveDests.get(randomOrig);

  if (rDests) {
    const dests = Array.from(rDests);
    const randomDest = dests[Math.floor(Math.random() * dests.length)];
    const capture = pos.board.get(randomDest);

    if (randomDest !== undefined)
      return {
        from: randomOrig,
        to: randomDest,
        promotion: pieceCanPromote(targetVariant)(piece!, randomOrig, randomDest, capture),
      };
  }
  return;
}

function getRandomDrop(pos: Position): DropMove | undefined {
  const dropDests = pos.allDropDests();
  const pieces = Array.from(dropDests.keys()).filter((sq) => dropDests.get(sq)?.nonEmpty());
  const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
  const rDests = dropDests.get(randomPiece);
  if (rDests) {
    const dests = Array.from(rDests);
    const randomDest = dests[Math.floor(Math.random() * dests.length)];

    if (randomDest !== undefined)
      return {
        role: parsePieceName(randomPiece).role,
        to: randomDest,
      };
  }
  return;
}

function main() {
  let typescript = '';
  let scala = '';
  let dart = '';

  const existing = new Set();
  for (let j = 0; j < 300; j++) {
    let pos = parseSfen(targetVariant, initialSfen(targetVariant)).unwrap();

    const dims = dimensions(targetVariant);
    const chosen = Math.floor(
      Math.random() * dims.files * dims.ranks + (dims.files + dims.ranks) * 2,
    );

    for (let i = 0; i <= chosen; i++) {
      const clone = pos.clone();

      const move = getRandomMoveOrDrop(pos);
      if (move) clone.play(move);

      const chosenNow = !move || clone.isEnd() || i === chosen;

      if (chosenNow) {
        const sfen = makeSfen(pos);
        if (!existing.has(sfen)) {
          existing.add(sfen);
          const perftRes = perft(pos, perftDepth);
          typescript += `['${sfen}', ${perftDepth}, ${perftRes}],\n`;
          scala += `("${sfen}", "${perftRes}"),\n`;
          dart += `('${sfen}', ${perftDepth}, ${perftRes}),\n`;
          break;
        }
      } else {
        pos = clone;
      }
    }
  }
  console.log('\ntypescript');
  console.log(typescript);
  console.log('\nscala');
  console.log(scala);
  console.log('\ndart');
  console.log(dart);
}

main();
