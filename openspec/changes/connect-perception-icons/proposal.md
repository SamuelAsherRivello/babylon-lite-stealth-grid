## Why

Characters already have four perception-state icons available above them, and the perception system already updates an independent reaction state. The two pieces are not yet connected, so the player cannot see when a character hears or otherwise accepts a perception event.

## What Changes

- Connect each character's current perception reaction state to its overhead expression icon.
- Show the icon corresponding to `SUSPICIOUS`, `INVESTIGATING`, or `ALERT` after the perception system updates that character's state.
- Hide the overhead icon for `NONE` and when the character has no active perception state.
- Preserve the existing icon placement, fade, scale, flash, and debug-key behavior unless changed by the state-to-icon connection.
- Ensure state transitions and clearing perception state update the icon on the next rendered frame.
- Show a capital `H` over the player while the player's combat collider overlaps at least one living bush combat collider.
- Fade all player artwork from 100% to 80% opacity on hidden entry and back to 100% on exit over the existing enemy expression animation duration, without the enemy white flash or jump.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-perception-reactions`: Runtime overhead icons must reflect each character's four-state perception reaction.

## Impact

Likely affects the main update coordinator, player visual transforms, character records, expression-icon rendering, bush overlap checks, and perception/stealth tests. No new dependency or asset is required; the existing icon renderer is reused.
