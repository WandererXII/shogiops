# shogiops

[![Test](https://github.com/WandererXII/shogiops/workflows/Test/badge.svg)](https://github.com/WandererXII/shogiops/actions)
[![npm](https://img.shields.io/npm/v/shogiops)](https://www.npmjs.com/package/shogiops)

Shogi and operations in TypeScript forked from [chessops](https://github.com/niklasf/chessops), rewritten for shogi.

## Features

- Read and write SFEN
- Vocabulary (Square, SquareSet, Color, Role, Piece, Board, Position)
- Shogi
  - Move/drop making
  - Legal move and drop move generation
  - Game end and outcome
  - Setup validation
- Attacks and rays using hyperbola quintessence
- Read and write USI, Japanese, Western and Kitao-Kawasaki notation
- Read and write KIF and CSA notation
- Currently supported variants - shogi, minishogi, chushogi, annan shogi and kyoto shogi.
- [Compatibility with shogiground](https://github.com/WandererXII/shogiground)
- [Compatibility with lishogi](https://lishogi.org)

[File an issue](https://github.com/WandererXII/shogiops/issues/new) to request more or report a bug.

## Example

Test directory has a lot of examples and use-cases.

```typescript
import { Shogi } from 'shogiops/shogi';
import { parseUsi } from 'shogiops/util';

const pos = Shogi.default();
const usi = parseUsi('7g7f')!;
pos.play(usi);
```

## License

shogiops is licensed under the GNU General Public License 3 or any later
version at your choice. See LICENSE.txt for details.
