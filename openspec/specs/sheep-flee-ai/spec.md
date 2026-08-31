# sheep-flee-ai Specification

## Purpose
Defines how sheep detect configured frightening character types and flee across the walkable grid without crossing terrain collisions or map boundaries.

## Requirements

### Requirement: Configurable fear profile
Each sheep SHALL expose a fear profile containing an inclusive minimum scare distance in grid cells and a set of frightening character types. The frightening type set SHALL support `player`, `enemy`, or both. The initially spawned sheep SHALL use a scare distance of three grid cells and SHALL fear `player` only.

#### Scenario: Player enters the configured fear radius
- **WHEN** the sheep is idle and a player is within three grid cells horizontally, vertically, or diagonally
- **THEN** the sheep begins its frightened response

#### Scenario: Enemy is not enabled for the initial sheep
- **WHEN** an enemy is within three grid cells of the initially spawned sheep and no player is within that radius
- **THEN** the sheep remains idle

#### Scenario: Multiple frightening types are configured
- **WHEN** a sheep is configured to fear both `player` and `enemy`
- **THEN** either character type can trigger its frightened response while within the configured radius

### Requirement: Grid-square proximity detection
The sheep SHALL measure fear proximity using Chebyshev distance between the sheep's occupied grid cell and a character's occupied grid cell. A character SHALL be in range when the maximum absolute difference between their column and row is less than or equal to the configured scare distance.

#### Scenario: Diagonal boundary counts as in range
- **WHEN** the player is exactly three columns and three rows from a sheep configured with a scare distance of three
- **THEN** the player is considered in range

#### Scenario: Outside either grid axis is out of range
- **WHEN** the player is four columns and no more than three rows from a sheep configured with a scare distance of three
- **THEN** the player is not considered in range

### Requirement: Bounce-before-flee sequence
An idle sheep frightened by an in-range configured character SHALL play one complete bouncing animation before it starts moving. It SHALL remain stationary during the bounce and SHALL enter its running state only after the bounce lands.

#### Scenario: Frightened sheep completes its tell animation
- **WHEN** a configured frightening character enters the sheep's fear radius
- **THEN** the sheep plays the complete bounce animation without changing grid cells and starts its flee route after the final frame

### Requirement: Configurable random flee distance
Each sheep SHALL expose inclusive minimum and maximum flee distances measured in grid path steps. The initially spawned sheep SHALL use a minimum of one and a maximum of three. Each frightened response SHALL randomly choose an integer within that configured range before selecting a route.

#### Scenario: Initial sheep chooses a valid flee distance
- **WHEN** the initially spawned sheep finishes its frightened bounce
- **THEN** it chooses a flee path length of one, two, or three grid steps

#### Scenario: Configuration uses inclusive endpoints
- **WHEN** deterministic randomness selects the lower or upper endpoint
- **THEN** the chosen distance equals the configured minimum or maximum respectively

### Requirement: Flee route increases separation
The sheep SHALL select a route whose destination increases its grid-square distance from the character that triggered the response. For a chosen path length, it SHALL randomly select among safe destinations reachable in exactly that many cardinal grid steps that maximize separation from the triggering character. If no such route exists at the chosen length, it SHALL fall back to the longest shorter safe route that increases separation. If no safe route increases separation, it SHALL remain in place and return to idle.

#### Scenario: Multiple equally distant safe destinations exist
- **WHEN** more than one destination at the chosen path length is safe and maximizes separation from the triggering character
- **THEN** the sheep randomly chooses one of those destinations

#### Scenario: Requested distance is obstructed
- **WHEN** no safe route increases separation for the chosen number of steps but a shorter safe route does
- **THEN** the sheep follows the longest available shorter route

#### Scenario: Sheep is enclosed
- **WHEN** no walkable neighboring route can increase separation from the triggering character
- **THEN** the sheep does not cross a collision and returns to idle at its current position

### Requirement: Obstacle-aware grid movement
Every flee route SHALL use cardinally adjacent grid cells and SHALL remain within the grid. Every traversed cell SHALL accommodate the sheep's collider without overlapping any full-cell or partial terrain collider. A multi-step route MAY change direction between steps so the sheep can move around a corner.

#### Scenario: Three-step route turns around a corner
- **WHEN** the direct path away is blocked but a three-step cardinal route around the blocking corner is available
- **THEN** the sheep follows the turning route without entering the blocked terrain

#### Scenario: Partial terrain collider blocks the sheep body
- **WHEN** a candidate cell would make the sheep's collider overlap a partial terrain polygon
- **THEN** that cell is excluded from all flee routes

#### Scenario: Route reaches the map edge
- **WHEN** a candidate route would place any part of the sheep collider outside the logical playfield
- **THEN** that route is excluded

### Requirement: Typed NPC collision
The sheep SHALL have a circular collider with the same 26-pixel radius as the hero collider and SHALL classify that collider as `npc`. An NPC collider SHALL NOT overlap terrain, player, enemy, projectile, or any other non-NPC collider. NPC colliders SHALL be permitted to overlap other NPC colliders. Collision avoidance SHALL be bidirectional so non-NPC movers also cannot enter the sheep collider.

#### Scenario: Sheep route encounters the player
- **WHEN** a candidate flee cell or movement segment would overlap the player collider
- **THEN** the sheep excludes or safely stops that route without overlap

#### Scenario: Player moves toward the sheep
- **WHEN** player movement would overlap the sheep collider
- **THEN** the player is blocked before the colliders overlap

#### Scenario: Sheep encounters another NPC
- **WHEN** a candidate route or movement segment overlaps a collider classified as `npc`
- **THEN** that NPC collider does not block the sheep

#### Scenario: Projectile reaches the sheep
- **WHEN** a projectile movement step would overlap the sheep collider
- **THEN** the projectile resolves the collision without overlapping the sheep

### Requirement: NPC collider diagnostics
When collider diagnostics are enabled, the sheep's NPC collider SHALL be rendered with the existing character-collider diagnostic style using yellow fill and stroke colors that distinguish NPCs from the hero.

#### Scenario: Collider diagnostics show the sheep
- **WHEN** collider diagnostics are enabled while the sheep is visible
- **THEN** a yellow circle matching the sheep's 26-pixel collider is drawn at its current world position

### Requirement: Running and idle recovery
The sheep SHALL move smoothly between the centers of the cells in its selected route, face its horizontal direction of travel when applicable, and return to idle after reaching the final waypoint. The existing idle sheet SHALL remain the movement visual because the supplied sheep art has no separate run animation. After returning to idle, the sheep SHALL evaluate fear again and MAY begin another frightened response if a configured frightening character is still in range.

#### Scenario: Sheep completes its selected route
- **WHEN** the sheep reaches every waypoint in its flee route
- **THEN** it stops exactly on the final grid cell, switches to idle, and resumes proximity evaluation

#### Scenario: Frightening character remains close
- **WHEN** the sheep finishes fleeing and the triggering character is still within the configured fear radius
- **THEN** the sheep begins another bounce-before-flee response from its new cell

### Requirement: Paused gameplay freezes sheep AI
The sheep's fear evaluation, animation progress, and route movement SHALL use active gameplay time so opening the pause-controlled settings window freezes its response.

#### Scenario: Game pauses during a flee response
- **WHEN** gameplay is paused while the sheep is bouncing or running
- **THEN** the sheep remains at the same animation progress and world position until gameplay resumes
