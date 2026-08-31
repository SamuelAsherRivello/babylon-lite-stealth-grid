## Context

See `proposal.md` for motivation and `specs/actor-ai-behaviors/spec.md` for the behavioral contract. Sheep currently plan and follow grid routes inside each actor instance. The integration supplies all sheep as dynamic colliders with type `npc`, but sheep walkability and running movement deliberately filter `npc` colliders out. Sequential per-sheep updates therefore operate from changing positions and can allow two sheep to choose the same route space.

The sheep already has a circular movement collider, a non-looping bounce animation, cardinal grid navigation, collision-checked movement, and stable actor IDs in the spawner records. Those are the primitives to reuse. Collision and pause behavior must remain authoritative, and contact handling must work for an arbitrary number of Tiled-spawned sheep rather than only a single hard-coded pair.

## Goals / Non-Goals

**Goals:**

- Make pair detection and response independent of sheep array/update order.
- Preserve one complete stationary bounce before contact-driven escape movement.
- Reuse collider-aware grid routing for separation rather than teleporting or pushing through geometry.
- Give coincident and multi-sheep contacts deterministic outcomes that are straightforward to test.

**Non-Goals:**

- Adding flock wandering, steering/boids simulation, mass, momentum, or physics-engine impulses.
- Adding a new sheep animation or changing bounce artwork/timing.
- Changing player/enemy fear distances, combat hitboxes, knockback tuning, terrain collision rules, or dead-actor lifecycle.
- Guaranteeing that both sheep can move when level geometry provides no safe separating route.

## Decisions

### Coordinate sheep contacts before individual movement updates

Add a small flock-contact coordination step that consumes stable sheep snapshots for the update: ID, living state, position, state, requested/active movement, and movement collider. It detects current contacts plus swept/requested pair conflicts, orders pairs by stable IDs, and emits at most one contact intent per affected sheep for the update. After intents are applied, individual sheep updates continue through their existing state and movement boundaries.

This avoids making the result depend on whichever sheep happens to update first. It also gives simultaneous contacts one place to suppress duplicate responses. Alternative considered: let each sheep inspect the live positions of all later sheep during its update. Rejected because the first mover would receive different behavior from the second and same-frame crossing conflicts would be difficult to resolve consistently.

### Represent contact as an actor command and a contact episode

Extend the sheep command/state boundary with a contact response that cancels its route, enters the existing `bouncing` state, and records the contacting pair episode. Both actors receive the command in the same coordinated phase. A pair remains latched while its colliders touch; separation clears the latch and rearms later contact.

Threat-triggered and contact-triggered bouncing share animation playback but retain different post-bounce route intents. This preserves the existing frightened behavior without pretending another sheep is a player/enemy threat. Alternative considered: add sheep to the fear profile. Rejected because radius-based fear would trigger before contact, affect only the perceiving sheep, and would not guarantee reciprocal opposite directions.

### Derive one stable separation axis per pair

For distinct collider centers, choose the dominant center-to-center axis and orient it from the lower stable actor ID toward the higher ID. The two actors receive inverse cardinal direction preferences along that axis. For coincident centers, derive a horizontal or vertical fallback from a stable hash/parity of the ordered pair IDs; swapping update order cannot change it.

After the bounce, each sheep asks the grid planner for a short safe route whose first step follows its preferred direction and increases distance from the partner's current collider. If that exact first step is blocked, the planner may select another safe cardinal first step that increases separation. If none exists, the sheep stays put. Alternative considered: apply equal continuous impulses along the raw center vector. Rejected because diagonal impulses do not match the established cardinal route model and can push colliders into terrain or bounds.

### Make other living sheep authoritative dynamic blockers

Remove the blanket exception that ignores `npc` colliders for sheep route planning and running movement. Pass each sheep the living flock collider set excluding its own stable ID. Route candidates and every movement step must validate against the latest reserved/current flock positions. The coordinator reserves accepted next positions in stable actor order so two sheep cannot both claim the same space in one update.

Alternative considered: allow overlap during the bounce and separate afterward. Rejected because it preserves the visible defect and makes coincident recovery more ambiguous. Existing invalid coincident starts are handled as a recovery case: no new movement may deepen the overlap, the contact episode is created, and safe separating movement begins after the bounce.

### Keep pair detection pure and testable

Implement pair ordering, contact/swept-conflict detection, stable-axis selection, latch transitions, and movement reservation as pure helpers. Actor integration tests then verify route cancellation, animation completion, safe escape, pause behavior, and collider updates. This separation keeps Babylon rendering out of the behavioral core and permits exact tests for coincident and three-sheep cases.

## Risks / Trade-offs

- [Dense groups can have no immediately valid opposite routes] → Prefer exact opposite first steps, fall back only to other separation-increasing safe steps, and leave blocked sheep stationary for later reevaluation.
- [Discrete movement can tunnel through another sheep at a large delta] → Detect swept/requested pair conflicts before committing positions, not only overlap at final positions.
- [Sequential position reservation introduces stable-ID priority] → Make that priority explicit and deterministic; pair response remains reciprocal even when only one safe move can be accepted.
- [A contact latch can become stale when an actor dies or despawns] → Prune pair episodes whenever either stable ID is absent or no longer living.
- [Contact and external knockback can compete] → Keep collision safety authoritative; contact cancels AI routes, while existing knockback ownership is preserved and its movement is also checked against living sheep.
- [Changing NPC blocking may invalidate existing flee paths] → Add focused regression tests for player/enemy fear behavior and safe route fallback before browser tuning.

## Migration Plan

1. Add pure flock-contact and movement-reservation behavior with unit tests.
2. Extend the sheep state/command path to distinguish contact bounce completion from threat bounce completion.
3. Supply stable IDs and self-excluding living sheep colliders through the multi-actor integration.
4. Enable sheep blocking for planning, normal route movement, and knockback; then run focused and full automated verification.
5. Verify in a real browser with two sheep meeting head-on, coincident/adjacent authored starts, blocked edge contact, and a three-sheep cluster.

Rollback is code-only: remove the contact coordinator/episode state and restore the prior NPC-collider filtering. No assets, dependencies, persisted data, or authored level format require migration.
