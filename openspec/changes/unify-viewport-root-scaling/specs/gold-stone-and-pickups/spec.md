## MODIFIED Requirements

### Requirement: Pickup spawn animation and collection
Each pickup SHALL use a tweened PickupSpawnAnimation from its authored or drop origin toward its destination, including fade-in, scale-in, and an arc rising about one tile. Its non-blocking player collection combat collider SHALL be centered on its current logical position and SHALL be transformed by the shared viewport scale. Overlap by the player SHALL cancel the spawn tween and begin PickupObjectDeath.

#### Scenario: Player collects a flying pickup
- **WHEN** the player's walk collider overlaps a pickup during PickupSpawnAnimation
- **THEN** the spawn tween is cancelled and PickupObjectDeath begins

#### Scenario: Pickup remains aligned during resize
- **WHEN** the viewport is resized while a pickup exists
- **THEN** its sprite and combat collider remain aligned at the same logical position relative to the grid
