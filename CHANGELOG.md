# Changelog for shogiops

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
