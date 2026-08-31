## ADDED Requirements

### Requirement: Each bush exposes an independent non-blocking combat collider
Every reactive bush placement SHALL expose one axis-aligned combat collider fitted to its visible vulnerable body. The center of that combat collider SHALL be the bush's authoritative X/Y interaction point and SHALL determine its interaction grid cell. The combat collider SHALL identify the bush as a damageable target but SHALL NOT block character movement, projectile movement, or autonomous navigation. It SHALL remain distinct from the existing character-entry sensor and SHALL be unavailable after the bush begins dying.

#### Scenario: Character walks through a bush
- **WHEN** a character movement collider crosses a living bush's combat collider and sensor
- **THEN** movement remains unblocked and the existing sensor behavior operates independently

#### Scenario: Combat diagnostics are enabled
- **WHEN** collider diagnostics display a living bush
- **THEN** its combat collider is visibly distinguishable from its non-blocking character-entry sensor

#### Scenario: Authored bush anchor differs from combat center
- **WHEN** a bush's authored sprite anchor and combat-collider center resolve to different grid cells
- **THEN** targeting and adjacency use the combat-collider center cell

#### Scenario: Bush begins dying
- **WHEN** a bush enters its death animation
- **THEN** it no longer exposes an attackable combat collider or accepts new damage

### Requirement: Destructible bush state remains placement-local
Each bush placement SHALL independently own its health-facing runtime state, active fire playback, dying state, and removal lifecycle without changing another placement that uses the same authored tileset definition.

#### Scenario: One of two bushes is damaged
- **WHEN** a goblin damages one of two living bush placements
- **THEN** only the struck placement changes health or plays its gameplay fire effect

#### Scenario: One bush is removed
- **WHEN** one bush completes its death animation
- **THEN** only that placement and its gameplay effect resources are removed

### Requirement: Bush combat authoring is validated
The reusable bush authoring contract SHALL provide valid combat-collider geometry in addition to its existing sensor geometry. Validation SHALL identify missing, invalid, or blocking combat geometry without reclassifying the bush as a movement obstacle.

#### Scenario: Bush combat geometry is missing
- **WHEN** a damageable bush definition has no valid combat collider
- **THEN** validation identifies the affected bush definition and missing collider role
