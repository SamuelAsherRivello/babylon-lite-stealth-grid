## Context

The centralized perception evaluator currently receives a detector, target, walkability query, and visual range. Actor snapshots already contain stable identity, type, position, and life state; the change must extend the occupancy information without coupling perception to renderer objects or combat collision geometry.

## Goals / Non-Goals

**Goals:**

- Evaluate bush and enemy occupancy as channel-specific sensory blockers using authoritative grid cells.
- Keep visual target-cell negation distinct from visual beyond-cell blocking, while preserving audio's same-cell enemy negation only.
- Preserve existing terrain, range, strength, lifecycle, and reaction contracts.
- Keep bushes out of movement obstacle colliders; their participation in this change is limited to visual perception blocking outside the detector's origin cell.

**Non-Goals:**

- No new stealth meter, sound propagation distance, diagonal visual perception, or runtime obstruction animation.
- No change to movement collision or combat damage rules.

## Decisions

- Use a predicate or occupancy snapshot supplied to the perception evaluator rather than importing bush/enemy implementations. This keeps the sensory system reusable and testable; hard-coded scene queries would couple it to Babylon runtime state.
- Classify living enemies as audio negators and living bushes or living enemies as visual blockers/negators, while dead/unregistered actors do not affect perception. A channel-specific classification prevents bushes from affecting audio and the player/future non-obstructing actors from hiding perception.
- Evaluate the visual target cell separately from preceding cells: terrain or a blocker in the target cell negates only that spot; terrain or a blocker in a preceding cell blocks that cell and all later cells on the ray. This makes the distinction explicit and testable.
- Use the generated visual-cell list, which begins one cell beyond the detector, so a bush sharing the detector's origin cell cannot self-block its visual ray. Do not add bushes to movement collision obstacles.
- Evaluate audio per neighboring cell and reject only cells occupied by living enemies. Audio remains non-directional, terrain-transparent, and bush-transparent; it has no beyond-cell blocking rule.
- Keep detection events limited to the player target. Blocked-cell details may be included in internal/debug snapshots only if existing consumers need them; no new event type is required.

## Risks / Trade-offs

- [A stale occupancy snapshot could let a player be detected through a recently moved blocker] → Update registered actor cells before each perception pass and test movement-order cases.
- [A dead bush or enemy could negate a spot or permanently hide a ray if lifecycle state is ignored] → Require living-state filtering and add dead-blocker regression scenarios.
- [Existing callers may not provide blocker data] → Preserve an empty-blocker default for compatibility, then update the runtime registration path to provide authoritative occupants.

## Migration Plan

Add the optional occupancy/blocker query with an empty default, update actor registration and the main perception update path, then enable blocker-aware behavior for live bushes and enemies. Rollback is limited to reverting the perception change artifacts and restoring the prior evaluator contract; no saved data migration is involved.
