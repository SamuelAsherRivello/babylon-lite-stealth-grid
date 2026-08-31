# Grid and UI Contract

The game uses one canonical logical grid for gameplay, terrain, animation placement, and UI coordinate readouts.

## Decided resolution

- Logical screen: **576 × 1024 pixels**.
- Tileset cell: **64 × 64 pixels**.
- Grid: **9 columns × 16 rows**.
- Coverage: the grid spans **100% of the logical screen** with no partial cells or unused logical pixels.
- World origin: cell **(0,0)** is the lower-left cell. Positive X points right and positive Y points up.
- Quadrant: gameplay world coordinates are in **first quadrant only** by design (`x > 0`, `y > 0`, relative to origin).
- Screen rendering uses a top-left origin, so grid/world positions must pass through the shared coordinate helpers before rendering.
- Coordinate policy for AI: the gameplay model is 2D (`x`, `y` only). There is no world-space `z` in movement/physics logic today. If depth is introduced later, use `+z` as “away from camera” (only after explicit API-level docs exist), and do not infer any `z` behavior from sprite rendering alone.

## Projectile spawn convention

- Canonical arrow spawn point is defined by `ARROW_SPAWN_OFFSET = { x: 64, y: 55 }` in `src/characters/player/player.js` and used by `getArrowSpawnPosition(...)`.
- Use this same world-space pattern for all future projectile sources unless a specific spec requires a different spawn geometry:
  - keep relative placement anchored to the shooter's world position,
  - preserve positive world Y as up when choosing offsets,
  - mirror only X by `facing` where appropriate.
- If future projectile types share spawn behavior, define their offsets as named constants next to their shooter and document them with this same 2D/world coordinate contract.

The executable source of truth is `GRID` in `src/systems/environment/grid-contract.js`. UI and rendering code must import this contract instead of declaring their own tile or logical-screen dimensions.

## Oversized animated tiles

An animation atlas frame can be larger than one grid cell. Its native frame size must be preserved so its artwork is not incorrectly shrunk. Place the frame by centering it on its target grid cell; transparent frame padding and visible artwork may extend beyond the cell.

`Water Foam.png` uses sixteen 192 × 192 frames. The preview keeps that native three-cell frame size and centers it on origin cell (0,0). The frame therefore starts at screen position (-64, 896), while the target cell itself spans screen X 0–64 and Y 960–1024.
