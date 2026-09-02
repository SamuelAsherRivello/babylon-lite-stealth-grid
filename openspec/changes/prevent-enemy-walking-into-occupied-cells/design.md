## Context

The movement layer already resolves terrain and dynamic character collisions,
including grid occupancy blockers. Patrol decision logic currently does not
observe the result, so a blocked intent can be retained indefinitely.

## Goals / Non-Goals

**Goals:**

- Evaluate the actual next grid cell before issuing a patrol movement intent.
- Filter replacement directions using current terrain, living-enemy, and
  player-plus-bush occupancy.
- Allow a player-only cell for the existing next-update attack flow.
- Preserve existing collision authority and enemy state transitions.

**Non-Goals:**

- Replacing collision resolution with a new pathfinding system.
- Changing combat targeting, attack behavior, level data, or character collider sizes.

## Decisions

The patrol controller will receive an authoritative next-cell walkability
callback backed by current terrain and character snapshots. It will evaluate
all cardinal candidates, reject terrain and living-enemy cells, reject a cell
where the player and a living bush coexist, and retain player-only and bush-only
cells. It will choose only from the remaining candidates; if none remain it
will issue a zero intent.

The player-only exception is strategic rather than a new combat trigger: the
enemy may enter that cell, and the existing AI reevaluates on the next update.
A no-progress fallback remains as a defensive guard for changes between the
precheck and movement resolution. A new obstacle-aware route planner was
considered, but rejected because it would duplicate the existing navigation
rules and could diverge from actual collider resolution.

## Risks / Trade-offs

- [An actor may be blocked by all neighboring directions] -> Issue zero movement
  and retry when the next update observes a newly valid candidate.
- [A stationary actor may be intentionally idle] -> Only a patrolling actor
  with a non-zero movement intent is eligible for blocked-step recovery.
- [The player/bush state changes between precheck and movement] -> Retain the
  movement collision guard and re-evaluate on the next update.

## Migration Plan

Add the behavior and regression tests, then run the focused enemy tests, the
broader test suite, and the production build. No data migration or rollback
step is required; reverting the implementation restores the previous patrol
selection behavior.
