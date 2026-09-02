## Context

The perception reaction system and the canvas expression renderer are already integrated in the main loop, but the icon presentation currently depends on a separate rendering value. See proposal.md for motivation and specs/enemy-perception-reactions/spec.md for the behavioral contract.

## Goals / Non-Goals

**Goals:**

- Establish one authoritative state-to-expression mapping for all living characters that participate in perception reactions.
- Apply changes and clear icons as reaction snapshots transition, including automatic hiding at `NONE`.
- Preserve current placement, animation, fade, and manual debug controls.
- Derive player hiding from overlap between the player combat collider and any living bush combat collider; multiple bushes keep one continuous hidden state and dead/removed bushes do not count.
- Reuse the existing overhead expression lifecycle for the player's `H`, but animate player artwork opacity independently across every player animation layer and omit flash/jump effects.

**Non-Goals:**

- Adding new icon artwork or new perception states.
- Displaying raw visual/audio channel names, strength percentages, or remembered cells above characters.
- Changing detection thresholds, reaction timers, or enemy movement behavior.

## Decisions

- Reuse the existing `getEnemyExpression` mapping so state names remain the single source of truth and no parallel icon enum is introduced. An alternative would be to let each enemy emit an icon directly, but that duplicates presentation policy across actors.
- Drive icon instances from the reaction state observed after the perception update in the main loop. This keeps perception logic rendering-agnostic; an alternative direct callback would couple the reaction service to canvas/UI concerns.
- Treat `NONE` as an explicit clear operation and retain the existing fade behavior for transitions between visible states. This avoids stale icons while preserving the current visual language.
- Cover the mapping, transition, and clear behavior with unit tests, then verify the rendered result in a real browser with characters hearing the player.
- Cover bush overlap, multiple-bush continuity, dead-bush exclusion, player opacity, and player icon transitions without changing enemy flash/jump behavior.

## Risks / Trade-offs

- [A state and icon can become stale if update ordering changes] → Apply the reaction snapshot before assembling render instances and test the next-frame behavior.
- [Manual debug expression keys could be overwritten by the normal loop] → Preserve the existing debug path and document/test the intended precedence during active debug forcing.
- [Non-enemy characters may not have reaction records] → Limit the connection to living records that expose perception reactions; leave unrelated character visuals unchanged.
- [Player animation changes could reset opacity] → Store hidden opacity as player state and apply it whenever player artwork layers are created, switched, or transformed.

## Migration Plan

Implement the state-to-icon connection in the existing update/render lifecycle, add focused tests, run the full suite/build/OpenSpec validation, and perform browser verification. Rollback is limited to reverting the change artifacts and connection code; no data migration is required.
