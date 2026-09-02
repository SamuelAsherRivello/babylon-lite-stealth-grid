## Context

The game already has a `LEVEL_START` state, a pause controller that disables and restores player input, a DOM body layer for modal UI, and a reusable `GameWindow` used by settings. The start prompt must integrate with these existing boundaries without adding a dependency or changing the gold, attack, or item systems.

## Goals / Non-Goals

**Goals:**

- Make the start gate explicit and keyboard/accessibility friendly.
- Keep the prompt optional through a startup configuration value with a true default.
- Ensure the game loop and player input cannot advance the level before `Start`.

**Non-Goals:**

- Rework the existing game-state model beyond the start gate needed by this prompt.
- Remove, disable, or rename gameplay controls.
- Persist the option in runtime settings or expose it as a player-facing setting.

## Decisions

- Add a dedicated start-prompt UI module following the existing DOM UI module style. A dedicated module keeps content, focus, and dismissal rules testable without coupling them to the large game bootstrap.
- Pass `showStartPrompt` into the game startup path and normalize only an explicitly false value as suppression; the omitted/default case remains visible. This makes environment-specific embedding explicit and avoids persistence or global state.
- Use the existing pause controller lifecycle: pause before showing the prompt and resume from the Start handler. The prompt owns no close path, so backdrop and close-button behavior cannot bypass the gate.
- Keep the existing `LEVEL_START` to `LEVEL_PLAYING` transition as the game lifecycle state boundary, while preventing meaningful player interaction until the prompt is started. This avoids altering goal-completion behavior.
- Add focused unit tests for prompt content, default/suppressed visibility, and Start-only dismissal, plus integration assertions for the startup wiring.

## Risks / Trade-offs

- [Risk] A startup prompt shown over a fully initialized scene could make the first frame feel paused. -> Mitigation: initialize it after required level/UI objects exist and explicitly reset the pause controller time origin on Start.
- [Risk] Existing modal styling includes a close affordance by default. -> Mitigation: use a prompt-specific composition or configuration that omits the close control and backdrop handler.
- [Risk] Embedders may pass non-boolean values. -> Mitigation: document and test the contract as boolean, with only `false` suppressing the prompt.
