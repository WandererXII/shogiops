# shogiops

[![lishogi.org](https://img.shields.io/badge/☗_lishogi.org-Play_shogi-black)](https://lishogi.org)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/WandererXII/shogiops/test.yml?label=test)
[![npm](https://img.shields.io/npm/v/shogiops?logo=npm)](https://www.npmjs.com/package/shogiops)

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
import { initialSfen, parseSfen } from 'shogiops/sfen';
import type { Rules } from 'shogiops/types';
import { parseUsi } from 'shogiops/util';

const rules: Rules = 'standard';
const sfen = initialSfen(rules);
const pos = parseSfen(rules, sfen).unwrap(); // or handle errors
const usi = parseUsi('7g7f')!;
pos.play(usi);
```

## License

shogiops is licensed under the GNU General Public License 3 or any later
version at your choice. See LICENSE.txt for details.
