## 1. State-to-icon contract

- [ ] C046-T001 Add focused tests for the four perception states mapping to the existing overhead expressions, including `NONE` clearing the icon, and verify they fail before the connection is implemented.
- [ ] C046-T002 Connect the reaction state observed after perception updates to the existing expression-instance data while preserving placement, fade, scale, flash, and manual debug behavior; verify the focused perception-expression tests pass.

## 2. Lifecycle and transitions

- [ ] C046-T003 Verify state transitions from weak, medium, and strong detections update the corresponding overhead icon on the next rendered frame, and verify de-escalation to `NONE` hides it without leaving stale instances.
- [ ] C046-T004 Verify independent characters can display different perception icons simultaneously and that dead/unregistered characters do not retain rendered perception icons.

## 3. Verification

- [ ] C046-T005 Run the full unit suite, production build, and OpenSpec validation; record all passing commands.
- [ ] C046-T006 Verify in a real browser that a character hearing the player visibly changes among the available perception icons and that the icon clears after perception recovery.
- [x] C046-T007 Add focused tests for player/bush combat-collider hiding, multiple-bush continuity, and dead-bush exclusion.
- [x] C046-T008 Implement player `H` expression lifecycle and synchronized all-layer opacity transitions without enemy flash/jump effects.
- [ ] C046-T009 Verify hidden-state animation changes preserve 80% opacity, run the full suite/build/OpenSpec validation, and verify the behavior in a real browser.
- [x] C046-T010 Exclude hidden players from audio and visual perception detections and add focused regression coverage.
