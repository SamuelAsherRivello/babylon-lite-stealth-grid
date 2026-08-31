## Context

See `proposal.md` for motivation and the delta specs for the behavioral contract. Bushes are currently normalized as independent `ReactiveDecoration` objects with a pass-through character sensor, one sprite layer, and local rustle state. Combat health and the shared death transform are composed around spawned character records in `main.js`; they are not reusable by decorations yet. Particle effects are reusable classes, but their catalog defaults loop and their playback API has no completion-aware one-cycle mode. The current runtime also still connects goblins to a scripted phase controller even though the main `actor-ai-behaviors` spec requires target-aware patrol decisions.

The 64-pixel logical grid uses origin-relative level cells. Bush targeting must preserve that coordinate contract when deriving an authored bush cell and adjacent route goals.

## Goals / Non-Goals

**Goals:**

- Treat a bush as a non-blocking, damageable world target without turning it into a character or spawner-owned actor.
- Make bush burning a low-priority extension of the specified goblin patrol policy.
- Reuse one combat/death state model across characters and bushes while allowing lethal fire presentation to finish before visual death.
- Reuse Fire 3 for looping previews and completion-aware gameplay cycles.
- Keep every bush placement, effect, collider, health value, and lifecycle independent.
- Establish one collider-center coordinate contract for character grid occupancy, bush interaction cells, and Y-derived Z sorting.

**Non-Goals:**

- Making bushes block movement, navigation, or projectiles.
- Allowing players, arrows, sheep, warriors, or ordinary contact to damage bushes.
- Adding fire spread, damage over time, persistent burning, regeneration, loot, respawning, health UI, target reservations, or saved destruction state.
- Expanding goblin sensing beyond whole-map bush search and the already specified player/sheep combat rules.

## Decisions

### Extend reactive decorations with optional damageable-world-target composition

Keep the existing sensor and rustle state inside each reactive decoration, then compose an optional combat state for definitions that declare a combat collider and health. The runtime record exposes stable identity, position/cell, living/terminal state, combat collider, damage entry point, visual transform, and disposal. It does not expose character locomotion or enter character collections.

Alternative considered: convert bushes into spawner actors. Rejected because bushes are authored props, do not move or respawn, and should not acquire character inputs, movement colliders, animation catalogs, or population ownership.

### Author a second collider role without changing pass-through behavior

Add a distinct axis-aligned combat shape to the reusable bush Tiled definition and normalization contract. Preserve `blocking: false`; exclude the combat shape from terrain obstacles, route blockers, projectile obstacles, and entry sensing. Include it only in attack targeting, hit resolution, and collider diagnostics.

Alternative considered: reuse the existing sensor as the damage shape. Rejected because sensing and vulnerability are separate roles with different validation, diagnostics, and future geometry needs.

### Generalize combat state and add a terminal-presentation gate

Extract or adapt the current combat wrapper so its starting health, callbacks, knockback, and terminal presentation can be configured. Characters retain immediate death at zero. Bushes use 100 health, no knockback, and a terminal gate: zero health immediately makes the bush nonliving, but `startDeath` waits for the lethal Fire 3 completion notification. The same 250 ms transform then drives the bush sprite.

This separates logical death from visual removal and prevents another goblin from selecting or damaging a zero-health bush while it finishes burning.

Alternative considered: delay the second damage event until Fire 3 completes. Rejected because the swing should resolve damage at its committed hit event and the target must become unavailable immediately.

### Make bush hits event-based rather than raw persistent overlap

Carry a stable target ID and attack-start direction through the goblin's atomic swing. Resolve at most one bush hit for that swing at its established damage event/window, using the bush combat collider as validation. Record the swing/target pair or consume a one-shot hit event so multi-frame overlap cannot apply repeated damage.

Alternative considered: reuse the current contact-pair set alone. Rejected because recovery can retain or re-enter overlap and because explicit per-swing semantics are easier to test and extend.

### Add bush diversion at the patrol-decision boundary

Reconcile the runtime with the existing target-aware AI contract before adding the diversion. At a fresh decision, character attack eligibility is evaluated first. Only when no character attack starts does the policy draw one deterministic random value. Values below 0.25 request bush search; all others use the existing home-bounded patrol selection.

Bush search enumerates all living bush snapshots, derives the four cardinally adjacent candidate cells for each, filters those cells through the shared goblin walkability check, and uses bounded breadth-first route discovery across the logical map. Choose the target with the shortest route, with stable snapshot order for ties. Whole-map permission applies to selecting bushes, not normal patrol destinations.

Alternative considered: run a timer or scan every frame. Rejected because the user chose a 25 percent patrol-decision chance, and per-frame searches would be both behaviorally wrong and needlessly expensive.

### Use collider centers as authoritative spatial points

For every character, derive the logical cell from the current movement collider's center and derive Y-sorted layer order from that same center Y. For bushes, derive the interaction cell from the center of the authored combat collider. These comparable points are the sole inputs to bush route goals, arrival, cardinal adjacency, and attack-facing decisions.

Route waypoints remain logical cell centers for the goblin movement collider. Convert a selected cell center into the actor position required to place the movement-collider center there; do not use artwork bounds, combat geometry, or raw actor-position cells to decide arrival. Recompute the movement collider after movement and require its center cell to be exactly one Manhattan step from the bush combat-center cell before starting a swing. The attack direction is the exact cardinal cell delta. Projected hit geometry remains a secondary validation after adjacency succeeds.

The main render loop and each character module must not compete over depth using different anchors. Both initial and per-frame character layer order use movement-collider center Y; decoration depth remains based on its own authored presentation contract.

Alternative considered: use artwork pivots or raw actor positions as ground anchors. Rejected because character artwork has character-specific and animation-specific padding, while the user explicitly selected the movement collider center as the grid and depth point. Alternative considered: compensate mismatched anchors with tolerances. Rejected because tolerances allowed diagonal-looking and two-cell-looking attacks without resolving the underlying coordinate mismatch.

### Reevaluate rather than reserve targets

Multiple goblins may independently select the same bush. On arrival and after every recovery, the controller first reevaluates higher-priority character combat and then verifies that the captured bush ID is still living and adjacent. A stale, destroyed, or unreachable target clears the route and returns the controller to a normal decision state.

Alternative considered: reserve each bush for one goblin. Rejected because reservation ownership, release, and fairness add state that is unnecessary for playful environmental behavior.

### Add explicit one-cycle playback without changing preview defaults

Extend reusable particle playback with per-call or per-instance loop selection and a completion callback. A bush owns one lazily created Fire 3 instance. Each accepted hit restarts it from frame zero in non-looping mode; the first completion returns it to an inactive presentation, while the lethal completion releases the death gate. Preview instances continue using catalog-default looping behavior.

Alternative considered: create a separate Fire 3 gameplay class. Rejected because atlas metadata, positioning, playback control, and resource lifecycle are the same effect and should not diverge.

## Risks / Trade-offs

- [The current runtime does not implement the already archived target-aware goblin patrol design] -> Make AI/spec reconciliation the first implementation slice and prove existing patrol/combat requirements before adding bush decisions.
- [Whole-map breadth-first searches can multiply with many goblins and bushes] -> Search only on a successful 25 percent decision, reuse shared reachability results where practical, and never scan per frame.
- [A non-blocking bush permits the goblin or another actor to overlap its artwork] -> Require the bush-seeking route to end on a cardinally adjacent cell and validate the target again before swinging; preserve pass-through behavior for all other movement.
- [Character movement colliders have different offsets from their artwork positions] -> Centralize cell and depth derivation on movement-collider centers and test every character with its real collider geometry.
- [Rustle and Fire 3 may animate the same bush simultaneously] -> Keep their animation handles independent; fire does not reset or cancel rustling, and death disposal stops both safely.
- [A particle completion callback may fire after disposal] -> Guard callbacks with instance lifecycle and target generation/state checks, and detach them during teardown.
- [Renderer layers added per bush effect can leak or sort incorrectly] -> Give each bush explicit effect-layer registration/removal and cover dynamic disposal and viewport scaling in integration tests.

## Migration Plan

1. Reconcile the runtime goblin controller with the existing actor-AI main spec and retain deterministic policy seams.
2. Extend bush authoring/normalization with a non-blocking combat collider while retaining existing map placements and sensor behavior.
3. Generalize combat/death state and reactive-decoration lifecycle, then add one-cycle Fire 3 playback.
4. Integrate snapshots, whole-map target selection, routing, hit resolution, delayed bush death, diagnostics, and renderer teardown.
5. Run focused tests, the full suite and production build, then verify the complete two-swing flow in a real browser with multiple bushes and goblins.

Rollback is additive: disconnect bush snapshots from goblin policy, remove bush combat composition/effect layers, and retain the original reactive sensor and rustle behavior. No stored data or authored placement migration must be reversed.
