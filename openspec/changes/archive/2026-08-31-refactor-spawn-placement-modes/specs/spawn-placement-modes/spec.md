## Purpose

Provides explicit, collision-safe placement rules for actors created by level spawners, including local-radius and level-wide walkable spawning.

## ADDED Requirements

### Requirement: Explicit spawn placement configuration
Every spawner SHALL identify the character/item it creates, a spawn mode of `nearby` or `anywhere-walkable`, and a non-negative maximum distance in grid cells. Nearby distance SHALL use Chebyshev distance from the spawner cell.

#### Scenario: Nearby configuration limits candidates
- **WHEN** a spawner uses `nearby` with maximum distance three
- **THEN** it considers only cells whose horizontal and vertical cell deltas from the spawner are each at most three

#### Scenario: Anywhere-walkable configuration spans the level
- **WHEN** a spawner uses `anywhere-walkable`
- **THEN** it considers walkable cells across the complete level rather than restricting candidates to the spawner radius

### Requirement: Spawn candidates are unoccupied
A candidate SHALL be rejected when the spawned character's movement collider overlaps terrain collision, a blocking object walk collider, the player movement collider, or any living character movement collider. Cells selected earlier in the same batch SHALL also be treated as occupied.

#### Scenario: Occupied candidate is skipped
- **WHEN** a candidate overlaps an existing player or character movement collider
- **THEN** the spawner does not create the actor at that candidate

#### Scenario: Batch candidates remain distinct
- **WHEN** one evaluation creates multiple actors
- **THEN** no two created actors occupy overlapping movement-collider space

#### Scenario: No candidate is available
- **WHEN** all candidates are occupied or non-walkable
- **THEN** the spawner creates no actor for the unavailable placement
