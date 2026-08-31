## MODIFIED Requirements

### Requirement: Three reusable spawner items
The Tiled project SHALL expose named, placeable Player Spawner, Sheep Spawner, and Enemy Spawner items. Every placement SHALL use gameplay metadata identifying its actor/item identity, spawn mode, and maximum distance in addition to its type. Player and Sheep SHALL use `PLAYER` and `SHEEP`; Enemy SHALL default to `GOBLIN` and allow `WARRIOR`. Babylon SHALL derive role, character, population counts, check interval, initial-population behavior, spawn mode, and maximum distance from the authored metadata and catalog defaults.

#### Scenario: Designer selects the spawner palette
- **WHEN** the designer opens the project and inspects the spawner authoring collection
- **THEN** Player Spawner, Sheep Spawner, and Enemy Spawner are separately named and placeable with valid placement defaults

#### Scenario: Designer places a spawner item
- **WHEN** the designer places a spawner item on the designated spawner object layer
- **THEN** Tiled creates an independently selectable and movable object carrying valid actor identity, spawn mode, and maximum-distance metadata

### Requirement: Authored spawner data is validated
The loader SHALL accept only supported actor identities and the spawn modes `nearby` and `anywhere-walkable`, with finite positions and non-negative integer maximum distances. Every level SHALL contain exactly one `PLAYER` spawner because the current game supports one player-input owner. A level with zero or multiple Player Spawners SHALL fail with the exact error `Invalid Level Format: Must contain 1 Player Spawner`. Other malformed placements SHALL fail with an actionable error rather than silently receiving a hardcoded placement.

#### Scenario: Unsupported spawn mode is authored
- **WHEN** a spawner placement names a mode other than `nearby` or `anywhere-walkable`
- **THEN** level loading fails with an error that identifies the invalid spawner and mode

#### Scenario: Invalid maximum distance is authored
- **WHEN** a spawner placement names a negative, non-integer, or non-finite maximum distance
- **THEN** level loading fails with an error that identifies the invalid spawner and distance

#### Scenario: Unsupported character is authored
- **WHEN** a spawner placement names a character identity the runtime does not support
- **THEN** level loading fails with an error that identifies the invalid spawner and character

#### Scenario: Player spawner is missing
- **WHEN** a level contains no Player Spawner
- **THEN** level loading fails with `Invalid Level Format: Must contain 1 Player Spawner`

#### Scenario: Multiple player spawners are authored
- **WHEN** a level contains more than one Player Spawner
- **THEN** level loading fails with `Invalid Level Format: Must contain 1 Player Spawner`
