## Purpose

Provides one universal, inspectable logical grid occupancy model for every active gameplay entity while preserving smooth continuous world movement for visual and collision geometry.

## ADDED Requirements

### Requirement: Every active gameplay entity has one logical grid spot
Every active gameplay entity with a world center SHALL have exactly one quantized logical grid spot derived from its live world center and the configured grid dimensions.

#### Scenario: Entity is initially placed
- **WHEN** mapping or spawning data assigns an entity to a grid spot
- **THEN** its live world center starts at the exact center of that grid spot

#### Scenario: Entity crosses a cell midpoint
- **WHEN** an entity's live center moves beyond halfway from its current grid center toward a neighboring grid spot
- **THEN** its logical grid spot changes to that neighboring spot

#### Scenario: Entity is exactly halfway
- **WHEN** an entity's live center is exactly halfway between its current and neighboring grid centers
- **THEN** it remains in its current logical grid spot until the position crosses the midpoint

### Requirement: Logical and continuous positions remain distinct
An entity's artwork, red combat collider, green movement collider, and other live physical geometry SHALL follow its continuous world center and SHALL NOT snap merely because its logical grid spot changes.

#### Scenario: Entity moves between cells
- **WHEN** an entity is partway through movement between two grid spots
- **THEN** its physical geometry remains interpolated while its logical spot independently reflects the quantized live center

### Requirement: One diagnostic X represents each active entity
When Collider diagnostics are enabled, every active gameplay entity SHALL render exactly one small black X at the center of its current logical grid spot.

#### Scenario: Multiple entities share a spot
- **WHEN** multiple active entities occupy the same logical grid spot
- **THEN** each entity contributes one X at that same cell center

#### Scenario: Entity becomes inactive
- **WHEN** an entity is dead, collected, destroyed, or removed from active gameplay
- **THEN** its X is no longer rendered

### Requirement: Grid occupancy is shared by gameplay systems
AI, perception, targeting, interaction, and other gameplay systems that require an entity's grid location SHALL consume the same logical grid spot used by diagnostics.

#### Scenario: Gameplay reads a moving entity
- **WHEN** a gameplay system queries an entity during sub-grid movement
- **THEN** it receives the entity's current quantized logical spot rather than a separately calculated cell
