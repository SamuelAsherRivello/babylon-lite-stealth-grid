## Why

Player shooting currently remembers only the last horizontal direction, so arrows cannot be aimed straight up or down even though movement supports four cardinal directions. Shooting should preserve the player's most recent directional intent and produce predictable grid-aligned attacks.

## What Changes

- Remember the most recently tapped cardinal movement direction across up, down, left, and right inputs.
- When directional input is ambiguous, resolve the shot to the input axis with the greatest magnitude.
- Fire arrows only along one cardinal axis: straight up, down, left, or right, with no diagonal or analog-angle shots.
- Update arrow orientation, spawn placement, motion, collider handling, bounds checks, and hit processing for vertical as well as horizontal travel.
- Preserve the established default rightward shot before the player supplies directional input.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `archer-ranged-attack`: Expand remembered shot direction and projectile travel from horizontal-only facing to deterministic four-direction cardinal aiming.

## Impact

The change affects player input/directional state, arrow spawn calculation, projectile data and movement, sprite orientation, projectile collision and offscreen handling, and their automated tests. No new runtime dependencies or public services are required.
