## Context

See proposal.md - Why. The current actors render Babylon Lite sprites and implement movement collision in `moveWithCollisions()` and manual overlap checks. The game uses 2D pixel coordinates, so a bounded custom solver is sufficient.

## Goals / Non-Goals

**Goals:**

- Establish one bounded 2D solid movement-collider contract.
- Use non-trigger green shapes for terrain and character separation.
- Use separate red trigger shapes for combat overlap events.
- Preserve existing actor APIs and debug visualization where practical.
- Bound physics work and retain diagnostics for failures.

**Non-Goals:**

- Rebalancing enemy AI or attack ranges.
- Adding physical forces, ragdolls, or visual physics effects.
- Replacing the existing sprite renderer.

## Decisions

- Use the existing collision geometry with deterministic circle separation and bounded iterations; do not add Havok or another runtime.
- Resolve existing penetration before movement, then reject proposed moves entering another green collider.
- Keep combat sensors separate from movement shapes and mark them as triggers. This avoids red attack areas changing locomotion.
- Define collision membership/mask categories for terrain, movement bodies, combat triggers, and projectiles. This prevents accidental cross-role blocking.
- Centralize separation before gameplay movement, then synchronize corrected actor positions and diagnostics.
- Retain a bounded diagnostic watchdog only as telemetry; it must not be the separation mechanism.

Alternatives considered: Havok was rejected because this 2D game does not require its WASM runtime and scene-node integration; making combat colliders solid was rejected because attacks must overlap without moving characters.

## Risks / Trade-offs

- [Risk] Existing custom world coordinates are 2D pixel units while Havok uses world units. → Mitigation: define one scale conversion and use it consistently for body transforms, shapes, and debug output.
- [Risk] Existing actor animation callbacks expect direct movement updates. → Mitigation: keep actor-facing movement/update methods and synchronize physics results at the adapter boundary.
- [Risk] Trigger event timing may differ from current per-frame overlap checks. → Mitigation: add event-driven combat tests and preserve hit-once/cooldown rules.
- [Risk] Dense groups may exceed the solver budget. → Mitigation: deterministic ordering, a fixed iteration cap, safe stopping, and diagnostics.

## Migration Plan

1. Add physics world and role/category helpers behind actor adapters.
2. Migrate terrain and one representative character, then validate separation and trigger events.
3. Migrate all player/enemy/NPC actors and remove manual movement-collider blocking from the active path.
4. Run focused tests, production build, and browser smoke verification with collider diagnostics enabled.

Rollback is limited to reverting the implementation commit; no persistent data migration is required.
