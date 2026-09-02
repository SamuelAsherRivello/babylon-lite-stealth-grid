## Why

Entering a bush currently changes hiding state without settling the player into its center. C059 experiments with a brief gravity movement that makes entering cover feel deliberate while still letting the player freely leave afterward.

## What Changes

- Require the player to be closer than the **minimum distance**, defined as 0.75 of the configured grid width. An unconsumed entry remains eligible while approaching inside the collider.

- On eligible bush entry, pull the player's world center along both X and Y to the bush's interaction/collider center over 0.125 seconds.
- Ignore keyboard and joystick movement during the pull; restore movement immediately upon arrival, including held directions.
- Use an accelerating ease with an exact endpoint and no overshoot.
- Consume the trigger per bush until the player fully exits its hiding collider and re-enters.
- Preserve existing hiding visibility and perception behavior during the transition, and release the temporary movement lock if the pull is interrupted.

## Capabilities

### New Capabilities
- `bush-gravity-movement`: Timed centering on bush entry, temporary movement suppression, and collider-exit rearming.

### Modified Capabilities
None.

## Impact

- Player movement integration in `src/characters/player/player.js` and hiding orchestration in `src/main.js`.
- Reuses `src/systems/perception/player-hidden.js` overlap semantics and reactive decoration interaction centers.
- Adds focused transition tests and browser verification for keyboard and virtual joystick behavior.
- No new dependencies, artwork changes, or changes to other actors' movement.



