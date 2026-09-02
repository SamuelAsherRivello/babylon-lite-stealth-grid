## 1. Prompt UI

- [x] C052-T001 Add focused tests for exact title/body/Start content, absence of close and backdrop dismissal, and prompt visibility behavior; verify the new tests fail before implementation.
- [x] C052-T002 Implement the dedicated start-prompt UI with Start-only dismissal, focus handling, modal accessibility semantics, and existing responsive styling; verify focused UI tests pass.

## 2. Startup Integration

- [x] C052-T003 Add the `showStartPrompt` startup option with a default of `true` and connect prompt Start/suppression to pause state and player input; verify integration tests cover default-visible and explicitly suppressed startup.
- [x] C052-T004 Preserve existing LEVEL_START/LEVEL_PLAYING/LEVEL_COMPLETE and gold/attack/item behavior while gating player interaction until Start; verify existing game-state and control tests pass.

## 3. Validation

- [ ] C052-T005 Run the focused prompt/UI tests and full automated test suite; verify both pass.
- [ ] C052-T006 Build the production bundle and perform a real-browser smoke test at desktop and portrait sizes; verify the default prompt, Start flow, and suppressed configuration work without console errors.
