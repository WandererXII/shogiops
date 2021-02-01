# shogiops - WIP

[![Test](https://github.com/WandererXII/shogiops/workflows/Test/badge.svg)](https://github.com/WandererXII/shogiops/actions)

Shogi and operations in TypeScript forked from [chessops](https://github.com/niklasf/chessops).

## Features

- Read and write SFEN
- Vocabulary (Square, SquareSet, Color, Role, Piece, Board, Castles, Setup,
  Position)
- Shogi
  - Move making
  - Legal move and drop move generation
  - Game end and outcome
  - Setup validation
- Attacks and rays using hyperbola quintessence
- Read and write USI move notation
- [Compatibility with lishogi](https://lishogi.org)
- [Compatibility with shogiground](https://github.com/WandererXII/shogiground)

#### Not yet supported fully:

- [Position hashing](https://niklasf.github.io/chessops/modules/_hash_.html)
- [Transformations](https://niklasf.github.io/chessops/modules/_transform_.html): Mirroring and rotating

[File an issue](https://github.com/WandererXII/shogiops/issues/new) to request more.

## Example

Look into test directory for more examples.

```javascript
import { parseUsi } from 'shogi/util';
import { Shogi } from 'shogiops/shogi';

const pos = Shogi.default(setup).unwrap();
pos.play(parseUsi('7g7f')!);
```

## License

shogiops is licensed under the GNU General Public License 3 or any later
version at your choice. See LICENSE.txt for details.
