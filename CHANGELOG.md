# Changelog for shogiops

## v0.8.0

- SFEN consts were removed, now use `initialSfen(rules)`
- `promote` returns undefined for roles that can't be promoted
- `unpromote` returns undefined for roles that can't be unpromoted

## v0.7.0

- Remove `Setup`, use `Position` instead. `ParseSfen` and similar functions now require rules as the first parameter.
- Remove `dimensions` from `Board`
- Rename rules 'shogi' to 'standard'.
- Rewrite `Squareset` to support boards upto 16x16.
- Remove transform functions.
- Remove `scalaShogiCharPair`.
- Switch from CommonJS to ES Module.
- Changelog started.
