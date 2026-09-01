## 1. Collider Role Model

- [x] `C030-T001` $tid 1.1 Add failing unit tests for independent movement and combat world-space collider transforms, including the player's centered 64 by 128 feet-anchored rectangle, and verify the focused tests fail for the missing role API.
- [x] `C030-T002` $tid 1.2 Add movement and combat collider descriptors plus `getMovementCollider()` and `getCombatCollider()` to the player, goblin, warrior, and sheep; preserve every existing movement-circle value and verify the focused transform tests pass.
- [x] `C030-T003` $tid 1.3 Configure distinct humanoid and sheep combat rectangles beside each actor's frame and pivot constants, and verify tests prove each character can override the default circle/rectangle geometry independently.

## 2. Gameplay Consumer Routing

- [x] `C030-T004` $tid 2.1 Add failing routing tests showing terrain, bounds, sheep navigation, dynamic character blocking, and reactive bushes consume movement colliders even when combat rectangles extend beyond them.
- [x] `C030-T005` $tid 2.2 Migrate movement, navigation, dynamic blocking, and reactive-decoration snapshots to movement colliders, then verify the routing tests and existing movement, sheep-flee, and reactive-decoration tests pass.
- [x] `C030-T006` $tid 2.3 Add failing combat tests showing a projectile can hit an upper-body combat rectangle without touching the movement circle and showing non-triggering combat overlap causes no damage.
- [x] `C030-T007` $tid 2.4 Migrate projectile and player-enemy, enemy-player, and enemy-sheep contact checks to combat colliders while preserving damage values, state gates, and contact-pair reset behavior; verify all focused combat and health/death tests pass.
- [x] `C030-T008` $tid 2.5 Remove or contain character-facing generic collider access so new call sites must select a named role, and verify a repository search plus the complete test suite finds no ambiguous character collider routing.

## 3. Diagnostics and Geometry Tuning

- [x] `C030-T009` $tid 3.1 Add diagnostic rendering tests or a testable draw-order seam proving every combat collider is drawn red before every movement collider is drawn green on top.
- [x] `C030-T010` $tid 3.2 Update diagnostics to collect both roles for every living player, goblin, warrior, and sheep and verify the focused diagnostic tests pass without changing terrain or projectile styling.
- [x] `C030-T011` $tid 3.3 Run the game in a real browser with diagnostics visible, inspect both facings and representative animations, and tune the goblin, warrior, and sheep rectangles to their visible bodies while confirming the player remains centered, 64 by 128, and feet-anchored.

## 4. Integration Verification

- [ ] `C030-T012` $tid 4.1 Run `npm.cmd test` and `npm.cmd run build`, fixing only regressions within this change until both commands pass.
- [ ] `C030-T013` $tid 4.2 In a real browser, verify the player still traverses narrow terrain using its unchanged movement circle; projectiles hit upper bodies; bushes react only to movement circles; sheep navigation remains functional; and existing player, enemy, and sheep contact-damage triggers behave unchanged.
- [x] `C030-T014` $tid 4.3 Inspect the final diff and OpenSpec validation output to confirm no attack-collider system, damage-rule change, dependency, Tiled collider configuration, or unrelated feature entered the change.
