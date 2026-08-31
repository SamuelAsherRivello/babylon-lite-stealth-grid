## Why

The game has a complete goblin enemy pattern but cannot add a second animated
enemy from Tiled without character-specific source edits. The supplied red
Tiny Swords Warrior sheets provide a concrete character whose full animation
set can establish a reusable, map-authored character identity.

## What Changes

- Add the red Tiny Swords Warrior as a distinct enemy actor organized to the
  same lifecycle, catalog, state, collision, combat, testing, and runtime
  quality baseline as the existing goblin.
- Import all five supplied Warrior sheets: eight-frame idle, six-frame run,
  four-frame Attack 1, four-frame Attack 2, and six-frame guard.
- Expose Attack 1, Attack 2, and guard through explicit tested actor commands;
  keep current autonomous behavior conservative where combat rules do not yet
  define when alternate attack or guard should be chosen.
- Add a stable `warrior` identity to the Tiled/spawner data boundary so a map
  author can select and place Warriors without editing game source.
- Preserve existing goblin map data and runtime behavior.
- Reuse the installed Babylon Lite and test stack without adding dependencies.

## Capabilities

### New Capabilities

- `warrior-character`: Defines the Warrior asset catalog, complete animation
  surface, enemy behavior, lifecycle, and Tiled-visible spawn identity.

### Modified Capabilities

- `enemy-actors`: Requires enemy types to preserve character identity across
  map/spawner data and actor construction while sharing the common lifecycle.

## Impact

- Adds Warrior modules under `src/enemies/warrior/` and distributable runtime
  sheets under `public/assets/enemies/warrior/`.
- Extends Tiled level or spawner parsing, the spawn catalog, game-loop actor
  factory selection, tests, and documentation.
- Uses the existing health, death, collision, depth, pause, and enemy AI seams;
  no package, save-format, or public-network change is required.
