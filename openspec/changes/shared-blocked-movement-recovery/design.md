## Context

See proposal.md for the observed stall. The goblin controller follows a route until it reaches each waypoint, without a progress deadline. Its runtime walkability callback currently supplies terrain, while actor movement also receives dynamic colliders. Other enemies use a patrol controller with a single-frame equal-position check; NPC navigation has separate policies. These paths need a shared recovery contract. The sampled spot alone does not establish the exact collider or segment responsible for the corner stall; implementation must capture actual position and rejected segment before treating a specific geometry defect as proven.

## Goals / Non-Goals

**Goals:** Put movement feedback, safe segment selection, and bounded retry scheduling behind an actor-neutral interface, with adapters for every autonomous locomotion policy. Preserve movement locks and policy-specific animations.

**Non-Goals:** Automatic steering of the human player, teleportation, disabling collision, changing art offsets, rewriting perception or attacks, and detecting a stalled browser/game loop.

## Decisions

### Share progress and recovery state across controllers

Introduce a small navigation recovery helper consumed by goblin, common enemy patrol, sheep, and any additional autonomous movement controllers found during the integration inventory. Inputs include active delta, actual collider center, intent, waypoint, movement permission, and movement outcome. Outputs are continue, replan, or wait plus a read-only diagnostic snapshot. Keep rendering and world lookup outside the helper. A goblin-only timeout would leave the same failure mode elsewhere.

Use a one-second active-time no-progress deadline, with immediate recovery on an explicitly rejected segment. Track improvement toward the same waypoint against its best distance with a small world-space epsilon (initially one pixel), rather than resetting on any position change. Repeated oscillation therefore cannot hide a stall. Reset tracking on actual waypoint completion or an accepted new route; do not reset merely because a controller issues the same intent again. Suspend and rebaseline during deliberate movement locks, pause, knockback, and intentional stationary behaviors.

### Make selection agree with physical movement

Provide actor-neutral queries for cell availability and traversal from actual collider position through a cardinal segment. Reuse the physical movement collision semantics, including partial terrain shapes and movement alignment, instead of independently approximating endpoint clearance. Supply current living blocking actors consistently to planning and execution; exclude self and inactive entities. Occupied destination spots are unavailable for recovery, while non-blocking pickups and sensors retain their existing rules.

Revalidate the immediate segment before commitment and use post-movement feedback for unexpected blockage. Process actors in stable update order and refresh occupancy after accepted motion; if two actors select the same future destination, execution revalidation must prevent overlap and send the blocked actor back through recovery. No global reservation system is introduced in this change.

Use the current authoritative collider-center/spot conversion; if the shared GridSpot implementation lands first, consume its API. Do not introduce another quantizer. The planning artifacts for the ongoing occupancy work and other active movement changes must be re-read before integration.

### Recovery is a bounded policy decision

Discard the failed route and movement intent, then search safe preferred alternatives using the existing injected random source. Exclude the failed directed segment for this decision and require a successful traversal revalidation before admitting it again. Cap graph search by finite grid cells and visit each cell at most once per search. Do not run candidate searches every frame.

If policy preferences produce no alternative, examine safe cardinal one-cell escape routes, including reversal. Relax minimum patrol length, home radius, and sheep flee-separation preference for this escape only. This deliberate priority means avoiding immobilization can briefly take a sheep toward its threat or an enemy outside its normal patrol radius. After reaching the escape waypoint, return to ordinary policy decisions and existing cooldowns. Collision and world bounds remain hard constraints.

When no safe route exists, stop and wait three seconds of active gameplay before a fresh bounded search. Keep this configurable and validate positive finite durations. A continuing enclosure repeats this wait. Attack/death transitions can supersede recovery; discard obsolete routes and retry state so movement cannot restart after death or a new policy decision. Ordinary idle, attack, bounce, and post-flee cooldown are not recovery failures.

### Observe actual progress without console flooding

Extend development snapshots using the existing debug-data pattern in main.js. Include actor ID/type, actual center, authoritative spot, intent, waypoint, state, reason, no-progress elapsed time, and retry remaining. Keep only the current snapshot and last recovery reason per actor; optional console output is transition-only. Browser sampling can then distinguish sub-cell progress from apparent grid-cell stasis. Production control flow must not depend on diagnostics.

## Risks / Trade-offs

- False stalls during slow movement or animation locks -> test progress thresholds against configured speeds; accumulate only when autonomous movement is both requested and permitted.
- Clear endpoints with obstructed alignment or intermediate geometry -> test traversal from off-center positions with real collision helpers and partial terrain colliders.
- Repeated failed choices or oscillation -> reject the failed segment until traversable, track best waypoint progress, and cover sole-exit and dynamic-blocker cases.
- Concurrent moving actors can invalidate a valid plan -> revalidate against current occupancy during execution; do not promise a destination stays free indefinitely.
- Physical enclosure cannot guarantee immediate movement -> represent an explicit stationary retry state and resume when an exit becomes available.
- Existing uncommitted work and overlapping OpenSpec changes -> inspect current files before apply, preserve unrelated edits, and integrate the prevailing spatial contract.

## Migration Plan

Add focused failing regressions, implement shared helpers, then integrate all autonomous policies and diagnostics. Verify live corner escape and temporary enclosure after unit/integration tests and the production build. No data migration or dependency installation is needed. If regression requires rollback, make an additive corrective change to recovery integration; do not discard unrelated work or rewrite Git history.
