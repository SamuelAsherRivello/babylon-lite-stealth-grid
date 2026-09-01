## Why

The centralized perception system currently reports detections, but enemies do not yet interpret those detections according to escalating awareness. This change makes stealth readable and recoverable by giving each enemy bounded perception reactions instead of allowing every detection to produce the same immediate response.

## What Changes

- Add four enemy perception states: `NONE`, `SUSPICIOUS`, `INVESTIGATING`, and `ALERT`.
- Keep enemy perception state separate from existing patrol, combat, and locomotion states.
- Store a suspicious grid cell and a confirmed/last-known grid cell independently.
- Make weak detections pause and face the suspicious cell, medium detections investigate it, and strong detections pursue the confirmed player location.
- Add timed loss-of-awareness, searching, and recoverable return to normal behavior.
- Add believable de-escalation from `ALERT` to `INVESTIGATING`, `SUSPICIOUS`, and finally `NONE`.
- Show Babylon-following runtime expressions (`?`, eye, `!`) with state-specific character flashes.
- Add debug keyboard controls `4/5/6/7` to apply each expression state to all living enemies.
- Make every reaction-phase duration configurable, with initial defaults of 1–3 seconds for suspicion, 2 seconds per search-facing direction, and 3–5 seconds for active alert.
- Add per-enemy reaction profiles for thresholds, timers, investigation movement, and confirmation behavior.
- Render the active suspicion or last-known grid cell with the existing perception debug marker.
- Keep perception reaction visuals limited to Collider/debug mode; runtime visuals are deferred to a separate change.

## Capabilities

### New Capabilities

- `enemy-perception-reactions`: Bounded enemy awareness states, last-known-position memory, investigation/search behavior, and recoverable escalation.

### Modified Capabilities

- `character-perception`: Detection events are consumed by enemy-specific reaction profiles and expose the enemy reaction snapshot needed by debug rendering.

## Impact

Likely affects the centralized perception manager, enemy controllers and state adapters, the main update lifecycle, perception debug rendering, and new deterministic unit/integration/browser tests. No new dependency is required.
