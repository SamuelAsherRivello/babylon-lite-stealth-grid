# tiled-spawner-authoring Specification

## Purpose
Make Tiled the authoritative, designer-visible source for which supported spawners a level contains and where each one creates its actors.

## Requirements

### Requirement: Three reusable spawner items
The Tiled project SHALL expose named, placeable Player Spawner, Sheep Spawner, and Enemy Spawner items. Every placement SHALL use one custom `type` property as its complete gameplay metadata. Player and Sheep SHALL use `PLAYER` and `SHEEP`; Enemy SHALL default to `GOBLIN` and allow `WARRIOR`. Babylon SHALL derive role, character, population counts, check interval, and initial-population behavior from that value.

#### Scenario: Designer selects the spawner palette
- **WHEN** the designer opens the project and inspects the spawner authoring collection
- **THEN** Player Spawner, Sheep Spawner, and Enemy Spawner are separately named and placeable

#### Scenario: Designer places a spawner item
- **WHEN** the designer places one of the three items on the designated spawner object layer
- **THEN** Tiled creates an independently selectable and movable object carrying only its `type` custom property

### Requirement: Recognizable editor representation
Each spawner item and placement SHALL have a visible editor-only representation that identifies its character type without affecting runtime rendering. A temporary text or simple icon representation SHALL satisfy this requirement; matching the corresponding small black-and-white in-game marker is optional visual polish.

#### Scenario: Spawners are distinguished on the map
- **WHEN** the designer views a map containing all three spawner items in Tiled
- **THEN** the editor representations make the Player, Sheep, and Enemy placements distinguishable

### Requirement: Authored placement is authoritative
The runtime SHALL create supported spawners from the loaded map's valid spawner objects and SHALL NOT unconditionally append hardcoded Player, Sheep, or Enemy spawners. Sheep and Enemy are optional; each valid authored object SHALL preserve its position and use the Babylon catalog defaults selected by its `type` value.

#### Scenario: Map contains the three spawner roles
- **WHEN** a level contains one valid Player, Sheep, and Enemy spawner placement
- **THEN** the runtime creates exactly those three spawners and no hardcoded duplicates

#### Scenario: Map omits a spawner type
- **WHEN** a level has no Sheep Spawner placement
- **THEN** the runtime creates no sheep spawner for that level

#### Scenario: Map contains multiple supported non-player spawners
- **WHEN** a level contains multiple valid Sheep or Enemy spawner objects
- **THEN** the runtime creates one independently owned spawner for every authored object

### Requirement: Positions follow the level coordinate contract
The system SHALL convert every authored spawner object's Tiled position into the existing origin-relative game grid and world-position contract. Moving a placement to a different map cell SHALL change the runtime spawn position to that cell without a source-code edit.

#### Scenario: Designer moves a spawner
- **WHEN** the designer moves a valid spawner item to a different map cell and saves the map
- **THEN** the loaded spawner reports that origin-relative game cell and creates actors at its corresponding runtime position

### Requirement: Authored spawner data is validated
The loader SHALL accept only `PLAYER`, `SHEEP`, `GOBLIN`, and `WARRIOR` spawner `type` values with finite positions. Every level SHALL contain exactly one `PLAYER` spawner because the current game supports one player-input owner. A level with zero or multiple Player Spawners SHALL fail with the exact error `Invalid Level Format: Must contain 1 Player Spawner`. Other malformed placements SHALL fail with an actionable error rather than silently receiving a hardcoded placement.

#### Scenario: Unsupported character is authored
- **WHEN** a spawner placement names a character identity the runtime does not support
- **THEN** level loading fails with an error that identifies the invalid spawner and character

#### Scenario: Player spawner is missing
- **WHEN** a level contains no Player Spawner
- **THEN** level loading fails with `Invalid Level Format: Must contain 1 Player Spawner`

#### Scenario: Multiple player spawners are authored
- **WHEN** a level contains more than one Player Spawner
- **THEN** level loading fails with `Invalid Level Format: Must contain 1 Player Spawner`

### Requirement: Existing level migration preserves intended spawners
Level01 SHALL explicitly contain exactly one Player Spawner, one Sheep Spawner, one Enemy Spawner selecting Goblin, and one Enemy Spawner selecting Warrior at authored locations chosen for the current map.

#### Scenario: Migrated primary level loads
- **WHEN** the primary level is loaded after hardcoded fallback removal
- **THEN** its authored Player, Sheep, Goblin enemy, and Warrior enemy placements produce exactly four runtime spawners using catalog population defaults

#### Scenario: Existing Warrior placement is present
- **WHEN** the map also contains a supported enemy spawner whose character identity is Warrior
- **THEN** it remains a distinct authored spawner and is not converted into or replaced by the Goblin palette item

### Requirement: Authored placement metadata
Spawner placements SHALL carry or receive defaults for actor identity, spawn mode, and maximum distance. Spawn mode SHALL be `nearby` or `anywhere-walkable`, and maximum distance SHALL be a non-negative integer measured in grid cells.

#### Scenario: Placement metadata is normalized
- **WHEN** a valid spawner placement is loaded
- **THEN** its normalized data exposes spawn mode and maximum distance alongside its actor identity

#### Scenario: Invalid placement metadata is rejected
- **WHEN** a placement contains an unsupported mode or malformed maximum distance
- **THEN** loading fails with an object-specific actionable error
