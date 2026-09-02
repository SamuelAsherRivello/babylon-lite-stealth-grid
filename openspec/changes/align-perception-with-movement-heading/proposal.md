## Why

Visual Perception can remain oriented differently from the direction a character is currently walking. This makes the debug view and gameplay detection misleading: a character walking left, up, right, or down should visually perceive along that same heading.

## What Changes

- Make every enemy's perception-facing value follow its current cardinal movement heading for all four directions.
- Ensure the heading exposed to perception is updated at the same point as movement/facing state, including direction changes and stopped movement.
- Add regression coverage for left, up, right, and down visual perception, plus runtime/debug snapshot propagation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `character-perception`: Visual Perception must use every detector's current movement heading consistently for all cardinal directions.

## Impact

Likely affects the player/enemy actor heading adapters, the centralized perception update path, perception debug rendering inputs, and unit/integration tests. No new dependencies or external APIs are required.
