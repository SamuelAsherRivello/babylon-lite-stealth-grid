## 1. Movement Math

- [x] `C024-T001` $tid 1.1 Add failing unit tests for exact-cardinal, 10%-boundary, above-boundary diagonal, zero-input, and dominant-axis classification; verify the focused test command fails for the missing behavior before implementation.
- [x] `C024-T002` $tid 1.2 Implement the pure cardinal-classification helper and named 10% tolerance; verify all classification tests pass without changing existing keyboard or joystick selection tests.
- [x] `C024-T003` $tid 1.3 Add failing unit tests for collider-center grid targets and frame-rate-independent 0.2-second correction steps, including final-step clamping; verify they fail before implementing the helper.
- [x] `C024-T004` $tid 1.4 Implement pure alignment-target/session-step helpers using the canonical grid cell size and player collider center; verify the focused math tests pass at multiple delta times.

## 2. Player Integration

- [x] `C024-T005` $tid 2.1 Add failing player integration tests for vertical-to-column and horizontal-to-row alignment, already-centered travel, and immediate cancellation on zero, diagonal, or axis-changing input; verify the new scenarios fail before integration.
- [x] `C024-T006` $tid 2.2 Integrate correction-session lifecycle into player updates so requested main-axis travel is preserved and sub-threshold joystick noise is replaced only on the assisted axis; verify the player integration tests pass.
- [x] `C024-T007` $tid 2.3 Add collision integration tests covering terrain, dynamic colliders, bounds, blocked correction with unblocked requested travel, and later safe retry; verify no correction crosses a collision constraint.
- [x] `C024-T008` $tid 2.4 Route requested travel and correction through existing collision handling in movement-priority order; verify collision integration tests and the existing movement/collision suite pass.
- [x] `C024-T009` $tid 2.5 Add knockback regression tests proving correction is suspended during knockback and recreated only from fresh qualifying input afterward; verify current knockback displacement remains unchanged.

## 3. Verification

- [x] `C024-T010` $tid 3.1 Run the complete automated test suite and production build as separate commands; verify both finish successfully with no regressions.
- [x] `C024-T011` $tid 3.2 Run the game in a real browser and verify keyboard and virtual joystick behavior for up, down, left, right, near-cardinal analog input, intentional diagonals, input transitions, collisions, and knockback.
- [x] `C024-T012` $tid 3.3 Inspect the final diff against the proposal, spec, and design; verify no NPC/enemy movement, player speed, controls, grid dimensions, dependencies, or unrelated gameplay behavior changed.
