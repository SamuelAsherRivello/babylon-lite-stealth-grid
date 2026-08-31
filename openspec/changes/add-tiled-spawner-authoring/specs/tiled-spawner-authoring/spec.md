## Purpose

Make Tiled the authoritative, designer-visible source for which supported spawners a level contains and where each one creates its actors.

## ADDED Requirements

### Requirement: Three reusable spawner items
The Tiled project SHALL expose named, placeable Player Spawner, Sheep Spawner, and Goblin Spawner items. Each item SHALL carry stable defaults for the corresponding existing runtime spawner role, character identity, minimum count, maximum count, and initial-population behavior.

#### Scenario: Designer selects the spawner palette
- **WHEN** the designer opens the project and inspects the spawner authoring collection
- **THEN** Player Spawner, Sheep Spawner, and Goblin Spawner are separately named and placeable

#### Scenario: Designer places a spawner item
- **WHEN** the designer places one of the three items on the designated spawner object layer
- **THEN** Tiled creates an independently selectable and movable object carrying that item's complete spawner defaults

### Requirement: Recognizable editor representation
Each spawner item and placement SHALL have a visible editor-only representation that identifies its character type without affecting runtime rendering. A temporary text or simple icon representation SHALL satisfy this requirement; matching the corresponding small black-and-white in-game marker is optional visual polish.

#### Scenario: Spawners are distinguished on the map
- **WHEN** the designer views a map containing all three spawner items in Tiled
- **THEN** the editor representations make the Player, Sheep, and Goblin placements distinguishable

### Requirement: Authored placement is authoritative
The runtime SHALL create supported spawners from the loaded map's valid spawner objects and SHALL NOT unconditionally append hardcoded Player, Sheep, or Goblin spawners. Omitting a spawner item SHALL omit that spawner from the level, and each valid authored object SHALL preserve its own position and configuration.

#### Scenario: Map contains the three existing spawners
- **WHEN** a level contains one valid Player, Sheep, and Goblin spawner placement
- **THEN** the runtime creates exactly those three spawners and no hardcoded duplicates

#### Scenario: Map omits a spawner type
- **WHEN** a level has no Sheep Spawner placement
- **THEN** the runtime creates no sheep spawner for that level

#### Scenario: Map contains multiple supported non-player spawners
- **WHEN** a level contains multiple valid Sheep or Goblin spawner objects
- **THEN** the runtime creates one independently owned spawner for every authored object

### Requirement: Positions follow the level coordinate contract
The system SHALL convert every authored spawner object's Tiled position into the existing origin-relative game grid and world-position contract. Moving a placement to a different map cell SHALL change the runtime spawn position to that cell without a source-code edit.

#### Scenario: Designer moves a spawner
- **WHEN** the designer moves a valid spawner item to a different map cell and saves the map
- **THEN** the loaded spawner reports that origin-relative game cell and creates actors at its corresponding runtime position

### Requirement: Authored spawner data is validated
The loader SHALL accept only supported role and character combinations with finite positions, non-negative integer population bounds, a minimum not greater than the maximum, and valid initial-population settings. It SHALL reject malformed placements with an actionable error rather than silently replacing them with hardcoded defaults. The runtime SHALL reject more than one Player Spawner because the current game supports one player-input owner.

#### Scenario: Unsupported character is authored
- **WHEN** a spawner placement names a character identity the runtime does not support
- **THEN** level loading fails with an error that identifies the invalid spawner and character

#### Scenario: Population bounds are invalid
- **WHEN** a placement has a negative count or a minimum greater than its maximum
- **THEN** level loading fails with an error that identifies the invalid population configuration

#### Scenario: Multiple player spawners are authored
- **WHEN** a level contains more than one valid Player Spawner placement
- **THEN** level loading fails with an error explaining the single-player-spawner constraint

### Requirement: Existing level migration preserves intended spawners
The current primary level SHALL explicitly contain Player, Sheep, and Goblin spawner placements representing the positions and population settings previously supplied by hardcoded defaults. Other supported authored character identities SHALL continue to use the same normalized spawner contract.

#### Scenario: Migrated primary level loads
- **WHEN** the primary level is loaded after hardcoded fallback removal
- **THEN** its authored Player, Sheep, and Goblin placements produce the intended existing spawner configurations

#### Scenario: Existing Warrior placement is present
- **WHEN** the map also contains a supported enemy spawner whose character identity is Warrior
- **THEN** it remains a distinct authored spawner and is not converted into or replaced by the Goblin palette item
