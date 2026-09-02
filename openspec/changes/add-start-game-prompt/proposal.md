## Why

New players currently enter the level without a concise explanation of the win condition or the intentionally limited gameplay systems. A start prompt gives the player the essential objective and prevents confusion about the currently pointless gold, attack, and item controls.

## What Changes

- Add a start-game prompt titled `Stealth Grid`.
- Show the body text: `Reach the flag to win. Avoid audio/visual detection of enemies. Currently pointless gameplay is: gold, attack, items.`
- Provide a single `Start` button; the prompt cannot be dismissed through a close button or backdrop click.
- Pause gameplay and disable player input while the prompt is shown; resume gameplay and enable input when `Start` is selected.
- Add a startup option named `showStartPrompt`, defaulting to `true`, so selected environments can suppress the prompt.
- Do not change the behavior or remove the gold, attack, or item systems.

## Capabilities

### New Capabilities

- `start-game-prompt`: Presents an optional, modal start prompt and begins gameplay through its Start action.

### Modified Capabilities

## Impact

- Affected UI integration in `src/main.js` and new or existing DOM prompt UI code.
- Affected game-start lifecycle and player input/pause coordination.
- Adds no dependencies and requires no migration or persistence changes.
- The startup option becomes part of the game initialization/configuration interface.
