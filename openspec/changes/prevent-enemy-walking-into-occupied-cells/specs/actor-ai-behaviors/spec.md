## MODIFIED Requirements

### Requirement: Enemy alternates between idle and patrol decisions
An enemy with no attackable target in range SHALL remain idle for a randomly selected duration within its configured inclusive idle range, then SHALL choose a reachable patrol destination within its configured inclusive path-distance range and spawn-centered home radius. The initial goblin SHALL use a home radius of four grid cells, equivalent to 256 pixels on the current 64-pixel grid. It SHALL enter `walking` while following the safe route and SHALL return to `idle` to choose a new duration after arriving, failing to obtain or continue a route, or detecting that its requested next cell is blocked. When a requested next cell is blocked, the enemy SHALL stop pursuing that cell and choose a different reachable cardinal direction rather than repeatedly issuing the blocked movement intent.

#### Scenario: Idle timer expires
- **WHEN** the enemy's selected idle duration elapses and no attackable target is in range
- **THEN** the enemy chooses a reachable walkable patrol destination and starts walking toward it

#### Scenario: Patrol destination is reached
- **WHEN** the enemy reaches the last waypoint of its patrol route
- **THEN** it stops, enters idle, and selects a new idle duration before making another patrol decision

#### Scenario: No patrol destination is reachable
- **WHEN** no valid destination exists in the configured patrol-distance range
- **THEN** the enemy remains in or returns to idle and waits for another decision interval without entering blocked terrain

#### Scenario: Reachable destination is outside home radius
- **WHEN** a walkable patrol candidate is more than four grid cells from the initial goblin's spawn cell
- **THEN** the candidate is excluded from its patrol destinations

#### Scenario: Patrol next cell becomes occupied
- **WHEN** collision or occupancy checks reject the enemy's requested next cell during patrol
- **THEN** the enemy stops pursuing that cell and selects a different reachable cardinal direction without entering the occupied cell
