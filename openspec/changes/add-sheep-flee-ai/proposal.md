## Why

The sheep currently bounces on a timer without reacting to gameplay. Giving it configurable fear and obstacle-aware fleeing makes it behave like a simple NPC that the player can approach and startle while establishing reusable behavior for future enemy-triggered reactions.

## What Changes

- Replace the sheep's random timed bounce trigger with proximity-based fear detection.
- Configure which character types can scare a sheep, supporting `player`, `enemy`, or both, while configuring the current sheep to fear only the player.
- Configure the sheep's fear radius in grid cells, initially three cells using grid-square (Chebyshev) distance so horizontal, vertical, and diagonal proximity are treated consistently.
- Play the complete bounce animation before choosing and following a flee route.
- Choose a random flee distance from a configurable inclusive range, initially one through three grid steps.
- Route the sheep through walkable grid cells away from the triggering character, allowing multi-step paths to turn around corners without crossing colliding terrain or leaving the map.
- Give the sheep an NPC-classified circular collider with the same radius as the hero, render NPC colliders yellow in diagnostics, prevent overlap with every non-NPC collider, and permit NPC-to-NPC overlap.
- Return the sheep to idle after its route completes and allow it to react again when a feared character remains or comes within range.
- Add deterministic state-machine, fear-filtering, path-selection, collision-safety, and gameplay integration tests.

## Capabilities

### New Capabilities

- `sheep-flee-ai`: Defines configurable fear detection, bounce-before-flee sequencing, random flee distance, obstacle-aware grid routing, and idle recovery for sheep NPCs.

### Modified Capabilities

None.

## Impact

- Sheep NPC state, rendering, movement, and configuration under `src/npc/sheep/`.
- Main-loop character context, typed dynamic colliders, and terrain-grid data supplied to NPC updates.
- Player, projectile, and future enemy collision integration where those non-NPC types encounter sheep NPCs.
- Reusable grid navigation helpers and their tests.
- Existing sheep animation assets remain unchanged; no new runtime dependency is required.
