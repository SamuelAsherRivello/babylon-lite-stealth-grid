## Context

The movement layer already resolves terrain and dynamic character collisions,
including grid occupancy blockers. Patrol decision logic currently does not
observe the result, so a blocked intent can be retained indefinitely.

## Goals / Non-Goals

**Goals:**

- Connect blocked/no-progress movement feedback to patrol direction selection.
- Ensure a replacement direction is not the direction just rejected.
- Preserve existing collision authority and enemy state transitions.

**Non-Goals:**

- Replacing collision resolution with a new pathfinding system.
- Changing combat targeting, attack behavior, level data, or character collider sizes.

## Decisions

The patrol controller will compare the actor's current position with its
position at the previous patrol decision tick. A patrolling actor that has a
non-zero intent but made no progress is treated as blocked, and the controller
immediately selects from the other configured cardinal directions. This keeps
the movement layer authoritative and works for enemy implementations that share
the patrol controller without duplicating terrain-collider tests.

A direction different from the rejected direction will be selected before the
normal patrol timer is allowed to continue. A new obstacle-aware route planner
was considered, but rejected because it would duplicate the existing collision
and occupancy rules and could diverge from actual collider resolution.

## Risks / Trade-offs

- [An actor may be blocked by all neighboring directions] -> Retry directions
  through the existing patrol decision loop while retaining the collision guard;
  no movement is permitted into a rejected cell.
- [A stationary actor may be intentionally idle] -> Only a patrolling actor
  with a non-zero movement intent is eligible for blocked-step recovery.

## Migration Plan

Add the behavior and regression tests, then run the focused enemy tests, the
broader test suite, and the production build. No data migration or rollback
step is required; reverting the implementation restores the previous patrol
selection behavior.
