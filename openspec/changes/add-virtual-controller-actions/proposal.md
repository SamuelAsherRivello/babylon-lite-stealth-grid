## Why

The game currently supports walking only through a physical keyboard, which makes the portrait-oriented game unusable on touch devices. It needs the same practical mobile control result as the referenced Babylon.js project while respecting this game's Babylon Lite renderer and X/Y ground-coordinate model.

## What Changes

- Add an always-visible virtual movement joystick in the lower-left of the game frame for mouse, pen, and multi-touch input.
- Feed proportional joystick input into the existing X/Y walking system while preserving WASD and arrow-key controls.
- Add independent Jump and Shoot action buttons in the lower-right, ordered from left to right.
- Add a deterministic, non-stacking visual jump that does not alter the player's X/Y ground position or reported grid coordinates.
- Route Shoot through an optional game-owned action callback so the controller can integrate with the arrow-shooting work when available and safely do nothing until it is available.
- Keep simultaneous movement and action touches independent and keep all controls within the visible portrait game frame after resize or orientation changes.

## Capabilities

### New Capabilities

- `virtual-player-controller`: Defines virtual joystick movement, Jump and Shoot buttons, input coexistence, responsive placement, and the player's screen-space jump behavior.

### Modified Capabilities

None.

## Impact

- Affects the browser UI in `index.html` and `src/style.css`.
- Affects input and player rendering integration in `src/main.js`.
- Adds testable joystick and jump behavior to `src/game-logic.js` and `test/game-logic.test.js`.
- Preserves the existing Babylon Lite dependency set; no Babylon.js Core or GUI package is introduced.
- Must coexist with unrelated coordinate/grid work and with independently developed arrow-shooting changes.
