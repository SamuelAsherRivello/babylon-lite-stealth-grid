## Context

See proposal.md for motivation. Hiding currently uses combat-collider overlap in `player-hidden.js`; `main.js` applies perception state, opacity, and render order. Bush `interactionPosition` is the combat collider center, whereas artwork has an independent offset. The player owns movement, collision handling, and GridSpot updates. Its existing `setInputEnabled(false)` clears input, which would prevent seamless continuation of held movement.

This design is needed because entry detection, actor movement, and presentation span multiple modules.

## Goals / Non-Goals

**Goals:** Keep one authoritative player position, frame-rate-independent interpolation, and explicit per-bush entry history. Make gravity movement composable with existing movement restrictions.

**Non-Goals:** Physics simulation, changes to bush artwork or collider geometry, enemy centering, global GridSpot redesign, or changes to attack and item controls.

## Decisions

The user calls the threshold **minimum distance**. Set it to 0.75 of the configured grid width and require Euclidean distance to the bush center to be strictly smaller. At or beyond the threshold, an unconsumed entry stays eligible while the player walks closer inside the collider. After a pull, full exit is still required to rearm.

1. **Use a small entry/pull controller.** Track previous bush overlaps, consumed entries, and at most one active pull containing bush identity, start center, target center, and elapsed active time. Select simultaneous entries in existing decoration order. Observe every overlap even during a pull so they cannot become deferred entries at completion. Rearm each bush only on full exit. A hidden/default toggle alone cannot represent moving within the bush or overlapping bushes.

2. **Use a deterministic accelerating interpolation.** Set progress to `min(1, elapsed / 0.125)` and interpolate both coordinates with `progress * progress`. Complete with the exact destination. This is the initial experiment's easing choice; simulated gravity would make arrival time and overshoot harder to control. Already-centered entries complete immediately.

3. **Keep movement input capture active.** Add a temporary gravity movement path inside the player update, suppressing ordinary locomotion without clearing keys or joystick state. Continue action/lifecycle updates and preserve other movement locks. Reset any pending quantized movement route at pull start and end so it cannot restore an old destination. Keyboard key-up and joystick releases must continue to be consumed.

4. **Move the actual world center.** Use the bush interaction center, never its sprite origin or art offset. Refresh GridSpot, colliders, sprite placement, and depth from the resulting player position. Detect eligible entry after normal movement, then let the pull own following movement updates. Refresh overlap-dependent perception and hiding from current colliders after movement rather than cached pre-movement geometry.

5. **Respect blocking geometry and interruption.** Use the existing collision rules for each requested displacement. If a blocking collider prevents reaching the requested interpolation position, cancel at the last reachable position and retain the consumed entry until exit; do not tunnel or hold input indefinitely. Normal unobstructed entry satisfies the fixed duration and exact-center contract. Death, missing/dead bush, reset, and knockback also cancel; knockback wins over interpolation. These are defensive integration defaults, not new immunity or combat rules.

## Risks / Trade-offs

- Accelerating motion ends with an abrupt stop -> keep duration short and verify the feel in-browser.
- Quantized movement or stale collider snapshots can undo centering or delay hiding -> reset movement routes and refresh spatial state before perception/presentation.
- Overlapping bushes can cause repeated pulls -> record all overlap edges, select one target, and never queue entries during a pull.
- Collision geometry can obstruct the center -> cancel cleanly rather than pass through blockers; verify a normal bush provides a reachable destination.
- Existing working-tree changes affect these same modules -> re-read current code at implementation time and keep edits scoped to C059.

## Migration Plan

No data migration or dependency changes. Implement controller and focused tests, integrate player movement and hiding, then verify keyboard and touch behavior in the running game. If the experiment is rejected, remove its integration with an additive follow-up change while preserving unrelated work.



After successful arrival, retain the movement lock for 0.25 seconds of active gameplay time. Preserve held input during this hold; cancellation clears it immediately. Any arrival-frame overshoot counts toward the hold.
