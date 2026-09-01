## 1. Behavior Contract and Pure Logic

- [ ] 1.1 Add archer AI decision tests for inclusive total 2D Euclidean five-unit facing and four-unit attack thresholds, diagonal boundary positions, dead/absent player filtering, and attack gating; verify the focused tests fail before implementation.
- [ ] 1.2 Implement the actor-neutral archer policy/state transitions, facing retention, target snapshot, and shoot/recovery timing; verify the focused AI tests pass.
- [ ] 1.3 Add ballistic-arrow tests for left/right direction, rise/midpoint/fall, release-target capture, collider tracking, landing, and player evasion; verify the focused projectile tests pass.

## 2. Runtime Integration

- [ ] 2.1 Replace the archer controller stub with the policy-driven update path and wire the live player snapshot without changing shared goblin or sheep behavior; verify existing enemy and AI tests remain green.
- [ ] 2.2 Release exactly one archer arrow from the shoot animation's release frame and preserve the captured target after player movement; verify an integration test observes one release per attack.
- [ ] 2.3 Extend projectile rendering/state updates for arcing motion, travel-angle rotation, landing removal, and active colliders; verify projectile combat and renderer tests pass.

## 3. Verification

- [ ] 3.1 Run the complete npm test suite and production build; verify all commands succeed.
- [ ] 3.2 Run the game in a real browser and verify five-unit facing, four-unit shooting, shoot animation, visible arc, left/right travel, landing removal, and player evasion at the live URL.
- [ ] 3.3 Run `openspec validate --all --strict` and `git diff --check`; verify the new change artifacts and repository formatting are valid.
