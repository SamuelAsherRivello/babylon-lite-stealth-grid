## Purpose

Provides one observable spatial contract so every character occupies, renders within, and interacts with a grid cell consistently while retaining distinct behavior and skeletal proportions.

## ADDED Requirements

### Requirement: Grid-centered character placement
Runtime characters MUST use the quantized center of their level grid cell as their logical center. The movement collider center MUST coincide with that logical center.

#### Scenario: Character spawned from a level spawner
- **WHEN** a character is created from a quantized spawner
- **THEN** its logical position and movement-circle center are at the center of the spawner's grid cell

### Requirement: Consistent artwork alignment
Character artwork MUST be aligned through the shared spatial contract so that an art offset of `{ x: 0, y: 0 }` places the artwork bottom at the bottom edge of the occupied grid cell. Character-specific art offsets MUST remain supported as explicit skeletal overrides.

#### Scenario: Default artwork alignment
- **WHEN** a character uses the default art offset
- **THEN** its visible artwork is bottom-aligned to the bottom of its grid cell

#### Scenario: Skeletal artwork override
- **WHEN** a character definition supplies a non-default art offset
- **THEN** the shared transform applies that offset without changing the logical grid-center position

### Requirement: Character-specific movement geometry
The movement collider MUST be generated from the character definition and MUST support per-character skeletal differences, including movement-circle radius or shape, without changing the logical center.

#### Scenario: Characters with different body radii
- **WHEN** two characters occupy the same grid cell with different movement-collider radii
- **THEN** both movement colliders are centered on the same cell center while retaining their distinct radii

### Requirement: Universal combat geometry
The combat collider MUST be a rectangle whose width and height equal one grid cell and whose bottom edge is aligned to the bottom of that cell. The system MUST NOT introduce a combat-collider scale override in this change.

#### Scenario: Combat collider placement
- **WHEN** a character is placed in a grid cell
- **THEN** its combat collider is one grid cell in size and bottom-aligned to that cell

### Requirement: Shared actor lifecycle with unique behavior
All runtime characters MUST use the shared actor lifecycle for sprite creation, transform updates, animation lifecycle, visual effects, diagnostics, and disposal. Character-specific behavior MUST remain independently definable.

#### Scenario: Character-specific behavior
- **WHEN** characters perform distinct actions such as healing, guarding, fleeing, attacking, or ranged firing
- **THEN** those behaviors remain character-specific while spatial and sprite lifecycle behavior follows the shared actor contract

### Requirement: Consistent spatial consumers
Grid occupancy, render-depth ordering, collider diagnostics, spawn/death scaling, and perception position reads MUST consume the same logical position and character definition used by the actor runtime.

#### Scenario: Diagnostic agreement
- **WHEN** diagnostics display a character's center and colliders
- **THEN** the displayed center, movement collider, combat collider, grid cell, and artwork alignment all correspond to the same logical cell placement

### Requirement: Player terminology without asset renaming
Code-facing character identity MUST use `Player` rather than `Pawn` where the terminology refers to the playable character. Art filenames and their paths MUST remain unchanged.

#### Scenario: Player naming migration
- **WHEN** code, diagnostics, tests, or user-visible labels identify the playable character
- **THEN** they use `Player`, while existing art filenames remain intact
