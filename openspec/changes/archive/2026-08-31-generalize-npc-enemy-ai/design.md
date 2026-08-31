## Context

See `proposal.md` for motivation and `specs/actor-ai-behaviors/spec.md` for the behavior contract. The sheep currently combines a pure fear state machine, bounded breadth-first flee planning, waypoint following, and sprite control. The goblin has a pure animation/locomotion state machine but receives intent from a fixed demo phase list that walks in four directions and swings on a schedule. `main.js` owns active-time updates, living combat state, actor snapshots, terrain colliders, and dynamic colliders.

The existing sheep planner already proves the useful grid primitives: collider-at-cell-center walkability, four-neighbor traversal, route reconstruction, injected randomness, and collision-checked smooth waypoint motion. Those mechanics are reusable, but sheep fear selection and goblin target/patrol selection are different policies.

## Goals / Non-Goals

**Goals:**

- Make the relationship `world snapshot -> policy decision -> actor state -> animation/movement` explicit and independently testable.
- Reuse navigation and timing mechanics without erasing meaningful sheep and goblin state differences.
- Ensure a goblin swing has a perceived target, stable attack direction, and readable recovery window.
- Preserve compatibility with current collision, pause, combat-liveness, and sprite APIs.

**Non-Goals:**

- A generic behavior-tree framework, ECS conversion, utility-scoring package, or navigation mesh.
- Long-range pursuit, line-of-sight, hearing, group tactics, aggro memory, or patrol authoring in Tiled.
- Changing damage amounts, hit windows, health, death behavior, or attack artwork.
- Dynamic route repair beyond stopping safely and requesting a new policy decision.
- Making sheep wander when unthreatened.

## Decisions

### Centralize mechanics and keep actor policies separate

Create a small `src/ai/` boundary for pure actor-neutral mechanics: range/timer selection, grid walkability, bounded route search, destination sampling, and waypoint-route advancement. Create sheep and enemy policy/controller modules beside their actors. A policy consumes a world snapshot and returns or applies semantic intent such as `wait`, `flee(route)`, `patrol(route)`, or `attack(targetId, direction)`; the actor remains responsible for legal state transitions and animation playback. Cooldown and recovery timers advance only from active gameplay delta.

This is intentionally not a universal state machine. `idle` is common, but sheep `bouncing/running` and goblin `walking/attacking` have different completion semantics. Sharing a state enum or generic transition table would couple future actors to states they do not possess.

Alternative considered: copy the sheep controller and navigation into the goblin folder. Rejected because walkability, route reconstruction, waypoint stepping, bounds validation, and random-range behavior would immediately diverge in two copies.

Alternative considered: one centralized controller that owns every state and animation callback. Rejected because it would need actor-type branches and would make sprite lifecycle and AI decisions mutually dependent.

### Use a stable world-snapshot boundary

On each active gameplay update, the coordinator builds current actor snapshots with stable IDs, type, living flag (or filters out nonliving actors), position, grid cell, and collider. Each AI controller receives its own actor snapshot, perceived entity snapshots, grid/terrain context configured at creation, and dynamic blockers for the current update. Policies never reach into `player`, `sheep`, `goblin`, combat-state, or DOM objects.

The target reference captured for an attack is an ID plus attack-start direction, not a mutable actor object. This keeps the current attack atomic. On animation completion the controller requests a fresh snapshot before making another decision.

Alternative considered: pass actor instances directly. Rejected because it couples policy tests to rendering/lifecycle APIs and makes dead-target filtering inconsistent.

### Generalize the sheep grid primitives before adding patrol

Move `gridCellCenter`, collider-aware walkability, neighbor traversal, route reconstruction, and inclusive integer/range selection out of `sheep-navigation.js`. Retain a thin sheep flee planner that ranks reachable cells by increasing distance from its threat. Add a patrol planner that enumerates safely reachable cells within configured minimum/maximum path depth, randomly selects among candidates, and reconstructs the shortest route to the selected cell.

Breadth-first search remains appropriate because the grid is small, traversal is unweighted, and both flee and patrol searches are bounded. The shared search returns reachability metadata; each policy owns destination ranking. This is more reusable than trying to make one function understand both “farther from threat” and “random reachable patrol point.”

Alternative considered: A*. Rejected for now because patrol has no goal until reachable candidates are known and the existing bounded breadth-first logic already fits both policies.

### Use route path distance, not straight-line distance, for patrol selection

Patrol configuration uses inclusive minimum and maximum route steps. Candidate destinations must be reachable within that path budget; a visually nearby cell on the other side of a wall is therefore not accidentally selected. The default values should be kept as named configuration at the goblin spawn rather than hidden in the planner; implementation can begin with a conservative short range such as two to five steps and tune it during browser verification without changing the contract.

When no candidate exists, the goblin re-enters idle with a new delay. It does not oscillate every frame trying the same failed search.

Alternative considered: choose a random coordinate in a radius and then pathfind. Rejected because repeated unreachable samples produce biased or stalled behavior.

### Confine patrol to a spawn-centered home radius

Capture each enemy's immutable spawn cell when its behavior controller is created. Patrol candidates must satisfy both the configured route-step range and the configured inclusive Chebyshev distance from that spawn cell. The initial goblin uses a four-cell home radius: the current portrait grid is 9 by 16 cells at 64 pixels per cell, so four cells equal 256 pixels and approximately one quarter of the 1024-pixel screen height.

The home origin does not move after combat interruptions or route failures. This prevents successive current-position-relative patrol decisions from producing unbounded map drift while retaining a simple editable radius for later enemy types.

Alternative considered: clamp each patrol relative to the current position. Rejected because repeated legal short patrols would eventually move the goblin anywhere on the connected map.

### Give perception/attack priority over idle and patrol

At each non-attacking update, the goblin first queries living attackable snapshots (`player` and `npc` sheep) within a configurable melee distance. The nearest target wins, with stable snapshot order for ties. If a target exists, the controller clears the route and requests one directional attack. Otherwise it advances an active patrol route or its idle timer.

The initial melee distance is configured at integration, expressed in grid cells and inclusive. One cell is the recommended starting value because it means adjacent-grid proximity and avoids remote swings; browser tuning may instead derive a short collider-aware reach if the current collision spacing makes adjacency visually misleading. That tuning must retain the spec rule that only an in-range target can trigger a swing.

Attack completion does not automatically restore the pre-attack patrol. It enters `recovering` for a configurable active-time duration; the initial goblin uses 0.75 seconds. Recovery locks movement and rejects new attack requests. When recovery completes, the controller reevaluates: attack again if a current target still qualifies, otherwise begin a fresh idle interval. Discarding the old route avoids walking toward an obsolete destination after combat interruption.

Alternative considered: chase any perceived target until it reaches melee range. Rejected because the request scopes pursuit to close-distance attacks and patrol; adding chase changes gameplay and needs its own later proposal.

### Keep animation state ownership in the actor modules

The sheep state machine gates `idle -> bouncing -> running -> cooldown -> idle`, including the non-looping bounce callback and a one-second default cooldown advanced with active gameplay time. The initial sheep's fear profile includes both `player` and `enemy`; cooldown deliberately suppresses perception briefly so this easy, simple character can be caught. The goblin enemy state machine gates `idle/walking/attacking/recovering`, movement lock, non-looping attack completion, and a 0.75-second default recovery. AI controllers request actions through narrow actor commands and observe completion signals; they do not call sprite APIs or select atlas frames.

The goblin attack command continues to normalize the captured direction by dominant axis. Walking animation and facing are driven by waypoint movement intent. Sheep continues using idle artwork while running until dedicated run art exists.

Alternative considered: treat animation as a passive mapping from a generic AI state string. Rejected because non-looping animation completion is already a real transition event and must remain part of each actor's legal state machine.

### Replace rather than retain the goblin demo controller

Remove the scripted phase table and update main integration to use the goblin behavior controller. Keeping both paths behind a flag would double the behavioral contract and risk scheduled attacks reappearing. Unit tests that currently assert the demo sequence are replaced with decision tests proving idle timing, reachable patrol selection, attack priority/direction, no-target no-swing behavior, and post-attack reevaluation.

## Risks / Trade-offs

- [The current main loop has singular player, sheep, and goblin variables while entity spawner work may introduce collections] -> Define snapshots and policies around arrays and stable IDs now, so singular integration is only an adapter and later collection migration does not change AI rules.
- [A melee range measured only by occupied cell can look too near or too far for large 192-pixel art] -> Keep detection configuration explicit and test the selected value in the real browser against collider spacing; do not expand into a swing unless an eligible target actually qualifies.
- [The current goblin collision rules may prevent collider overlap, while combat damage uses overlap during attack] -> Keep attack choice separate from hit resolution; this change guarantees target-aware swings but does not silently alter the parallel combat-health contract.
- [Multiple autonomous actors can repeatedly run bounded searches] -> Search only when entering patrol/flee or replanning after blockage, cap depth by configuration, and avoid per-frame full-grid searches.
- [Animation callbacks and AI update order can cause duplicate decisions] -> Queue a single completion signal and consume it on the next active AI update; make attack requests idempotent while attacking.
- [A target can die or move during an atomic attack] -> Preserve the visual swing direction, then discard its snapshot and reevaluate living current entities at completion.
- [Cooldown or recovery can accidentally advance while paused] -> Feed both timers only the existing active gameplay delta and cover paused updates with deterministic tests.
- [A four-cell circular home bound uses the screen height as the quarter-screen reference] -> Keep the value explicit as `4` grid cells and test candidate inclusion directly instead of deriving it from changing viewport CSS dimensions.

## Migration Plan

1. Add pure shared grid-search, walkability, timing, and waypoint helpers with deterministic tests.
2. Adapt sheep navigation/controller code to the shared mechanics, both threat types, and the short cooldown while keeping all existing sheep behavior tests passing.
3. Add the goblin policy/controller tests for idle timing, spawn-centered patrol bounds, patrol paths, target selection, attack interruption, recovery, and completion reevaluation.
4. Connect goblin policy intent to the existing enemy state machine and directional animation command.
5. Replace the demo controller in `main.js` with living actor snapshots and the new AI controller; remove the scripted controller and obsolete tests.
6. Run the full unit suite and production build, then verify in a real browser that the sheep's short cooldown leaves it catchable, the goblin stays within four cells of home while patrolling around blocked tiles, and every observed swing is aimed at a nearby living player or sheep with a readable recovery before another swing.

Rollback is additive: restore the goblin demo integration and sheep-local navigation module while removing the new `src/ai/` imports. No saved data or asset migration is involved.
