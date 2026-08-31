# reactive-terrain-decorations Specification

## Purpose

Define how terrain decorations are authored as individual Tiled objects and react independently to character entry with controlled, non-blocking animation.

## Requirements

### Requirement: Single placeable Tiled decoration item
The system SHALL expose the Tiny Swords bush as one named, selectable decoration item that can be placed as a tile object on the designated Y-sorted props object layer. Each placement SHALL remain independently selectable, movable, duplicable, and configurable in Tiled.

#### Scenario: Designer places a bush
- **WHEN** the designer selects the bush item and places it on the Y-sorted props object layer
- **THEN** Tiled creates one independently editable tile object rather than painting the bush into a terrain tile layer

#### Scenario: Designer duplicates a bush
- **WHEN** the designer duplicates a placed bush object
- **THEN** the duplicate retains the bush class and defaults while remaining an independent map object

### Requirement: Repository-managed animation source
The bush item SHALL resolve to the supplied 1024 by 128 pixel spritesheet as eight ordered 128 by 128 runtime frames while presenting frame zero as its idle editor preview. The repository SHALL preserve the asset's source attribution.

#### Scenario: Bush asset is resolved
- **WHEN** a valid bush object is normalized from a saved map
- **THEN** its decoration definition exposes frames zero through seven in source order and identifies frame zero as idle

### Requirement: Reactive decoration class contract
Every reactive bush placement SHALL resolve to the reusable `ReactiveDecoration` class contract, including a character-entry trigger, one-shot playback, idle frame, reset behavior, rearm behavior, blocking classification, and sensor geometry. Placement properties SHALL be able to override declared class defaults without changing other instances.

#### Scenario: Class defaults are used
- **WHEN** a bush placement has no per-object behavior overrides
- **THEN** normalization supplies the `ReactiveDecoration` defaults declared by the project

#### Scenario: One placement overrides a default
- **WHEN** one bush object contains a supported property override
- **THEN** that object uses the override while other bush placements retain their own resolved values

### Requirement: Non-blocking character sensor
Each reactive bush SHALL expose a sensor around the lower central foliage footprint. The sensor SHALL detect supported player, NPC, and enemy character colliders without acting as a movement obstacle or projectile obstacle.

#### Scenario: Character crosses the sensor
- **WHEN** any living supported character collider changes from outside to overlapping an armed bush sensor
- **THEN** the bush receives one character-entry activation and the character's movement is not blocked

#### Scenario: Non-character crosses the sensor
- **WHEN** a projectile or an unclassified collider overlaps the bush sensor
- **THEN** the overlap does not activate the bush and does not block the overlapping object

### Requirement: One-shot animation and idle reset
An armed idle bush SHALL display frame zero. A character-entry activation SHALL play frames zero through seven once, in order and without looping or restarting during playback. Completion SHALL return the bush to frame zero.

#### Scenario: Armed bush is entered
- **WHEN** a supported character enters an armed idle bush sensor
- **THEN** the bush plays one complete zero-through-seven sequence without looping and returns to frame zero

#### Scenario: Another character enters during playback
- **WHEN** another supported character enters the same sensor while its bush animation is playing
- **THEN** the current playback continues without restarting or queuing another playback

### Requirement: Occupancy-based rearming
A triggered bush SHALL remain disarmed until its sensor contains no supported character colliders. Leaving the sensor SHALL not interrupt current playback. Once empty, the bush SHALL rearm, but it SHALL not start another animation until a later outside-to-inside character transition.

#### Scenario: Character remains inside after playback
- **WHEN** the one-shot animation completes while one or more supported characters still overlap the sensor
- **THEN** the bush returns to frame zero and remains disarmed

#### Scenario: Sensor becomes empty and is entered again
- **WHEN** all supported characters leave a triggered bush sensor and a supported character later enters it
- **THEN** the rearmed bush plays one new one-shot sequence

### Requirement: Independent decoration instances
Each placed reactive decoration SHALL own its animation, occupancy, armed, and playback state independently of every other placement.

#### Scenario: One of two bushes is entered
- **WHEN** a character overlaps the sensor of one placed bush but not a second bush
- **THEN** only the overlapped bush changes state or animates

### Requirement: Authored position and depth ordering
The runtime SHALL preserve each bush object's authored position and render it with Y-sorted props so that character overlap is ordered by the bush's ground-contact position rather than by its transparent frame bounds.

#### Scenario: Character walks behind and in front of a bush
- **WHEN** the character's ground-contact position moves from behind the bush to in front of it
- **THEN** the character and bush render in the corresponding back-to-front order without changing the sensor behavior

### Requirement: Actionable reactive-decoration validation
Validation SHALL reject or report actionable errors for reactive decoration objects with an unsupported layer, unresolved class, missing animation source, invalid frame dimensions or count, missing sensor geometry, blocking sensor classification, or unsupported trigger/playback values.

#### Scenario: Invalid bush object is validated
- **WHEN** a bush placement is missing its sensor or is placed on an unsupported layer
- **THEN** validation identifies the affected object and the invalid or missing contract field
