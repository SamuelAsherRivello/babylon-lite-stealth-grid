## Why

Spawner type and position are still partly defined in source code, so changing a level's population layout requires code edits and the saved Tiled map is not the complete level definition. Tiled should expose reusable placeable items for the three existing player, sheep, and goblin spawners, and the runtime should instantiate only the spawners authored in the loaded map.

## What Changes

- Add a Tiled spawner object template or object-tileset palette containing named placeable items for Player Spawner, Sheep Spawner, and Goblin Spawner.
- Give each item stable authored metadata for its spawner role, character identity, population range, and initial-population behavior while allowing each placed instance to be independently moved or duplicated.
- Normalize each placed spawner's map position through the existing Tiled origin/grid contract and build runtime spawner configurations from the normalized authored records.
- Remove unconditional creation of the three hardcoded default spawners when loading a Tiled level; absence, placement, and multiplicity in the map become authoritative.
- Update the current level map with placements representing the existing player, sheep, and goblin spawners so its initial gameplay remains intentional after migration.
- Require an immediately recognizable temporary editor representation using text or simple icons; as a stretch task, reuse or derive the small black-and-white in-game marker artwork for the Tiled palette icons.
- Reject or clearly report malformed and unsupported authored spawner data instead of silently substituting hardcoded positions.

## Capabilities

### New Capabilities

- `tiled-spawner-authoring`: Defines the reusable Tiled palette items, authored spawner data contract, map-authoritative placement and multiplicity, coordinate normalization, validation, and editor representation for the existing player, sheep, and goblin spawners.

### Modified Capabilities

- None.

## Impact

- Affects the Tiled project, its reusable editor assets/templates, `Level01.tmj`, the local Tiled/Babylon Lite normalization plugin, the spawner catalog/composition boundary, and level/spawner tests and documentation.
- Intersects the active Warrior work: enemy role and concrete character identity must remain distinct, and any already-authored supported character such as `warrior` must continue through the same normalized contract without being mistaken for the Goblin palette item.
- Adds repository-authored editor data and optional icon assets but no runtime dependency.
