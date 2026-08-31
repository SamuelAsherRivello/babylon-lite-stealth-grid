## Context

The current sheep owns idle and bouncing sprite layers plus a timer-driven `idle -> bouncing -> idle` state machine. The main loop already owns the player position, terrain colliders, logical 64-pixel grid contract, active pause delta, and continuous collision helpers. The sheep source art contains idle and bouncing sheets but no separate run sheet. See `proposal.md` for motivation and `specs/sheep-flee-ai/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Keep fear rules, navigation, and state transitions deterministic under injected randomness so they can be unit tested without Babylon rendering.
- Treat both full and partial terrain collision geometry as authoritative when building walkable grid routes.
- Keep NPC configuration data-driven enough to reuse the behavior for another sheep configuration without adding enemy behavior now.
- Preserve the existing animation manager, pause semantics, logical grid, and collision system.

**Non-Goals:**

- Enemy spawning, enemy AI, or sheep-to-sheep avoidance.
- Dynamic obstacle replanning while the sheep is already running.
- Diagonal movement edges, continuous free-space steering, or a general-purpose navigation mesh.
- New run artwork, asset generation, or a new runtime dependency.

## Decisions

### Use a three-state sheep machine

Extend the machine to `idle`, `bouncing`, and `running`. `idle` evaluates fear stimuli, `bouncing` locks position until the non-looping animation callback, and `running` consumes route waypoints before returning to `idle`. The old autonomous 5-to-10-second bounce timer is removed rather than combined with fear reactions, because a timer could interrupt or obscure the readable cause-and-effect behavior requested here.

Alternative considered: layer fear on top of the timer. Rejected because two independent bounce triggers complicate transition priority and make manual acceptance testing ambiguous.

### Represent frightening types as a set of stable character-type strings

Use a `Set` or equivalent normalized collection containing the stable values `player` and/or `enemy`. Each update receives a list of character snapshots with `type`, world position, and grid cell. This avoids hard-coding player access into the sheep and lets a later enemy integration supply snapshots without changing the fear contract. The initial instance uses `{ player }`.

Alternative considered: two booleans such as `scaredOfPlayer` and `scaredOfEnemy`. Rejected because a set scales better if character categories expand and prevents invalid combinations of multiple configuration fields.

### Use Chebyshev distance only for detection

Fear detection uses `max(abs(column delta), abs(row delta))`, matching the user's three-horizontal, three-vertical, and three-diagonal boundary. If multiple enabled stimuli are in range, choose the closest by Chebyshev distance, then stable input order for ties, and retain that triggering snapshot through bounce and route planning.

Alternative considered: Euclidean or Manhattan distance. Euclidean would exclude the three-by-three diagonal boundary, while Manhattan would exclude many diagonal cells the user explicitly expects to count.

### Use bounded breadth-first grid search for flee routes

At bounce completion, choose an integer path budget uniformly from the inclusive configured range. Run breadth-first search from the sheep cell through four-directional neighbors up to that budget. A neighbor is walkable only when placing the sheep's collider at that cell center stays inside logical bounds and overlaps none of the existing full or polygon terrain colliders.

Collect destinations at the requested route depth that are farther from the retained threat than the start cell. Prefer the greatest Chebyshev separation, then use injected randomness among tied destinations. If none qualify, repeat at decreasing depths down to the configured minimum; if none increase separation, return to idle without movement. Parent links reconstruct the shortest cardinal route, naturally allowing a three-step route to turn around a corner.

Alternative considered: A* toward a preselected target. Rejected because there is no single known goal until reachable flee candidates have been evaluated, and the configured maximum depth of three makes bounded breadth-first search simpler and predictably cheap. A* can replace the search later without changing the spec if flee ranges become large.

### Move smoothly between cell-center waypoints

The navigation module returns grid cells; the sheep controller converts them to world-space cell-center anchors and advances toward one waypoint at a fixed configurable speed without overshoot. Each segment still passes through the existing collision-aware movement helper as a defensive check. The sprite flips on horizontal segments and uses the looping idle sheet during movement, since the supplied art has no run animation.

Alternative considered: teleport one cell per state tick. Rejected because the user expects visible running after the bounce lands.

### Keep integration data flow explicit

Expose the player's current position/grid cell through a non-mutating player getter or the existing update result, build a `player` snapshot in the main loop, and pass it with active delta to the sheep. Supply grid bounds, terrain colliders, and sheep collider geometry during creation so the sheep module remains independent of DOM and global state. Enemy snapshots are not supplied until enemies exist.

Keep the sheep at its existing spawn and shift the initial player spawn one 64-pixel grid cell left. This changes their starting Chebyshev separation from three to four cells, preserving the inclusive three-cell trigger while ensuring the sheep remains idle until the player approaches.

### Classify colliders and filter NPC-to-NPC blocking

Use a lightweight collider wrapper `{ type, collider }` for dynamic character and projectile blockers, with stable categories including `player`, `enemy`, `projectile`, and `npc`; terrain remains unconditionally blocking. The sheep circle uses the hero's 26-pixel radius and exposes a fresh world-space collider each frame. Navigation and continuous sheep movement combine terrain with current typed dynamic blockers but filter out `npc` entries. Player and projectile collision inputs include the sheep's collider so non-NPC motion cannot enter it. Future enemies can use the same typed-blocker contract.

Alternative considered: make only sheep movement avoid the player. Rejected because the colliders could still overlap when the player or a projectile moves into a stationary sheep, violating the bidirectional no-overlap requirement.

### Draw diagnostics by collider category

Extend character diagnostic drawing to accept a category/style and draw the sheep circle in yellow while retaining the hero's cyan style. Feed the sheep's current collider into diagnostics each frame so the visualization follows movement.

## Risks / Trade-offs

- [A threat can move during the bounce, making the retained flee direction slightly stale] -> Snapshot the triggering cell for one readable response; reevaluate current threats after the route ends.
- [A one-to-three-step bounded search may find no destination that increases distance in tight terrain] -> Use the documented shorter-route fallback and never trade collision safety for movement.
- [Collider-at-cell-center checks are conservative around partial polygons] -> Use the same runtime collider primitives as continuous movement so planning and rendering agree.
- [Using idle art while moving is less expressive than a dedicated run sheet] -> Keep animation selection isolated so a later run sheet can replace it without changing AI or navigation behavior.
- [Future moving obstacles can invalidate a planned route] -> Continue collision checks while moving and stop safely if a segment becomes blocked; dynamic replanning remains outside this change.
- [Bidirectional dynamic collision inputs can create frame-order sensitivity] -> Read fresh colliders at each mover update and use the same overlap primitives for both directions.

## Migration Plan

1. Add deterministic fear and bounded-grid navigation helpers with tests.
2. Extend the sheep state machine and controller while preserving its existing spawn position and animation assets.
3. Pass player and terrain context from the main loop and remove the timer-based bounce configuration.
4. Run unit, build, and real-browser acceptance checks at the current spawn.

Rollback is additive at the file level: revert the sheep integration to its timer state machine and remove the new navigation helpers/tests without changing asset or terrain data.
