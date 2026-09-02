## Context

The centralized perception update already consumes an actor heading and the visual geometry is cardinal. The defect is at the contract boundary where movement state is exposed to perception or where a stale/default heading is retained.

## Goals / Non-Goals

**Goals:**

- Establish one current cardinal heading as the source for actor movement, perception snapshots, and debug visual cells.
- Preserve line-of-sight blocking and existing visual strength/range behavior.
- Cover all four directions and heading changes with deterministic tests.

**Non-Goals:**

- Changing audio perception, range, strengths, terrain rules, or enemy reaction timing.
- Adding diagonal perception or changing sprite art orientation.

## Decisions

- Trace the actor heading getter back to movement-state updates and correct the narrowest stale-value boundary. This keeps the centralized perception API simple and avoids a second direction state.
- Normalize only to the existing four cardinal heading values before publishing the perception snapshot. Invalid or neutral movement retains the actor's last valid heading, matching directional-memory behavior.
- Test both pure visual-cell geometry and the actor-to-perception snapshot handoff so a passing geometry test cannot hide a stale runtime heading.

## Risks / Trade-offs

- [A movement adapter may update position before heading] → Verify update ordering and test direction changes across consecutive updates.
- [Existing actor-specific horizontal facing may be conflated with cardinal heading] → Keep horizontal sprite flip separate from the cardinal heading consumed by perception.

## Migration Plan

Implement the heading handoff correction, run focused perception/character tests, then run the complete test suite and browser smoke verification with the perception debug overlay.
