## Why

Combat and NPC interactions are now being treated as direct gameplay mechanics, but there is no shared health model or consistent end-state behavior for entities that take damage. This means repeated contact and projectile hits can’t currently reduce viability or represent defeats in a deterministic way. A unified health and death system is needed before adding any meaningful combat balancing.

## What Changes

- Add health state to the hero, sheep, and goblin with a common starting value of 100.
- Add a centralized damage model that applies explicit per-interaction damage based on source and target types.
- Introduce contact filtering so the goblin applies melee damage only during its active swing damage phase.
- Add a shared death animation that freezes movement and animates scale and opacity from normal to zero over 250ms, while applying one-time random ±20° rotation.
- Ensure no health bars are shown; all health is represented as internal state.

## Capabilities

### New Capabilities

- combat-health-system: Defines health initialization, collision-based damage, and end-of-life animation for all characters.

### Modified Capabilities

- *none*

## Impact

- Gameplay loop in `src/main.js` for frame-updated interactions.
- Entity runtime modules for player, sheep, and goblin movement/animation ownership.
- Projectile update behavior in `src/projectile-renderer.js` and projectile creation/interaction flow.
