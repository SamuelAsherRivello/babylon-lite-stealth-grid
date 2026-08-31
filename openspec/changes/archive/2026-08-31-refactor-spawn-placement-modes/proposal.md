## Why

Spawner placement is currently an implicit, hardcoded 3x3 search around each spawner. That prevents levels from expressing what is being spawned or choosing between local and level-wide placement, and it does not consistently prevent newly spawned characters from overlapping existing actors or blocking geometry.

## What Changes

- Add explicit spawner metadata for the spawned character/item, spawn mode, and maximum nearby distance.
- Support `nearby` spawning within a configured Chebyshev distance in grid cells.
- Support `anywhere-walkable` spawning across the complete level walkable area.
- Reject candidate cells occupied by terrain, blocking object colliders, the player, or any living character movement collider.
- Reserve cells selected earlier in the same spawn batch so actors in one batch cannot overlap.
- Configure Level01's Player as `nearby` distance 0, and Sheep, Goblin, and Warrior as `nearby` distance 3.
- Preserve existing population limits, randomized evaluation, ownership, lifecycle, and marker behavior.

## Capabilities

### New Capabilities
- `spawn-placement-modes`: Defines explicit spawned-item metadata and nearby or level-wide walkable placement rules.

### Modified Capabilities
- `entity-spawners`: Changes spawner configuration and candidate placement behavior while preserving population-management rules.
- `tiled-spawner-authoring`: Extends authored spawner metadata so placement mode and maximum distance can be represented and validated.

## Impact

- Affected runtime modules include `src/spawner.js`, `src/spawner-catalog.js`, `src/main.js`, navigation/collision helpers, and the Tiled level normalization plugin.
- Tiled spawner tiles and normalized level data gain placement metadata.
- Existing spawner and level-loader tests require updates, with new focused coverage for distance limits, global occupancy, and anywhere-walkable selection.
- No new runtime dependency is required.
