## 1. Behavior Contract and Pure Logic

- [x] `C033-T001` $tid 1.1 Add archer AI decision tests for inclusive total 2D Euclidean five-unit facing and four-unit attack thresholds, diagonal boundary positions, dead/absent player filtering, and attack gating; verify the focused tests fail before implementation.
- [x] `C033-T002` $tid 1.2 Implement the actor-neutral archer policy/state transitions, facing retention, target snapshot, and shoot/recovery timing; verify the focused AI tests pass.
- [x] `C033-T003` $tid 1.3 Add ballistic-arrow tests for left/right direction, rise/midpoint/fall, release-target capture, collider tracking, landing, and player evasion; verify the focused projectile tests pass.

## 2. Runtime Integration

- [x] `C033-T004` $tid 2.1 Replace the archer controller stub with the policy-driven update path and wire the live player snapshot without changing shared goblin or sheep behavior; verify existing enemy and AI tests remain green.
- [x] `C033-T005` $tid 2.2 Release exactly one archer arrow from the shoot animation's release frame and preserve the captured target after player movement; verify an integration test observes one release per attack.
- [x] `C033-T006` $tid 2.3 Extend projectile rendering/state updates for arcing motion, travel-angle rotation, landing removal, and active colliders; verify projectile combat and renderer tests pass.

## 3. Verification

- [ ] `C033-T007` $tid 3.1 Run the complete npm test suite and production build; verify all commands succeed.
- [ ] `C033-T008` $tid 3.2 Run the game in a real browser and verify five-unit facing, four-unit shooting, shoot animation, visible arc, left/right travel, landing removal, and player evasion at the live URL.
- [x] `C033-T009` $tid 3.3 Run `openspec validate --all --strict` and `git diff --check`; verify the new change artifacts and repository formatting are valid.
