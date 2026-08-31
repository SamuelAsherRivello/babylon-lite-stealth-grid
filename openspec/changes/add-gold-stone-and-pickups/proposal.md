## Why

Levels need a destructible resource object that creates a small, readable reward when the player attacks it. This change adds a reusable Gold Stone and player-only Gold pickups while preserving the project's authored Tiled placement and lightweight runtime architecture.

## What Changes

- Add a single-placeable Gold Stone object/spawner to Tiled.
- Randomly choose Gold Stone 5 or 6 for each spawned stone.
- Give the stone one health, projectile-only damage, periodic highlight animation, and object death animation.
- Drop two or three Gold Pickup objects after the stone death completes.
- Randomly choose Gold Stone 1 or 2 for each pickup.
- Spawn pickups into distinct valid cells in the surrounding eight cells of the stone's 9-grid.
- Animate pickup movement, scale, and fade with a pickup spawn animation.
- Allow immediate player walk-collider pickup and pickup object death animation.

## Capabilities

### New Capabilities

- `gold-stone-and-pickups`: Destructible Gold Stones and player-only Gold Pickup lifecycle.

### Modified Capabilities

None. The new object contract includes its own one-shot spawning and projectile interaction requirements without changing existing actor-spawner or archer requirements.

## Impact

Affected areas include the Tiled loader and tilesets, Level01 authoring, object spawning and lifecycle modules, projectile target routing, sprite animation/render layers, collision diagnostics, asset attribution, and automated tests. No new runtime dependency is required.
