## Why

The game has player and NPC concepts but no reusable enemy boundary or enemy
state machine. The Tiny Swords goblin assets provide a concrete first enemy
whose real animation tags can establish that structure without inventing
unsupported behavior.

## What Changes

- Add an `/enemies/` source and runtime-asset convention with one folder per
  enemy type, beginning with `/enemies/goblin/`.
- Add the red Tiny Swords Torch goblin as the first enemy, exported from its
  layered Aseprite source into uniform Babylon Lite animation sheets.
- Give the goblin explicit `idle`, `walking`, and directional `attacking`
  states backed by the source tags `Idle`, `Run`, `Attack_Right`,
  `Attack_Down`, and `Attack_Up`.
- Keep decisions about targeting, pathfinding, damage, health, death, loot,
  stealth detection, and the TNT/Barrel goblin variants outside this change.
- Document the inspected asset inventory so later enemy variants can reuse the
  same enemy contract without treating all Goblins/Troops files as one unit.

## Capabilities

### New Capabilities

- `enemy-actors`: Defines the reusable enemy organization, lifecycle, state
  transitions, animation mapping, movement interface, and disposal behavior.
- `goblin-enemy`: Defines the first Torch goblin, its supported animation
  states, directional attack selection, and source-asset/export contract.

### Modified Capabilities

None.

## Impact

- Adds enemy modules under `src/enemies/` and derived runtime assets under the
  corresponding enemy folder in `public/assets/`. The paid Aseprite source
  remains in a local Git-ignored import directory.
- Integrates enemy creation, updating, drawing order, and disposal with the
  existing Babylon Lite game loop.
- Reuses the installed Babylon Lite sprite APIs and existing test tooling; no
  new runtime dependency is required.
- Records the official Tiny Swords terms and attribution while avoiding raw
  source redistribution.
