## Why

Multiple sheep currently treat other NPC colliders as passable, so their flee routes and movement can place them on top of one another. Sheep need readable flock-to-flock contact behavior that keeps their bodies separate and makes a collision visibly change their motion.

## What Changes

- Treat every other living sheep as a dynamic movement blocker during route planning and route following.
- Prevent sheep movement from ending in overlap with another living sheep, including when more than one sheep moves during the same update.
- When two sheep touch, make the involved sheep play their existing bounce reaction and then run in opposite, separating directions.
- Resolve already-touching or coincident sheep deterministically so they can separate without jittering, repeatedly retriggering the same contact, or crossing terrain and map boundaries.
- Preserve the existing frightened response to players and enemies; sheep contact becomes an additional reaction rather than a replacement for threat-driven fleeing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `actor-ai-behaviors`: Extend sheep navigation and state behavior with sheep-to-sheep separation, contact-triggered bouncing, and opposite-direction escape movement.

## Impact

- Affects sheep policy/state, navigation, movement collision handling, and the multi-sheep update coordination in `src/npc/sheep/` and `src/main.js`.
- Extends sheep unit, navigation, controller, and integration coverage for non-overlap, reciprocal contact reactions, constrained separation, and stable multi-sheep updates.
- Reuses the existing sheep movement collider and bounce artwork; no new runtime dependency, asset, save-data migration, or public input/UI change is expected.
