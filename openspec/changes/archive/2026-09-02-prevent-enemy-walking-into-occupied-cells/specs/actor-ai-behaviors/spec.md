## MODIFIED Requirements

### Requirement: Enemy alternates between idle and patrol decisions
An enemy with no attackable target in range SHALL remain idle for a randomly selected duration within its configured inclusive idle range, then SHALL choose a reachable patrol destination within its configured inclusive path-distance range and spawn-centered home radius. The initial goblin SHALL use a home radius of four grid cells, equivalent to 256 pixels on the current 64-pixel grid. It SHALL enter `walking` while following the safe route and SHALL return to `idle` to choose a new duration after arriving. Failure to obtain or continue a route SHALL invoke shared movement recovery, whose escape fallback takes precedence over normal patrol distance and home-radius preferences. Before each patrol step, it SHALL evaluate the next grid cell using current terrain and character occupancy. Terrain and living enemy occupancy SHALL make a cell invalid. A cell containing only the player or only a bush SHALL remain valid; a cell containing both the player and a bush SHALL be invalid. If the player-only cell is entered, the enemy SHALL attack on the following AI update. If every neighboring cell is invalid, the enemy SHALL remain stationary.

#### Scenario: Idle timer expires
- **WHEN** the enemy's selected idle duration elapses and no attackable target is in range
- **THEN** the enemy chooses a reachable walkable patrol destination and starts walking toward it

#### Scenario: Patrol destination is reached
- **WHEN** the enemy reaches the last waypoint of its patrol route
- **THEN** it stops, enters idle, and selects a new idle duration before making another patrol decision

#### Scenario: No patrol destination is reachable
- **WHEN** no valid destination exists in the configured patrol-distance range
- **THEN** the enemy tries a safe one-cell escape outside normal patrol preferences and waits for the recovery retry interval only if no safe alternative is available

#### Scenario: Reachable destination is outside home radius
- **WHEN** a walkable patrol candidate is more than four grid cells from the initial goblin's spawn cell
- **THEN** the candidate is excluded from normal patrol destinations, but a safe escape step outside the home radius remains eligible during blocked-movement recovery

#### Scenario: Patrol next cell becomes occupied
- **WHEN** collision or occupancy checks reject the enemy's requested next cell during patrol
- **THEN** the enemy stops pursuing that cell and selects a different currently reachable cardinal direction without entering the occupied cell

#### Scenario: Player-only next cell
- **WHEN** the next grid cell contains the player and no bush
- **THEN** the enemy may enter the cell and attacks the player on the following AI update

#### Scenario: Player concealed by bush
- **WHEN** the next grid cell contains both the player and a living bush
- **THEN** the enemy treats the cell as invalid and does not enter it

#### Scenario: Bush-only next cell
- **WHEN** the next grid cell contains a bush but no player
- **THEN** the enemy treats the cell as walkable

#### Scenario: No valid neighboring cell
- **WHEN** terrain, living enemies, or concealed-player occupancy invalidate every neighboring cell
- **THEN** the enemy remains stationary until a valid neighboring cell becomes available
