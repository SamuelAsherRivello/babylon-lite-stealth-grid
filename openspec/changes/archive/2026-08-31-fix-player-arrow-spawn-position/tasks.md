## 1. Directional Spawn Regression Coverage

- [x] `C020-T001` $tid 1.1 Add focused tests that capture the arrow position emitted for both right- and left-facing releases, and verify the tests fail against the current excessive horizontal offset.
- [x] `C020-T002` $tid 1.2 Assert that left and right releases preserve the existing vertical offset and use equal, mirrored horizontal separation from the player's position; verify the focused player tests pass after implementation.

## 2. Arrow Spawn Adjustment

- [x] `C020-T003` $tid 2.1 Reduce only the player's horizontal arrow spawn offset to place the arrow close to the bow in the supplied target reference, and verify the focused directional spawn tests pass.
- [ ] `C020-T004` $tid 2.2 Run the complete automated test suite and verify projectile direction, release timing, size, arc, collision behavior, and unrelated player behavior remain unchanged.

## 3. Visual Verification

- [ ] `C020-T005` $tid 3.1 Run the game in a real browser, fire while facing right and left, and verify each arrow first appears close to the bow with mirrored spacing and the unchanged vertical release height.
