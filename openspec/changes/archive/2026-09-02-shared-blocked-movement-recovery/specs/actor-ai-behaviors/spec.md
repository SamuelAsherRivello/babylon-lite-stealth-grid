## MODIFIED Requirements

### Requirement: Autonomous movement uses shared obstacle-aware navigation
Route-based autonomous movement SHALL use cardinally adjacent grid cells, remain within the logical grid, and exclude any cell that cannot contain the controlled actor's collider without overlapping terrain or a blocking dynamic collider. The route SHALL move smoothly through cell-center waypoints. Selection and execution SHALL use compatible current terrain, active blocking-actor occupancy, and collider-clearance rules, excluding the controlled actor itself and inactive entities. Every segment SHALL be traversable from the actual position, not merely clear at its endpoint. If a remaining segment becomes blocked, the actor SHALL stop safely and enter shared movement recovery. When an enemy follows a cardinal horizontal segment, its movement-collider center SHALL remain aligned toward the center of its current logical row; when it follows a cardinal vertical segment, its movement-collider center SHALL remain aligned toward the center of its current logical column. Alignment correction SHALL preserve forward movement and SHALL respect the same terrain, bounds, and dynamic-collider constraints.

#### Scenario: Direct route is blocked
- **WHEN** a reachable destination requires turning around non-walkable terrain
- **THEN** the route follows safe cardinal cells around the obstruction

#### Scenario: Dynamic blocker invalidates movement
- **WHEN** a dynamic non-permitted collider blocks the actor's next waypoint after planning
- **THEN** the actor stops before overlap and discards the failed route and selects a safe alternative through shared movement recovery

#### Scenario: Enemy moves vertically
- **WHEN** an enemy has a non-zero vertical movement intent
- **THEN** its movement-collider center moves vertically while its X coordinate is corrected toward the center of its current grid column

#### Scenario: Enemy moves horizontally
- **WHEN** an enemy has a non-zero horizontal movement intent
- **THEN** its movement-collider center moves horizontally while its Y coordinate is corrected toward the center of its current grid row

#### Scenario: Enemy changes movement axis
- **WHEN** an enemy stops or changes from horizontal to vertical movement, or from vertical to horizontal movement
- **THEN** the previous orthogonal correction is discarded and a new correction is based on the enemy's current cell without teleporting or bypassing collision constraints

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

### Requirement: Sheep preserves stimulus-driven frightened behavior
The sheep SHALL remain idle until a configured frightening living entity enters its inclusive fear distance. The initial sheep SHALL treat both living players and living enemies as frightening. It SHALL enter `bouncing`, remain stationary for the complete bounce animation, enter `running` only when a safe flee route exists, and enter `cooldown` after reaching the route end. A failed active flee route SHALL enter shared movement recovery. Its normal route SHALL increase separation from the triggering threat using the configured flee-distance range; when these preferences admit no escape, recovery SHALL allow any safe one-cell alternative. Initial route-selection failure SHALL use the same safe fallback after the complete bounce animation.

#### Scenario: No threat is nearby
- **WHEN** no configured frightening living entity is within the sheep's fear distance
- **THEN** the sheep remains idle regardless of elapsed idle time

#### Scenario: Threat enters range
- **WHEN** a configured frightening living entity enters range while the sheep is idle
- **THEN** the sheep plays one complete bounce before following a safe route away from that entity, or a safe recovery escape if no preferred flee route exists

#### Scenario: Enemy threatens initial sheep
- **WHEN** a living enemy enters the initial sheep's fear distance while the sheep is idle
- **THEN** the sheep begins its frightened response

### Requirement: Sheep has a short post-flee cooldown
Each sheep SHALL have a configurable post-flee cooldown during which it remains stationary and ignores frightening entities. The initial sheep SHALL use a one-second cooldown. An interrupted flee route SHALL use shared recovery before post-flee cooldown; a temporary recovery wait SHALL NOT be treated as completed fleeing. When the cooldown elapses, the sheep SHALL return to `idle` and resume threat evaluation, allowing nearby attackers a short opportunity to catch it.

#### Scenario: Threat remains nearby after fleeing
- **WHEN** the sheep finishes a flee route or recovery escape while a frightening entity remains in range
- **THEN** it remains stationary without starting another bounce for one second

#### Scenario: Cooldown completes
- **WHEN** the configured post-flee cooldown elapses during active gameplay
- **THEN** the sheep returns to idle and may react to any currently nearby frightening entity

## ADDED Requirements

### Requirement: Autonomous actors recover from failed movement
Every autonomous enemy and NPC SHALL share blocked-movement recovery for all locomotion policies. A rejected next segment SHALL trigger recovery by the next eligible decision update. When movement is requested and permitted but the actor makes no meaningful progress toward its waypoint for one second of active gameplay, it SHALL stop, discard that route, and select a currently safe alternative. Sub-cell jitter or oscillation SHALL NOT indefinitely reset progress detection. Recovery SHALL NOT move a human-controlled player automatically.

#### Scenario: Goblin remains at the reported corner
- **WHEN** a goblin attempts patrol or bush-approach movement around spot (0, 12) without meaningful progress for one active second
- **THEN** it abandons the failed route and begins a safe alternative when one is available

#### Scenario: Intentional stop is not a stall
- **WHEN** an actor is idle, attacking, bouncing, in intentional cooldown, dead, paused, or under movement-locking knockback
- **THEN** the movement-stall timer does not accumulate and recovery does not interrupt that state

#### Scenario: Repeated tiny motion does not conceal failure
- **WHEN** an actor jitters or oscillates without meaningful progress toward its waypoint for one active second
- **THEN** recovery triggers despite nonzero instantaneous movement

### Requirement: Recovery selects available escape destinations
Recovery SHALL first consider safe alternatives compatible with the actor's normal policy, then a reachable cardinal one-cell escape if no preferred alternative exists. Recovery SHALL relax patrol distance, home-radius, and flee-separation preferences when necessary to escape, while always preserving world boundaries and collision constraints. A failed segment SHALL be excluded for the current recovery decision and SHALL remain ineligible until revalidation shows it can be traversed. Candidate selection SHALL use bounded search and injected randomness for deterministic tests. Future movement SHALL be revalidated as occupancy changes.

#### Scenario: Only one exit is available
- **WHEN** an actor has only one safe exit, even if it is a reverse direction or violates normal movement preferences
- **THEN** recovery selects that exit instead of repeatedly selecting the blocked direction or waiting for a longer route

#### Scenario: Endpoint is clear but the segment is obstructed
- **WHEN** a destination cell is empty but the actor cannot traverse the connecting segment with its actual collider
- **THEN** the destination is not selected through that segment

#### Scenario: Another actor enters a selected route
- **WHEN** a living blocking actor occupies the next segment after selection
- **THEN** the moving actor stops safely, revalidates occupancy, and chooses another available route without overlap

### Requirement: Enclosed actors wait and retry
If bounded recovery search finds no safe alternative, the actor SHALL stop movement and retry after a configurable positive interval, initially three seconds of active gameplay. Each retry SHALL use fresh occupancy and reachability. Repeated enclosure SHALL produce repeated bounded waits rather than per-frame route searches. Death or replacement of the actor SHALL cancel pending recovery; an eligible higher-priority behavior SHALL supersede a pending movement retry.

#### Scenario: Exit opens during enclosure
- **WHEN** a blocking actor leaves the only exit while the enclosed actor waits
- **THEN** the next scheduled retry selects the now-available exit and resumes movement

#### Scenario: Enclosure persists
- **WHEN** all exits remain blocked at a retry
- **THEN** the actor remains stationary and schedules another three-second active-time wait

#### Scenario: Pause during recovery wait
- **WHEN** gameplay is paused for longer than the retry interval
- **THEN** no retry occurs until the remaining active gameplay interval elapses after resuming

### Requirement: Movement recovery is observable
Development diagnostics SHALL expose each autonomous actor's identity, world position, authoritative spot, movement intent, waypoint or destination, recovery state, last recovery reason, elapsed no-progress time, and retry countdown. Diagnostic retention SHALL be bounded and observation SHALL NOT alter gameplay decisions.

#### Scenario: Sample a blocked actor
- **WHEN** development diagnostics sample an actor repeatedly during a stall and recovery
- **THEN** samples distinguish attempted movement, detected failure, selected escape, and waiting with no available exit


### Requirement: Autonomous actors spawn at available positions
Autonomous enemy and NPC spawners SHALL validate terrain clearance and current living-actor occupancy before creating an actor, including exact initial placement. A valid authored position SHALL remain unchanged. If the authored position is blocked, the spawner SHALL select the nearest available grid-cell center by Manhattan distance, with stable row then column tie-breaking. If no cell is available, it SHALL defer creation until a later active-time spawn check. It SHALL NOT relocate an already active actor or change a human-controlled player's authored placement.

#### Scenario: Goblin authored inside terrain
- **WHEN** the goblin's authored spawn at (0, 12) intersects its terrain collider
- **THEN** the goblin is created at the nearest available cell center with no terrain or living-actor overlap

#### Scenario: All spawn positions are occupied
- **WHEN** an autonomous spawn is due and no available cell exists
- **THEN** no actor is created and a later spawn check reevaluates current availability

#### Scenario: Valid exact spawn
- **WHEN** the authored autonomous spawn is available
- **THEN** its initial placement remains at that position
