## 1. State-to-icon contract

- [ ] C038-T001 Add focused tests for the four perception states mapping to the existing overhead expressions, including `NONE` clearing the icon, and verify they fail before the connection is implemented.
- [ ] C038-T002 Connect the reaction state observed after perception updates to the existing expression-instance data while preserving placement, fade, scale, flash, and manual debug behavior; verify the focused perception-expression tests pass.

## 2. Lifecycle and transitions

- [ ] C038-T003 Verify state transitions from weak, medium, and strong detections update the corresponding overhead icon on the next rendered frame, and verify de-escalation to `NONE` hides it without leaving stale instances.
- [ ] C038-T004 Verify independent characters can display different perception icons simultaneously and that dead/unregistered characters do not retain rendered perception icons.

## 3. Verification

- [ ] C038-T005 Run the full unit suite, production build, and OpenSpec validation; record all passing commands.
- [ ] C038-T006 Verify in a real browser that a character hearing the player visibly changes among the available perception icons and that the icon clears after perception recovery.
