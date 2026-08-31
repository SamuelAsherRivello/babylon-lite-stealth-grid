## Why

Goblins currently have no environmental mischief to perform during otherwise quiet patrols, and bushes cannot participate in combat despite already existing as independently authored reactive objects. Giving goblins an occasional, map-wide bush-burning diversion creates a readable two-hit environmental interaction while reusing the game's established health, effects, navigation, and death language.

## What Changes

- Give each bush 100 health and a non-blocking combat collider while preserving its existing pass-through movement sensor and rustle behavior.
- At each new goblin patrol decision with no higher-priority player or sheep attack, give the goblin a 25% chance to search the whole map for the nearest reachable living bush.
- Route a bush-seeking goblin to a cardinally adjacent cell, face the bush, and perform atomic fire swings with the existing attack and recovery behavior.
- Use the center of every character's movement collider as its authoritative X/Y point for grid occupancy and Y-derived Z sorting. Use the center of a bush's combat collider as the comparable bush interaction point.
- Deal 50 damage per successful goblin swing, so an undamaged bush requires two hits.
- Play one complete Fire 3 cycle on the struck bush for each successful hit; after the second cycle completes, run the shared 250 ms spin, fade, and shrink death animation and remove the bush.
- Abandon a bush route safely when its target is destroyed or becomes unreachable. Allow multiple goblins to select the same bush without reservations.
- Reconcile the current scripted goblin demo controller with the target-aware patrol behavior already required by the main AI specification.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `actor-ai-behaviors`: Add optional whole-map bush-seeking decisions and define movement-collider-center grid occupancy and depth ordering for characters so adjacent-cell environmental attacks use one consistent point model.
- `reactive-terrain-decorations`: Make bushes independently damageable through non-blocking combat colliders while preserving their existing sensors and pass-through movement behavior.
- `combat-health-system`: Extend shared 100-health damage and death behavior to bushes, including delayed death presentation after the second fire cycle.
- `reusable-particle-effects`: Support one-cycle Fire 3 gameplay playback attached to a bush with a completion signal, without changing looping preview behavior.

## Impact

- Affects Tiled bush authoring/normalization, reactive-decoration runtime state, every character's grid-cell and Z-sorting calculation, collider diagnostics, goblin decision/navigation integration, combat hit resolution, particle playback control, renderer layer lifecycle, and related unit/integration/browser tests.
- Requires no new dependencies, saved-data migration, UI, health bars, or public network/API changes.
- Existing bush movement remains non-blocking; maps do not need placement migration beyond the reusable bush tileset contract update.
