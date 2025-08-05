# Changelog for shogiops

## v0.19.0

- Removed barrel file (index.ts).
- Replaced enums used to hold error values with objects.
- `validate` now checks for double pawns in strict mode for variant where rule applies
- `usiToSquareNames` now accepts `undefined` usi param.
- Removed generated documentation.

## v0.18.0

- All files now use hyphen in file names instead of camelCase e.g. (file `squareSet.ts` is now `square-set.ts`). Update your imports.
- Added new notation system - Yorozuya. Compatible with variants of board size 12x12 (currently all of them).
- Files are now compiled into `/dist/` directory.

## v0.17.0

- When creating notation illegal moves are now also considered - changes notation output.
- Moved `kif` and `csa` to `notation` directory directly.
- Added `scalashogiCharPair` function.
- Files are now compiled into `/esm/` directory.
- `.d.ts.map` is now generated for every file.

## v0.16.3

- Fixed `chushogi` bug where second move of falcon/eagle was not respecting the lion recapture rule.

## v0.16.2

- Fixed `chushogi` bug where non-Lion double movers making a mid-step Lion capture was not preventing Lion counterstrike.

## v0.16.1

- Fixed `annanshogi` move generation.

## v0.16.0

- Renamed `Move` to `MoveOrDrop`, later `NormalMove` will be renamed to `Move` and `DropMove` to just `Drop`.
- `isNormal` was renamed to `isMove`.
- `lastMove` in `Position` and `Setup` was renamed to `lastMoveOrDrop`.
- Many functions containing the word 'move' were renamed to include the word 'drop', such as changing `makeWesternMove` to `makeWesternMoveOrDrop`.

## v0.15.1

- Fix recognizing pawn drop checkmate for `checkshogi`.
- Bump dependencies.

## v0.15.0

- New variant - `checkshogi`.
- Result `kinglost` changed to `kingslost` - used for chushogi.

## v0.14.4

- Fix a bug in annan shogi move generation.

## v0.14.3

- Accept lowercase CSA pieces.
- Allow underscores and multiple spaces in SFEN.

## v0.14.2

- Fix parsing USI drop with tokin - kyotoshogi

## v0.14.1

- Kyotoshogi fixes and tweaks - kif, notation, promotion, usi requires promotion now.
- In kif add variant name tag for variants from custom positions.
- Uwate/shitate in kif for games from handicap positions.

## v0.14.0

- New variant - `kyotoshogi`.
- Renamed `annan` to `annanshogi` and `Annan` to `Annanshogi`.

## v0.13.0

- Added `handicaps`, `findHandicaps`, `findHandicap` and `isHandicap` in file `handicaps.ts` for various variants, replaces `kif/kifHandicaps.ts`, which was removed.
- Varioud changes/fixes for kif of non-standard positions - hard to find any _standardized_ way of handling this.

## v0.12.0

- Add new variant support Annan shogi.
- Rename `makeHand` and `makeHands` to `makeHandSfen` and `makeHandsSfen` respectively.
- Rename `makeSquare` to `makeSquareName`.
- Rename `parseSquare` to `parseSquareName`.
- No longer validate impossible check position (`ERR_IMPOSSIBLE_CHECK`), these positions are now considered valid, they can't happen in a real game, but no reason to prevent them altogether.

## v0.11.0

- Remove `lastCapture` and replace it with `lastLionCapture` that takes into account only lion captures by non-lion pieces.
- Fix jitto being considered a capture.
- Make lastMove and lastLionCapture in setup optional.

## v0.10.3

- Fix `moveToSquareNames` to include midStep if it's present.

## v0.10.2

- `makeKifHeader` returns empty string for default chushogi position.
- Remove '平手' from `handicapNameToSfen`
- Change default minishogi kif handicap name to '5 五将棋'.
- Rename `checkSquareName` to `checksSquareNames`.
- Kif chushogi format tweaked - smaller.

## v0.10.1

- Fix exported files in `package.json`
- Support for chushogi kif header and moves

## v0.10.0

- Chushogi support added.
- Files moved around - new variant directory, also reorganized and tweaked variant hierarchy.
- In strict mode while parsing sfen both sides have to have a royal piece.
- Drop dests for shogiground are now always return all pieces as keys, you can't select only one piece.
- More specific variant types returned.
- Renamed notationUtil.ts -> util.ts.
- Renamed variantUtil.ts -> util.ts.
- Renamed hand.ts -> hands.ts.
- Reintroduce `Setup` in `initializePosition`.
- `pieceCanPromote` now requires another argument - `capture`.
- Renamed `pieceInDeadZone` to `pieceForcePromote`.
- Key of drop dests is now `PieceName`('sente rook') not role.
- Rename `fullmoves` to `moveNumber`.
- Rename `dests` to `moveDests`.
- Remove `variantEnd` and `variantOutcome`.
- Remove `backrank` and `secondBackrank` functions.
- `Map` used in `Board` instead of properties, use `board.role('role')` or `board.color('color')`.
- `Map` used in `Hands` instead of properties.
- Attack functions changed - check argument order.
- `roleToString` and `stringToRole` was removed, use functions in Sfen.
- New `Result` and `Outcome` types.

## v0.9.0

- Remove `isImpasse`, wasn't used, doesn't account for handicaps, and uses only a specific rule anyway - might not be what people expect.

## v0.8.0

- SFEN consts were removed, now use `initialSfen(rules)`.
- `promote` returns undefined for roles that can't be promoted.
- `unpromote` returns undefined for roles that can't be unpromoted.

## v0.7.0

- Remove `Setup`, use `Position` instead. `ParseSfen` and similar functions now require rules as the first parameter.
- Remove `dimensions` from `Board`.
- Rename rules 'shogi' to 'standard'.
- Rewrite `Squareset` to support boards upto 16x16.
- Remove transform functions.
- Remove `scalaShogiCharPair`.
- Switch from CommonJS to ES Module.
- Changelog started.
