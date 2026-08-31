## 1. Contact Behavior Tests and Pure Coordination

- [x] 1.1 Add failing unit tests for stable sheep-pair ordering, dominant-axis and coincident-center opposite directions, and one response per uninterrupted contact episode; verify the focused tests fail for the missing behavior before implementation.
- [x] 1.2 Implement the pure flock-contact helpers for current contact, requested/swept movement conflict, stable separation directions, episode latching/rearming, and dead/absent pair pruning; verify the focused contact-helper tests pass.
- [x] 1.3 Add and pass pure coordination tests for two sheep requesting the same space and three-sheep simultaneous contacts, proving stable results and at most one newly started response per sheep per update.

## 2. Sheep State and Separation Routing

- [x] 2.1 Add failing sheep state/controller tests proving contact cancels an active route, both idle and moving sheep enter one stationary bounce, and threat-triggered versus contact-triggered bounce completion retains the correct route intent.
- [x] 2.2 Extend the sheep command/state boundary with contact-bounce context and pair-specific separation intent; verify the focused state/controller tests pass without regressing player/enemy fear transitions.
- [x] 2.3 Add failing navigation tests for preferred opposite cardinal first steps, safe separation-increasing fallback, coincident starts, blocked terrain/bounds, and no-safe-route stationary behavior.
- [x] 2.4 Implement collision-aware separation route selection and make other living self-excluding sheep colliders block planning, route following, and knockback movement; verify the focused navigation and sheep controller tests pass.

## 3. Multi-Sheep Integration

- [x] 3.1 Add failing integration tests for an approaching moving/idle pair, a head-on moving pair, same-update destination contention, initially coincident sheep, a blocked-edge contact, a dead sheep, contact rearming after separation, and a three-sheep cluster.
- [x] 3.2 Integrate the flock-contact phase into the stable-ID sheep records, apply reciprocal intents before individual actor updates, and reserve accepted movement positions in stable order; verify all focused sheep integration tests pass and final living sheep colliders never overlap.
- [x] 3.3 Verify pause and combat interactions with integration tests: paused time does not advance bounce/separation, dead sheep neither block nor react, and knockback cannot move a sheep through another living sheep.

## 4. Regression and Browser Verification

- [x] 4.1 Run `npm.cmd test` and verify the complete automated suite passes, including existing sheep fear, enemy targeting, terrain collision, spawner, and combat behavior.
- [x] 4.2 Run `npm.cmd run build` and verify the production build completes without warnings or errors introduced by this change.
- [ ] 4.3 Run the game and verify in a real browser that two sheep meeting head-on bounce once and run apart, two sheep never visibly overlap, an edge/terrain-blocked sheep stays safe, a separated pair can react again, and a three-sheep cluster resolves without persistent jitter.
