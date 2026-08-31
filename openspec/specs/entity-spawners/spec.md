# Entity Spawners Specification

## Purpose

Provide reusable level spawn points that maintain configured actor populations independently from their optional diagnostic visualization.

## Requirements

### Requirement: Generic spawner configuration
The system SHALL represent each spawner as one spawn position, exactly one actor type, an inclusive minimum population, an inclusive maximum population, and a positive check interval measured in seconds. The default check interval SHALL be one second when no interval is supplied, and the minimum population SHALL NOT exceed the maximum population.

#### Scenario: Default interval
- **WHEN** a spawner is configured without a check interval
- **THEN** it checks its owned population every one second

#### Scenario: Configured interval
- **WHEN** a spawner is configured with a valid interval of N seconds
- **THEN** it checks its owned population every N seconds

#### Scenario: Invalid population range
- **WHEN** a spawner is configured with a negative population value or a minimum greater than its maximum
- **THEN** the system rejects the configuration with a clear error

### Requirement: Immediate initial evaluation
The system SHALL evaluate every spawner as part of level startup without waiting for its first periodic interval. The player spawner SHALL guarantee its single initial player. A non-player spawner below its minimum SHALL use the same randomized spawn decision as a periodic evaluation, so it can create zero or a batch without exceeding its maximum.

#### Scenario: Initial player is created immediately
- **WHEN** the level starts with an empty player spawner configured with minimum one and maximum one
- **THEN** one player exists at the spawner position before regular gameplay begins

#### Scenario: Non-player population can start gradually
- **WHEN** the level starts with an empty non-player spawner
- **THEN** its immediate randomized evaluation can create zero through its remaining capacity and later evaluations continue building the population

### Requirement: Randomized periodic population evaluation
The system SHALL evaluate each spawner's living owned population at its configured N-second interval. When the population is below minimum, the spawner SHALL make a random decision that can create zero through the remaining capacity, with smaller batches more likely than larger batches. Each evaluation SHALL be independent, SHALL NOT guarantee a spawn, and SHALL never raise the owned population above maximum. A population within or above the inclusive minimum-to-maximum range SHALL NOT cause spawning or automatic removal.

#### Scenario: Evaluation can defer replenishment
- **WHEN** a spawner is below minimum and its random decision selects zero at a scheduled evaluation
- **THEN** it creates no actor and evaluates again after another N seconds

#### Scenario: Evaluation creates a bounded batch
- **WHEN** a spawner with minimum two and maximum four has one living owned actor and its random decision selects two
- **THEN** it creates two actors at its configured position and its resulting population is three

#### Scenario: In-range population does not spawn
- **WHEN** a spawner's living owned population is between its configured minimum and maximum inclusive at a scheduled evaluation
- **THEN** it creates no actor during that check

#### Scenario: Above-maximum population is preserved
- **WHEN** external circumstances leave a spawner owning more actors than its configured maximum
- **THEN** it creates and removes no actors solely to enforce the configured range

#### Scenario: Marker visibility does not affect checks
- **WHEN** collider diagnostics and spawner markers are hidden
- **THEN** scheduled population checks and required spawning continue normally

### Requirement: Spawner-owned actor lifecycle
The system SHALL count only actors created by that specific spawner that have not completed removal. A defeated actor SHALL continue counting throughout its death animation and SHALL stop counting only after that animation completes and the actor is disposed.

#### Scenario: Dying actor still counts
- **WHEN** an owned actor has reached zero health but its death animation has not completed
- **THEN** the spawner includes it in current population at a scheduled evaluation

#### Scenario: Disposed actor no longer counts
- **WHEN** an owned actor's death animation completes and it is disposed before a scheduled evaluation
- **THEN** the spawner excludes it from current population and applies the randomized evaluation rule

#### Scenario: Actors are isolated by owner
- **WHEN** an actor of the same type exists but was created by another spawner
- **THEN** it does not count toward the current spawner's population

### Requirement: Initial hardcoded spawners
The system SHALL replace direct startup creation with a player spawner at the current player position configured as minimum one and maximum one, a sheep spawner at the current sheep position configured as minimum two and maximum two, and an enemy spawner at the current goblin position configured as minimum one and maximum one. Each SHALL initially use the default one-second check interval.

#### Scenario: Initial level evaluation
- **WHEN** the current hardcoded level starts
- **THEN** it immediately contains one player and immediately evaluates the sheep and goblin spawners for gradual randomized population

#### Scenario: Player remains unique
- **WHEN** the player spawner already owns one living player
- **THEN** subsequent checks do not create another player

### Requirement: Diagnostic spawner marker
The system SHALL give every spawner a permanent, non-animated, non-interactive visual marker in the grid cell containing its configured position. The marker SHALL use the corresponding actor's static idle appearance, center the marker artwork in that grid cell, render in grayscale black and white at 50% of the live actor's rendered width and height and 50% opacity, have no gameplay collider, and render beneath spawned actors.

#### Scenario: Marker identifies each spawner type
- **WHEN** collider diagnostics are enabled
- **THEN** the player, sheep, and enemy spawner grid cells display their corresponding static grayscale actor markers centered in the cell at 50% opacity

#### Scenario: Spawned actor appears over its marker
- **WHEN** a spawner creates an actor at its position while diagnostics are enabled
- **THEN** the live full-size actor renders on top of the half-size marker

#### Scenario: Marker is not interactive
- **WHEN** an actor, projectile, pointer, or movement query crosses a marker
- **THEN** the marker does not block, collide, receive input, or otherwise affect gameplay

### Requirement: Marker visibility follows collider diagnostics
The system SHALL use the existing collider diagnostic setting as the sole visibility control for spawner markers.

#### Scenario: Collider diagnostics enabled
- **WHEN** the existing collider diagnostic setting changes to enabled
- **THEN** all spawner markers become visible

#### Scenario: Collider diagnostics disabled
- **WHEN** the existing collider diagnostic setting changes to disabled
- **THEN** all spawner markers become hidden while the spawners continue population maintenance

