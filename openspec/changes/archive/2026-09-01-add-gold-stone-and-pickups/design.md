## Context

The runtime already normalizes Tiled tile objects, renders sprite layers, routes projectile colliders, and uses explicit lifecycle state for character and reactive-object death. The design must preserve bottom-centered authored placement and the repository's origin-relative level coordinates.

## Goals / Non-Goals

**Goals:**
- Add a reusable object lifecycle for Gold Stone and Gold Pickup instances.
- Keep editor placement, collision geometry, rendering, animation, and disposal independently testable.
- Reuse existing projectile collision and sprite tween conventions.

**Non-Goals:**
- Currency, inventory, score, or persistence across level loads.
- Pickup effects for sheep, enemies, projectiles, or future actors.
- Random respawning after destruction.

## Decisions

- Use one GoldStone tileset item with two runtime variant image paths; select the variant per spawned instance so Tiled exposes one object type while runtime appearance varies.
- Represent the 9-grid destination as origin cell plus one of the eight offsets. Shuffle valid offsets and take the requested count to guarantee distinct destinations.
- Separate spawn animation state from pickup collection state. The walk collider is active from creation, so collection can interrupt the tween; collection transitions directly to PickupObjectDeath.
- Create drops only after Gold Stone ObjectDeath completes, keeping the authored stone visible during its full death animation and making drop timing deterministic.
- Keep Gold Pickup objects player-only and side-effect free; their lifecycle is independent of the Gold Stone after creation.

## Risks / Trade-offs

- [Risk] Three valid neighboring cells may not exist near boundaries or obstacles -> validate and reroll destinations, then reduce only the safely placeable count.
- [Risk] Existing projectile routing assumes actor records -> add a generic damageable-object target path without changing existing actor damage values.
- [Risk] Tween and animation-manager callbacks can outlive a destroyed object -> cancel active handles during disposal and ignore late callbacks.

## Migration Plan

Add the new tileset and object to the existing Level01 map. Existing levels without Gold Stone objects remain unchanged.
