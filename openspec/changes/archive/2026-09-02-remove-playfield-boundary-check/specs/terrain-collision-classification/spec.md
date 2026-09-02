## MODIFIED Requirements

### Requirement: Collision-aware directional movement
The character SHALL resolve horizontal and vertical movement independently. Unobstructed movement can continue along a blocked tile edge, and the logical playfield rectangle SHALL NOT block movement solely because the character movement collider crosses its edge.

#### Scenario: Moving diagonally into an obstacle edge
- **WHEN** one component of diagonal movement would collide and the other component is unobstructed
- **THEN** the blocked component is rejected and the unobstructed component is applied

#### Scenario: Moving across the logical screen edge
- **WHEN** a character movement collider would cross or leave the logical screen bounds and does not overlap terrain collision geometry
- **THEN** the requested movement is applied and the character is allowed to continue beyond the screen edge

#### Scenario: Moving beyond the screen into blocked terrain
- **WHEN** a character movement collider would overlap blocked terrain beyond or within the logical screen bounds
- **THEN** the terrain collision still rejects or resolves that movement component
