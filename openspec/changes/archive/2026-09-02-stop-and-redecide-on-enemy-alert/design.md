## Context

See proposal.md for motivation. The current reaction model changes awareness and invokes face/move callbacks, but its runtime `onStateChange` only plays sound. Runtime `onMoveTo` writes a cardinal intent directly, while the enemy update loop independently runs the normal controller before actor movement. Consequently normal policy can overwrite reaction intent. The common patrol controller already exposes cancellation; specialized goblin and warrior policies require an integration inventory. Existing uncommitted occupancy and recovery work must be preserved and re-read before apply.

## Goals / Non-Goals

**Goals:** Establish one shared movement-ownership boundary and a testable entry ordering for all enemy adapters, not isolated fixes per character.

**Non-Goals:** Redesign perception thresholds, combat policy, search profiles, pathfinding, expression art, sound, movement speed, player/NPC behavior, or grid geometry. A fresh decision need not choose a different direction if the evidence supports the same direction.

## Decisions

### Separate state entry from evidence refresh

Use the central actual-state-transition boundary for every non-`NONE` entry, including timed de-escalation and debug-forced changes. First invalidate obsolete navigation and zero intent, then select the new response using the updated perception snapshot. Do not use every detection callback as an entry signal: repeated visual confirmation must refresh the target without freezing pursuit. Ensure debug reset/return to `NONE` releases ownership even if it bypasses ordinary transition notification today.

### Make the stop survive one active locomotion update

Keep an entry-interruption latch and a pending response in a shared runtime adapter. Entry cancels normal controller navigation/recovery and clears current actor intent immediately. The next eligible active actor movement update consumes the latch with zero autonomous movement and no walking presentation; only a later update can execute the pending response. Zero-delta/paused updates do not consume it, and movement-locked actions retain priority. Coalesce multiple state changes before movement to the latest state/target, never execute a stale intermediate response.

This gives a real stationary update instead of calling stop and move synchronously with no visible locomotion effect. No fixed wall-clock pause is proposed: this is an interruption and new decision, not a stun. Browser verification must confirm the resulting notice-and-redirect behavior is readable; if a longer held pose is desired, obtain a separate timing decision rather than silently changing combat balance.

### One owner chooses autonomous movement

Normal controllers may issue movement only in `NONE`; reaction behavior owns locomotion otherwise. Keep actor updates running for animation, attacks, collisions, and lifecycle handling rather than freezing the whole actor. Route state-specific facing, investigation, and pursuit through the current safe movement/recovery interfaces and authoritative GridSpot coordinates. Do not derive pursuit from the live player position without accepted evidence. Repeated target refreshes update the active reaction decision without canceling it as a new entry.

Use a shared adapter with minimal cancellation hooks for specialized controllers. Reject per-character copies of entry logic and a one-time zero-intent callback alone: neither prevents later controller overwrites. Cancellation must discard stale route, waypoint, retry timer, and queued movement. On return to `NONE`, normal policy starts a fresh decision; protected attacks are not canceled. Dead/disposed actors clear pending work.

## Risks / Trade-offs

- [Update-order sensitivity] Perception currently runs after actor movement. -> Guarantee no further old-intent movement after the event is accepted, and test complete consecutive runtime updates, not just callback order.
- [Specialized policy side effects] Skipping a controller might also skip non-movement work. -> Inventory each enemy adapter and gate only normal locomotion decisions while preserving combat/lifecycle behavior.
- [Repeated events or short state timers] Pending responses can become obsolete before execution. -> Associate pending work with the latest state and cancel it on replacement, reset, or death.
- [Off-center stops and blocked targets] Immediate stopping can occur mid-cell. -> Preserve the live world center; reuse current cardinal collision-safe routing and recovery without teleportation.
- [Concurrent changes] Movement and occupancy files are already modified. -> Re-read their prevailing interfaces during apply and keep changes additive and scoped.

## Migration Plan

1. Inventory all runtime enemy controller adapters and add failing entry-order and full-update regressions.
2. Add central entry signaling, shared interruption/ownership handling, and minimal controller cancellation adapters.
3. Verify transition, refresh, recovery, lock, and lifecycle cases; run the full test suite and build.
4. Verify moving enemies in the browser using audio and visual detections, escalation, and recovery. Capture stationary entry and subsequent state-appropriate motion for every supported enemy type.

No data migration or dependency installation is required. Any rollback is an additive corrective patch; do not discard user edits or rewrite history.
