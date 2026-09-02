## MODIFIED Requirements

### Requirement: Autonomous movement uses shared obstacle-aware navigation
Route-based autonomous movement SHALL use cardinally adjacent grid cells, remain within the logical grid, and exclude any cell that cannot contain the controlled actor's collider without overlapping terrain or a blocking dynamic collider. The route SHALL move smoothly through cell-center waypoints and SHALL stop safely if a remaining segment becomes blocked. When an enemy follows a cardinal horizontal segment, its movement-collider center SHALL remain aligned toward the center of its current logical row; when it follows a cardinal vertical segment, its movement-collider center SHALL remain aligned toward the center of its current logical column. Alignment correction SHALL preserve forward movement and SHALL respect the same terrain, bounds, and dynamic-collider constraints.

#### Scenario: Direct route is blocked
- **WHEN** a reachable destination requires turning around non-walkable terrain
- **THEN** the route follows safe cardinal cells around the obstruction

#### Scenario: Dynamic blocker invalidates movement
- **WHEN** a dynamic non-permitted collider blocks the actor's next waypoint after planning
- **THEN** the actor stops before overlap and returns control to its policy for a new decision

#### Scenario: Enemy moves vertically
- **WHEN** an enemy has a non-zero vertical movement intent
- **THEN** its movement-collider center moves vertically while its X coordinate is corrected toward the center of its current grid column

#### Scenario: Enemy moves horizontally
- **WHEN** an enemy has a non-zero horizontal movement intent
- **THEN** its movement-collider center moves horizontally while its Y coordinate is corrected toward the center of its current grid row

#### Scenario: Enemy changes movement axis
- **WHEN** an enemy stops or changes from horizontal to vertical movement, or from vertical to horizontal movement
- **THEN** the previous orthogonal correction is discarded and a new correction is based on the enemy's current cell without teleporting or bypassing collision constraints

### Requirement: Character grid occupancy and depth use the movement collider center
Every player-controlled or autonomous character SHALL use the center point of its current movement collider as the authoritative X/Y point for determining its logical grid cell. The same point's world Y coordinate SHALL determine that character's Y-sorted render depth. Artwork pivots, frame bounds, combat colliders, and raw actor positions SHALL NOT independently determine character grid occupancy or Y-sorted depth.

#### Scenario: Movement collider is offset from artwork position
- **WHEN** a character's movement-collider center and artwork position fall in different logical cells or produce different depth values
- **THEN** the character uses the movement-collider center for both its grid cell and Y-sorted render depth

#### Scenario: Character moves across a cell boundary
- **WHEN** the movement-collider center crosses a logical grid boundary
- **THEN** the character's occupied cell and Y-sorted render depth update from that center point
