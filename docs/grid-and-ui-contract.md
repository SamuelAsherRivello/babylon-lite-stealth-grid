# Grid and UI Contract

The game uses one canonical logical grid for gameplay, terrain, animation placement, and UI coordinate readouts.

## Decided resolution

- Logical screen: **576 × 1024 pixels**.
- Tileset cell: **64 × 64 pixels**.
- Grid: **9 columns × 16 rows**.
- Coverage: the grid spans **100% of the logical screen** with no partial cells or unused logical pixels.
- World origin: cell **(0,0)** is the lower-left cell. Positive X points right and positive Y points up.
- Screen rendering uses a top-left origin, so grid/world positions must pass through the shared coordinate helpers before rendering.

The executable source of truth is `GRID` in `src/grid-contract.js`. UI and rendering code must import this contract instead of declaring their own tile or logical-screen dimensions.

## Oversized animated tiles

An animation atlas frame can be larger than one grid cell. Its native frame size must be preserved so its artwork is not incorrectly shrunk. Place the frame by centering it on its target grid cell; transparent frame padding and visible artwork may extend beyond the cell.

`Water Foam.png` uses sixteen 192 × 192 frames. The preview keeps that native three-cell frame size and centers it on origin cell (0,0). The frame therefore starts at screen position (-64, 896), while the target cell itself spans screen X 0–64 and Y 960–1024.
