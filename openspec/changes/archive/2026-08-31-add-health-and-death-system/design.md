## Context

Current gameplay already has frame-based movement, collider-driven obstacle checks, and separate entities for player, sheep, goblin, and projectile updates. The existing architecture does not include cross-entity lifecycle or health state, so damage and defeat must be introduced without changing rendering assumptions in place.

## Goals / Non-Goals

**Goals:**
- Add health and death behavior consistently across player, sheep, and goblin.
- Keep damage application deterministic and data-driven by interaction source/target matrix.
- Ensure goblin only inflicts melee damage during its existing attack state timing.

**Non-Goals:**
- Add visual health bars or any health-related UI.
- Refactor combat into ECS or event bus architecture.
- Change movement/pathing or map collision semantics outside combat-triggered movement disabling.

## Decisions

- Health handling will be implemented in `main.js` during the update loop as a centralized damage coordinator, because it already receives player, sheep, goblin, and projectile updates and has access to all colliders for frame-time filtering.
- Entity objects will remain responsible for movement and rendering; health/death will be a wrapper state added to each entity instance (or its external state record) to avoid entangling sprite animation internals.
- Goblin melee damage will be tied to `EnemyState.ATTACKING` and a short per-entity cooldown on touch to avoid repeated damage every frame.
- The death animation will be a programmatic transform animation of the sprite set through sprite layer/sprite properties (`scaleX`, `scaleY`, `alpha`, `rotation`) over one fixed 250ms transition.

Alternatives considered:
- **Per-entity health module inside each actor file**: rejected because it duplicates logic and collision windows.
- **Only arrow/goblin modules handle collisions**: rejected because collision orchestration already lives at loop level and would diverge interaction rules.

## Risks / Trade-offs

- [Risk] Projectile overlap can contact multiple targets in one frame while continuing to exist.  
  -> Mitigation: remove projectile immediately after first registered target hit and only apply one damage event per hit.

- [Risk] Visual death transition may conflict with ongoing movement/animation timers on entity update.  
  -> Mitigation: apply movement lock and skip sprite animation state transitions while death is active.

- [Risk] Attack-window definition (frame-based vs per-state) can be misaligned for goblin damage timing.  
  -> Mitigation: use the existing `goblin.state === ATTACKING` window as the definitive damage phase.
