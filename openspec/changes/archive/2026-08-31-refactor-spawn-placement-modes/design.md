## Context

The current runtime spawner searches a fixed 3x3 neighborhood and only knows about actors owned by that spawner. Level normalization currently extracts only a type and game cell from Tiled spawner objects. Existing movement collision helpers already evaluate terrain and dynamic character movement colliders.

## Goals / Non-Goals

**Goals:**

- Make item identity, placement mode, and maximum distance explicit configuration.
- Share a level-wide occupancy query across all spawners.
- Evaluate the spawned character's complete movement collider at each candidate cell.
- Preserve population randomization, ownership, lifecycle, and marker behavior.

**Non-Goals:**

- Changing character movement, navigation route selection, combat, or population rules.
- Adding runtime dependencies.
- Making non-blocking reactive-decoration sensors prevent spawning.

## Decisions

### Use grid cells and Chebyshev distance

Distances are represented as non-negative integer grid cells. Chebyshev distance matches the existing square-neighborhood behavior and makes a radius of three intuitive for level designers. Pixel-distance and Manhattan-distance alternatives were rejected because they would either couple configuration to rendering scale or change the existing neighborhood shape.

### Centralize occupancy at the level runtime

The spawner receives a candidate validator or occupancy callback that includes terrain/object obstacles and all currently living character movement colliders. This avoids stale per-spawner views and ensures a sheep cannot spawn inside an enemy owned by another spawner. Candidates selected during a batch are added to the same temporary occupancy set before the next actor is created.

### Keep catalog defaults, allow authored overrides

Catalog entries provide the agreed Level01 defaults: Player `nearby/0`; Sheep, Goblin, and Warrior `nearby/3`. Tiled metadata is normalized and validated at load time so future levels can select `anywhere-walkable` without source changes.

### Enumerate deterministic level cells, then randomize selection

Nearby mode enumerates cells in its bounded square; anywhere-walkable enumerates all in-bounds level cells. Invalid and occupied candidates are removed, and the existing random function chooses among remaining candidates. This keeps tests deterministic while retaining randomized gameplay.

## Risks / Trade-offs

- [Large anywhere-walkable levels may require many candidate checks] -> Use bounded grid enumeration and validate candidates with the existing collision helpers; optimize only if profiling shows a problem.
- [Different actor collider sizes can make a visually open tile invalid] -> Validate the actual spawned character movement collider, not only terrain tile labels.
- [Tiled metadata migration can invalidate old maps] -> Supply catalog defaults for existing spawner tiles and report malformed overrides with object-specific errors.
- [Actors may move between candidate enumeration and creation] -> Build and reserve candidates within the synchronous spawn batch, using current colliders for each selection.
