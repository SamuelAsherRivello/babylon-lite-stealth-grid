## Context

The current movement resolver combines terrain collision with a full-collider playfield check. The proposal changes only the latter; the existing movement colliders, terrain obstacles, and axis-by-axis resolution remain the navigation inputs.

## Goals / Non-Goals

**Goals:**

- Remove the logical screen rectangle as an implicit movement obstacle.
- Preserve terrain collision and sliding along terrain edges.
- Keep the change shared across all actors using the common movement resolver.

**Non-Goals:**

- Do not change sprite rendering, camera/viewport scaling, spawn placement, projectile bounds, or terrain data.
- Do not clamp or wrap characters at another boundary.

## Decisions

- The movement acceptance decision will be based on terrain-overlap resolution only. This centralizes the behavior change in the shared resolver rather than adding actor-specific exceptions.
- The `bounds` argument may remain at call sites for API compatibility during this change, but it will no longer decide whether a character movement candidate is blocked.
- Character separation behavior will remain unchanged; it is outside this proposal and should not be used to reintroduce boundary enforcement.

The alternative of adding an opt-out flag per actor was rejected because the requested behavior applies to navigation generally and would create inconsistent actor behavior.

## Risks / Trade-offs

- [Risk] Characters can become fully off-screen and may be difficult to recover with keyboard or joystick input. → This is the requested behavior; retain normal input and terrain collision so actors can move back when visible.
- [Risk] Existing tests may assert that characters remain inside the playfield. → Update those tests to assert terrain-only blocking and explicit beyond-edge movement.

## Migration Plan

Implement the resolver change, update focused movement tests, then run the project validation and browser smoke test. Rollback consists of restoring the boundary predicate in the resolver if the behavior is later rejected.
