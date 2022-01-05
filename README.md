# shogiops

[![Test](https://github.com/WandererXII/shogiops/workflows/Test/badge.svg)](https://github.com/WandererXII/shogiops/actions)

Shogi and operations in TypeScript forked from [chessops](https://github.com/niklasf/chessops).

## Features

- Read and write SFEN
- Vocabulary (Square, SquareSet, Color, Role, Piece, Board, Setup, Position)
- Shogi
  - Move making
  - Legal move and drop move generation
  - Game end and outcome
  - Setup validation
- Attacks and rays using hyperbola quintessence
- Read and write USI move notation
- Read and write KIF notation
- Read and write CSA notation
- Write various move notations
- [Compatibility with lishogi](https://lishogi.org)
- [Compatibility with shogiground](https://github.com/WandererXII/lishogi/tree/master/ui/shogiground)

#### Not yet fully supported:

- Position hashing

[File an issue](https://github.com/WandererXII/shogiops/issues/new) to request more or report a bug.

## Example

Test directory has a lot of examples.

```javascript
import { parseUsi } from 'shogiops/util';
import { Shogi } from 'shogiops/shogi';

const pos = Shogi.default();
const move = parseUsi('7g7f')!;
pos.play(move);
```

## License

shogiops is licensed under the GNU General Public License 3 or any later
version at your choice. See LICENSE.txt for details.
