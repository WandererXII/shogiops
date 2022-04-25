# shogiops

[![Test](https://github.com/WandererXII/shogiops/workflows/Test/badge.svg)](https://github.com/WandererXII/shogiops/actions)
[![npm](https://img.shields.io/npm/v/shogiops)](https://www.npmjs.com/package/shogiground)

Shogi and operations in TypeScript forked from [chessops](https://github.com/niklasf/chessops), rewritten for shogi.

## Features

- Read and write SFEN
- Vocabulary (Square, SquareSet, Color, Role, Piece, Board, Position)
- Shogi
  - Move making
  - Legal move and drop move generation
  - Game end and outcome
  - Setup validation
- Attacks and rays using hyperbola quintessence
- Read and write USI, Japanese, Western and Kitao-Kawasaki move notation
- Read and write KIF and CSA notation
- Currently two variants supported - shogi, minishogi. More to come later!
- [Compatibility with lishogi](https://lishogi.org)
- [Compatibility with shogiground](https://github.com/WandererXII/shogiground)

[File an issue](https://github.com/WandererXII/shogiops/issues/new) to request more or report a bug.

## Example

Test directory has a lot of examples and use-cases.

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
