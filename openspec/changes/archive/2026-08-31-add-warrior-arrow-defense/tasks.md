## 1. Warrior Defense Contract

- [x] `C017-T001` $tid 1.1 Add deterministic tests for default defense timing, configuration overrides, trajectory eligibility, one attempt per arrow/Warrior pair, guaranteed frontal blocks, and guaranteed rear damage; verify the focused Warrior defense tests fail for the intended missing behavior.
- [x] `C017-T002` $tid 1.2 Implement and validate the centralized Warrior defense timing configuration with initial values of 0.40-second lookahead and 0.25-second duration; verify the configuration tests pass.
- [x] `C017-T003` $tid 1.3 Add automatic timed defense to the Warrior action/state integration, including preserving existing facing, attack interruption, locomotion lock, read-only active-defense state, pause-aware expiry, and locomotion recovery; verify Warrior state and actor tests pass.
- [x] `C017-T004` $tid 1.4 Replace chance-based defense with deterministic facing checks: front-facing arrows always block, rear and vertical arrows never trigger automatic guard, and the Warrior never turns to cover a rear attack; verify focused defense and actor tests pass.

## 2. Arrow Deflection Lifecycle

- [x] `C017-T005` $tid 2.1 Add projectile-renderer tests proving a deflected arrow immediately leaves collision queries, moves away, rotates modestly, fades over 0.25 seconds, and is then removed; verify these tests fail before implementation.
- [x] `C017-T006` $tid 2.2 Implement the explicit deflected projectile lifecycle and rendering interpolation without changing normal flight, obstacle, offscreen, or ordinary-hit removal; verify projectile and renderer tests pass.

## 3. Combat Integration

- [x] `C017-T007` $tid 3.1 Add integration tests for pre-impact defense evaluation, harmless nearby arrows, defended Warrior hits causing zero damage and deflection, and failed/expired defense causing the existing 50 damage; verify the tests fail for the intended missing routing.
- [x] `C017-T008` $tid 3.2 Wire active arrow trajectory data into living Warriors before hit resolution and route Warrior hits atomically to deflection or normal damage; verify combat routing and Warrior integration tests pass while sheep and goblin arrow behavior remains unchanged.
- [ ] `C017-T009` $tid 3.3 Implement and test directional authorization so frontal horizontal arrows always block without turning, rear and downward arrows deal 50 damage, upward arrows use exactly a 50% attempt, and an active pose cannot block a different unauthorized arrow.

## 4. Verification and Playtest

- [x] `C017-T010` $tid 4.1 Run the complete automated test and build commands from `package.json`; verify both finish successfully with no regressions.
- [ ] `C017-T011` $tid 4.2 Run the game in a real browser and verify a frontal arrow always triggers the 0.25-second guard pose and visibly bounces/spins/fades without damage, while a rear arrow never triggers guard and deals 50 damage.
