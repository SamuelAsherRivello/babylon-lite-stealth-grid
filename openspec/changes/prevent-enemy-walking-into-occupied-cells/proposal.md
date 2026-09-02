## Why

Patrolling enemies can continue issuing the same movement intent after collision
resolution prevents them from entering an occupied or unwalkable cell. They then
remain pressed against the surface indefinitely, making the enemy appear stuck
and allowing occupancy violations to recur. The patrol behavior needs an explicit
blocked-step response now that terrain and character occupancy are enforced by
the movement layer.

## What Changes

- Require an enemy that detects no progress toward its requested next cell to
  stop pursuing that cell immediately.
- Make the patrol controller select another available cardinal direction after a
  blocked movement attempt, rather than repeatedly retrying the blocked intent.
- Preserve current terrain collision, dynamic character occupancy, attack locks,
  knockback, and grid-aligned movement behavior.
- Add regression tests covering blocked terrain/cell occupancy and recovery to a
  non-occupied direction.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `actor-ai-behaviors`: Enemy patrol movement must react to blocked next-cell
  detection and choose a different walkable cardinal direction.

## Impact

Affected patrol decision logic under `src/characters/enemies/`, the shared enemy
movement/collision integration in `src/main.js` and `src/gameplay/`, and focused
enemy behavior tests. No new dependencies, assets, level-format changes, or
public API changes are expected.
