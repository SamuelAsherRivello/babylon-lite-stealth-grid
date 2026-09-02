## Why

Gameplay entities currently mix continuous world positions, collider-derived cells, and diagnostic-only center markers. This makes it difficult to see the exact logical grid spot the game is using while an entity is moving between cells. A shared occupancy contract is needed so every active entity has one quantized gameplay spot and one corresponding diagnostic X while its artwork and colliders continue moving smoothly.

## What Changes

- Add a universal `GridSpot` spatial contract for every gameplay entity with a world center.
- Initialize entities at the exact center of their authored or spawned grid spot.
- Quantize each entity's live world center against the configured grid dimensions, changing spots only after crossing the halfway boundary into another cell.
- Keep logical grid occupancy separate from continuous physical interpolation: artwork, red combat colliders, green movement colliders, and other live geometry follow the world center.
- Make AI, perception, interaction, targeting, and other gameplay cell reads consume the shared quantized spot.
- Give every active entity exactly one small black X at the center of its current logical grid spot, including overlapping entities.
- Centralize the X marker's style, geometry, command creation, and diagnostic canvas rendering.
- Remove ad-hoc bush whole-cell markers and pickup-specific center-marker plumbing.
- Hide markers immediately for entities that are dead, collected, destroyed, or otherwise inactive.
- Cover players, enemies, NPCs, bushes, pickups, gold stones, projectiles, goals, and future gameplay entities with the same contract.

## Capabilities

### New Capabilities

- `universal-grid-spot-occupancy`: Defines quantized gameplay occupancy, continuous world positioning, and one-per-entity diagnostic X markers for all gameplay entities.

### Modified Capabilities

- `character-perception`: Character cell reads and detected locations use the universal quantized grid spot.
- `character-perception-debug-rendering`: Collider-mode diagnostics render the centralized occupancy markers alongside perception diagnostics.
- `actor-ai-behaviors`: Character and bush interaction decisions consume the shared logical grid spot.

## Impact

- Adds shared spatial and diagnostic code under `src/systems/environment/` and `src/ui/`.
- Updates entity factories and runtime integration in `src/characters/`, `src/systems/objects/`, decorations, and `src/main.js`.
- Updates AI, perception, collision/interaction, and targeting cell reads to use one occupancy source.
- Adds unit, integration, and browser verification for spawn centering, 33-pixel-equivalent threshold behavior on a configured grid, smooth sub-grid movement, marker uniqueness, lifecycle visibility, and all entity categories.
- Requires no new dependencies and does not rename art assets.
