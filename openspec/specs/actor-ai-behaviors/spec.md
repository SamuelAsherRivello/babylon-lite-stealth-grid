# actor-ai-behaviors Specification

## Purpose
Defines reusable autonomous-actor decision and navigation behavior while allowing each NPC or enemy type to retain its own meaningful animation states and reactions.

## Requirements

### Requirement: Autonomous actors use explicit behavior states
Each autonomous actor SHALL expose an explicit current behavior state. Every behavior state SHALL select the animation associated with that state, and AI decisions or completion events SHALL be the only causes of state transitions.

#### Scenario: Decision changes actor state
- **WHEN** an idle actor's policy chooses a movement behavior
- **THEN** the actor enters its movement state and plays that state's animation

#### Scenario: State remains unchanged
- **WHEN** no decision trigger or completion event applies
- **THEN** the actor retains its current state and animation without restarting it

### Requirement: Shared AI world snapshots are actor-neutral
The AI system SHALL evaluate an actor-neutral world snapshot containing active gameplay time, the controlled actor's position and grid cell, living perceived entities with stable type identifiers, and current walkability blockers. A sheep or enemy policy SHALL consume that snapshot without depending directly on player, rendering, DOM, or main-loop internals.

#### Scenario: Dead target is omitted
- **WHEN** a player, sheep, or enemy is no longer living
- **THEN** AI policies do not perceive that entity as a threat or attack target

#### Scenario: Gameplay is paused
- **WHEN** active gameplay time does not advance
- **THEN** autonomous decision timers, route movement, and state completion do not advance

### Requirement: Random decisions are configurable and deterministic under test
Idle-duration ranges, path-distance ranges, target tie-breaking, and destination tie-breaking SHALL accept an injected random source and SHALL validate configured inclusive bounds.

#### Scenario: Lower random endpoint is selected
- **WHEN** deterministic randomness selects the lower endpoint of a configured range
- **THEN** the actor uses the configured minimum value

#### Scenario: Invalid range is supplied
- **WHEN** a minimum duration or distance is greater than its maximum
- **THEN** actor AI creation fails with a configuration error

### Requirement: Autonomous movement uses shared obstacle-aware navigation
Route-based autonomous movement SHALL use cardinally adjacent grid cells, remain within the logical grid, and exclude any cell that cannot contain the controlled actor's collider without overlapping terrain or a blocking dynamic collider. The route SHALL move smoothly through cell-center waypoints and SHALL stop safely if a remaining segment becomes blocked.

#### Scenario: Direct route is blocked
- **WHEN** a reachable destination requires turning around non-walkable terrain
- **THEN** the route follows safe cardinal cells around the obstruction

#### Scenario: Dynamic blocker invalidates movement
- **WHEN** a dynamic non-permitted collider blocks the actor's next waypoint after planning
- **THEN** the actor stops before overlap and returns control to its policy for a new decision

### Requirement: Sheep preserves stimulus-driven frightened behavior
The sheep SHALL remain idle until a configured frightening living entity enters its inclusive fear distance. The initial sheep SHALL treat both living players and living enemies as frightening. It SHALL enter `bouncing`, remain stationary for the complete bounce animation, enter `running` only when a safe flee route exists, and enter `cooldown` after reaching the route end or failing safely. Its route SHALL increase separation from the triggering threat using the configured flee-distance range.

#### Scenario: No threat is nearby
- **WHEN** no configured frightening living entity is within the sheep's fear distance
- **THEN** the sheep remains idle regardless of elapsed idle time

#### Scenario: Threat enters range
- **WHEN** a configured frightening living entity enters range while the sheep is idle
- **THEN** the sheep plays one complete bounce before following a safe route away from that entity

#### Scenario: Enemy threatens initial sheep
- **WHEN** a living enemy enters the initial sheep's fear distance while the sheep is idle
- **THEN** the sheep begins its frightened response

### Requirement: Sheep has a short post-flee cooldown
Each sheep SHALL have a configurable post-flee cooldown during which it remains stationary and ignores frightening entities. The initial sheep SHALL use a one-second cooldown. When the cooldown elapses, the sheep SHALL return to `idle` and resume threat evaluation, allowing nearby attackers a short opportunity to catch it.

#### Scenario: Threat remains nearby after fleeing
- **WHEN** the sheep finishes or safely abandons a flee route while a frightening entity remains in range
- **THEN** it remains stationary without starting another bounce for one second

#### Scenario: Cooldown completes
- **WHEN** the configured post-flee cooldown elapses during active gameplay
- **THEN** the sheep returns to idle and may react to any currently nearby frightening entity

### Requirement: Enemy alternates between idle and patrol decisions
An enemy with no attackable target in range SHALL remain idle for a randomly selected duration within its configured inclusive idle range, then SHALL choose a reachable patrol destination within its configured inclusive path-distance range and spawn-centered home radius. The initial goblin SHALL use a home radius of four grid cells, equivalent to 256 pixels on the current 64-pixel grid. It SHALL enter `walking` while following the safe route and SHALL return to `idle` to choose a new duration after arriving or failing to obtain or continue a route.

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

### Requirement: Enemy attacks only eligible nearby targets
The initial goblin SHALL consider living players and sheep attackable. It SHALL start an attack only when an attackable target is within its configured inclusive melee distance; elapsed time or patrol selection alone SHALL NOT start an attack. If multiple targets are in range, it SHALL choose the nearest target, using stable snapshot order to resolve equal distances.

#### Scenario: No target is in melee range
- **WHEN** neither a living player nor a living sheep is within the goblin's melee distance
- **THEN** the goblin does not start a swing attack

#### Scenario: Player enters melee range during patrol
- **WHEN** a living player becomes the nearest attackable target in melee range while the goblin is patrolling
- **THEN** the goblin stops route movement and starts one attack directed toward the player

#### Scenario: Sheep is the nearest target
- **WHEN** a living sheep is nearer than every other attackable entity within melee range
- **THEN** the goblin starts one attack directed toward the sheep

### Requirement: Enemy attacks are atomic and use a short recovery
When an enemy starts an attack, it SHALL lock movement, capture the selected target direction, and play exactly one directional attack animation without retargeting mid-swing. After the animation, it SHALL enter a configurable recovery state that locks movement and rejects attacks. The initial goblin SHALL recover for 0.75 seconds, then reevaluate the current world. A target remaining in range MAY cause another attack decision after recovery; a target that moved or died SHALL NOT be attacked based only on its stale snapshot.

#### Scenario: Target moves during swing
- **WHEN** the selected target changes position while an attack animation is playing
- **THEN** the current swing retains its starting direction and does not restart

#### Scenario: Attack animation completes
- **WHEN** the enemy finishes its one non-looping swing
- **THEN** it enters recovery without moving or starting another attack

#### Scenario: Recovery completes
- **WHEN** the initial goblin has spent 0.75 active seconds recovering after its swing
- **THEN** it reevaluates living nearby targets before choosing another attack, idle, or patrol behavior

### Requirement: Policies can extend without changing the shared controller
The shared AI contract SHALL allow another actor type to define its own state set, perception filters, decision triggers, transition rules, and animation mapping while reusing timing, navigation, and waypoint movement services.

#### Scenario: New autonomous actor is added
- **WHEN** a developer adds an actor whose states differ from both sheep and goblin states
- **THEN** the actor can supply a new policy without adding those states to a universal shared state enum

### Requirement: Character grid occupancy and depth use the movement collider center
Every player-controlled or autonomous character SHALL use the center point of its current movement collider as the authoritative X/Y point for determining its logical grid cell. The same point's world Y coordinate SHALL determine that character's Y-sorted render depth. Artwork pivots, frame bounds, combat colliders, and raw actor positions SHALL NOT independently determine character grid occupancy or Y-sorted depth.

#### Scenario: Movement collider is offset from artwork position
- **WHEN** a character's movement-collider center and artwork position fall in different logical cells or produce different depth values
- **THEN** the character uses the movement-collider center for both its grid cell and Y-sorted render depth

#### Scenario: Character moves across a cell boundary
- **WHEN** the movement-collider center crosses a logical grid boundary
- **THEN** the character's occupied cell and Y-sorted render depth update from that center point

### Requirement: Goblin patrol decisions may select environmental mischief
At each new patrol decision, after resolving any eligible player or sheep attack, the initial goblin SHALL use its configured deterministic random source to select bush burning with a 25 percent probability. A failed roll SHALL continue normal patrol selection. Bush burning SHALL NOT interrupt an active attack, recovery, or patrol route.

#### Scenario: Mischief roll succeeds
- **WHEN** the goblin reaches a new patrol decision with no eligible player or sheep attack and the configured roll is below 0.25
- **THEN** it searches the entire logical map for a reachable living bush

#### Scenario: Mischief roll does not succeed
- **WHEN** the goblin reaches a new patrol decision and the configured roll is 0.25 or greater
- **THEN** it chooses its normal spawn-bounded patrol behavior without searching for a bush

#### Scenario: Combat target has priority
- **WHEN** an eligible player or sheep is in attack range at the same decision where bush burning could be selected
- **THEN** the goblin attacks that character without making a bush-burning roll

### Requirement: Goblin selects the nearest reachable living bush across the map
A goblin that selects bush burning SHALL consider every living bush on the logical map, regardless of its patrol home radius, and SHALL choose the bush with the shortest reachable cardinal route to a walkable cell adjacent to that bush. Stable bush snapshot order SHALL resolve equal route lengths. If no bush has a reachable adjacent cell, the goblin SHALL return to normal decision behavior.

#### Scenario: Distant bush is the only reachable target
- **WHEN** the only reachable living bush is outside the goblin's patrol home radius
- **THEN** the goblin routes toward an adjacent cell for that bush

#### Scenario: Nearest visible bush is unreachable
- **WHEN** one bush is geometrically nearer but has no reachable adjacent cell and another living bush has a reachable adjacent cell
- **THEN** the goblin selects the reachable bush

#### Scenario: No living bush is reachable
- **WHEN** the bush-burning search finds no living bush with a reachable adjacent cell
- **THEN** the goblin safely resumes normal decision behavior

### Requirement: Goblin attacks a selected bush from an adjacent grid cell
The goblin SHALL stop with its movement-collider center in the selected reachable cardinally adjacent cell, face the bush, and perform one atomic directional fire swing. Bush adjacency SHALL compare the goblin movement-collider center cell with the bush combat-collider center cell. After its normal recovery, it SHALL reevaluate character combat priority and the current bush snapshot before attacking the bush again. Multiple goblins SHALL be allowed to select the same bush without reserving it.

#### Scenario: Goblin reaches attack position
- **WHEN** a goblin reaches its selected cell adjacent to a living bush
- **THEN** it stops, faces the bush, and performs one fire swing without entering the bush's footprint

#### Scenario: Artwork appears close but collider-center cells are not adjacent
- **WHEN** the goblin and bush artwork overlap or appear close while their authoritative collider-center cells are diagonal, identical, or more than one cardinal cell apart
- **THEN** the goblin continues routing and does not start or land a bush attack

#### Scenario: Character becomes attackable during recovery
- **WHEN** a player or sheep becomes an eligible attack target after a bush swing
- **THEN** the goblin prioritizes the character instead of beginning another bush swing

#### Scenario: Selected bush is destroyed by another goblin
- **WHEN** the selected bush ceases to be living before the approaching or recovering goblin begins its next swing
- **THEN** that goblin abandons the stale target and resumes normal decision behavior
