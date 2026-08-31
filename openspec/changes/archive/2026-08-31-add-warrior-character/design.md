## Context

The goblin already separates pure enemy state, directional selection,
animation descriptors, rendering/lifecycle, a demonstration controller, and
game-loop ownership. Current spawner configuration identifies only a generic
enemy and constructs a goblin directly. Tiled map normalization currently
focuses on tile layers, so character placement needs a stable data seam rather
than a Warrior-specific branch scattered through the game loop.

The supplied Warrior PNGs are transparent, single-row sheets with 192 by 192
cells: Idle is 1536 by 192 (8 frames), Run and Guard are 1152 by 192 (6 frames
each), and Attack 1 and Attack 2 are 768 by 192 (4 frames each). No source
timing metadata accompanies the PNGs, so timing must follow the established
Tiny Swords 100 ms baseline unless visual verification demonstrates otherwise.
See `proposal.md` for motivation and the delta specs for behavior.

## Goals / Non-Goals

**Goals:**

- Keep the Warrior as independently organized and testable as the goblin.
- Preserve all five supplied animations and give each a tested runtime path.
- Let Tiled-authored spawn data select `warrior` without breaking existing
  programmatic spawners or goblin maps.
- Share common enemy state, collision, combat, depth, pause, and cleanup seams.

**Non-Goals:**

- New damage rules, guard damage reduction, combo logic, pathfinding, or a new
  AI architecture.
- Recoloring, repacking, or deriving animations absent from the supplied PNGs.
- Adding dependencies or redesigning the general Tiled tile renderer.

## Decisions

### Model Warrior as its own enemy folder and factory identity

Add `src/enemies/warrior/` with its catalog, action-selection logic, actor, and
focused controller only where needed. Extend the spawn configuration/factory
boundary with a character identity such as `warrior`; do not replace the
existing `enemy` population category or treat every enemy as a goblin.

Alternative: parameterize the goblin module with Warrior textures. Rejected
because guard and two attacks have distinct state semantics and would make the
goblin boundary misleading.

### Keep all supplied animations even when combat policy is deferred

Map Idle to idle, Run to walking, expose Attack 1 and Attack 2 as explicit
non-looping commands, and expose Guard as an explicit held or looped visual
state. The current controller can demonstrate every animation, but choosing an
alternate attack or applying guard mitigation remains outside this change.

Alternative: import only idle, run, and Attack 1. Rejected because it would
discard supplied capability and make later use require another asset pass.

### Use uniform Babylon Lite atlases without transforming the PNGs

Copy the five distributable sheets to
`public/assets/enemies/warrior/`, preserve 192 by 192 grids, use nearest
sampling, and load each atlas once for sharing across instances. Measure pivot
and collider against visible feet during browser verification.

Alternative: combine sheets into one atlas. Rejected because the existing
catalog uses one uniform sheet per animation and no repacking is necessary.

### Extend the Tiled/spawner boundary additively

Represent actor role/population category separately from the stable character
identity. Normalize supported Tiled spawner data into the same configuration
shape used by runtime factories. Missing character identity continues to use
the existing goblin default where needed for backward compatibility; explicit
`warrior` selects the Warrior factory and marker art. Author the initial
Warrior spawner at game grid `05,09` with minimum and maximum counts of one.

Alternative: create a second generic enemy spawner type. Rejected because it
duplicates population semantics and still does not encode character identity.

## Risks / Trade-offs

- [PNG files do not encode animation timing or guard semantics] -> use the
  established 100 ms Tiny Swords timing, expose guard without inventing damage
  behavior, and verify motion visually.
- [Concurrent spawner and Tiled changes may overlap] -> extend current data
  shapes additively and reconcile against the working tree rather than
  restoring or rewriting existing changes.
- [Warrior visible bounds differ from its 192 square cell] -> measure a
  feet-centered pivot and compact collider in desktop and portrait browser
  checks.
- [Two attack sheets lack directional variants] -> mirror horizontally using
  the last requested horizontal facing and do not invent vertical art.

## Migration Plan

1. Add catalog/state tests and copy the five runtime sheets.
2. Implement and test the Warrior actor against common enemy contracts.
3. Extend Tiled/spawner character selection with backward-compatible defaults.
4. Integrate Warrior loading, construction, updating, combat, and disposal.
5. Run focused tests, the full check/build, and desktop/portrait browser checks.
6. Roll back additively by removing explicit Warrior placements; existing
   goblin/default spawners continue to load.
