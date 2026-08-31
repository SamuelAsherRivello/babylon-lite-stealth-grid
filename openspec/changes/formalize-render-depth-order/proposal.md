## Why

The game currently uses small, scattered Babylon sprite orders and implicit DOM stacking, making future 2D layers difficult to place consistently. A documented depth contract is needed now so TileMap sublayers, gameplay objects, persistent UI, and modal UI remain predictable as the game grows.

## What Changes

- Define a canonical depth scale with reserved numeric bands for game rendering and CSS UI stacking.
- Introduce a logical TileMap base depth with sub-depth slots for ordered TileMap visual sublayers.
- Separate NPCs, player, projectiles, effects, and foreground/cover into documented bands.
- Place version metadata, coordinates, coordinate guide, gear, and virtual controls above all game rendering.
- Place the settings backdrop and settings window above persistent UI.
- Keep the relative ordering of projectiles versus gameplay effects explicitly TBD.
- Document how logical category/sub-depth values map to Babylon Lite's flat sprite-layer order.

## Capabilities

### New Capabilities

- `render-depth-order`: Defines the stable visual-depth contract for Babylon sprites and DOM overlays.

### Modified Capabilities

## Impact

- Affects Babylon sprite-layer order declarations in `src/main.js`, `src/player.js`, `src/npc/sheep/sheep.js`, `src/projectile-renderer.js`, and particle-effect modules.
- Affects DOM stacking declarations in `src/ui/style.css`.
- Adds depth-order documentation and focused tests for the ordering contract.
- No new dependencies or runtime framework changes.
