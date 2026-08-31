## Why

The player's arrow currently appears too far away from the archer at release, making the shot look detached from the bow. The release position should match the supplied target reference by starting close to the character on both sides.

## What Changes

- Reduce the arrow's horizontal spawn distance from the player so a right-facing shot begins close to the bow, as shown in the target reference.
- Mirror the same close spacing for a left-facing shot.
- Preserve the current vertical release height, release timing, projectile direction, size, arc, and collision behavior.
- Add regression coverage for the directional spawn positions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `archer-ranged-attack`: Refine the arrow-release requirement so the projectile starts close to the archer's bow with mirrored horizontal spacing for left- and right-facing shots.

## Impact

- Player projectile creation in `src/player.js`.
- Player/archer tests in `test/player.test.js` or focused equivalent coverage.
- No new dependencies, public APIs, controls, projectile physics, or asset changes.
