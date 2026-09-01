## 1. Baseline and Migration Protection

- [x] `C027-T001` $tid 1.1 Run `npm test` and `npm run build`, record any pre-existing failures, and verify the current checkout has a known baseline before file moves.
- [x] `C027-T002` $tid 1.2 Audit direct coverage for virtual-controller input normalization, Tiled terrain conversion, screenshot references, and the source template contract; add focused tests only where missing and verify those tests pass against the pre-migration implementation.

## 2. Characters and Gameplay

- [ ] `C027-T003` $tid 2.1 Move player modules into `src/characters/player/`, update all imports, and verify the player, player-state, projectile, and integration tests pass.
- [x] `C027-T004` $tid 2.2 Move enemy modules into `src/characters/enemies/`, update internal and consumer imports, and verify goblin, warrior, and enemy-state tests pass.
- [x] `C027-T005` $tid 2.3 Move sheep modules into `src/characters/npc/sheep/`, update internal and consumer imports, and verify all sheep tests pass.
- [x] `C027-T006` $tid 2.4 Move `cardinal-direction.js` and `game-logic.js` into `src/gameplay/`, update imports, and verify cardinal-direction, game-logic, player, sheep-navigation, coordinate, and responsive-layout tests pass.

## 3. Runtime Systems

- [x] `C027-T007` $tid 3.1 Move spawner modules into `src/systems/spawners/`, update imports, and verify spawner, marker, catalog, and Tiled spawner tests pass.
- [x] `C027-T008` $tid 3.2 Move projectile modules into `src/systems/objects/`, update imports, and verify projectile and player shooting tests pass.
- [x] `C027-T009` $tid 3.3 Move grid, render-depth, terrain configuration, and reactive-decoration modules into `src/systems/environment/`, update imports, and verify terrain, render-depth, decoration, coordinate, and integration tests pass.

## 4. Plugin and UI Boundaries

- [ ] `C027-T010` $tid 4.1 Move Tiled terrain conversion into `plugins/tiled-babylon-lite/terrain-runtime.js`, export it through the plugin entry point, update consumers, and verify all Tiled and reactive-decoration tests pass.
- [ ] `C027-T011` $tid 4.2 Move the virtual controller and its input normalization into `plugins/virtual-controller-babylon-lite/`, provide a public entry point, update consumers and tests, and verify virtual-controller and player tests pass.
- [x] `C027-T012` $tid 4.3 Move only virtual-controller-specific CSS into the plugin while preserving stylesheet loading order, and verify the relevant UI tests and production build pass.
- [x] `C027-T013` $tid 4.4 Move `pause-controller.js` and `fullscreen-settings.js` into `src/ui/`, update imports, and verify pause, fullscreen, settings, and viewport tests pass.

## 5. Remaining Organization and Documentation

- [x] `C027-T014` $tid 5.1 Move settings modules under `src/settings/` and release metadata under `src/release/`, update imports, and verify settings and release-metadata tests pass.
- [x] `C027-T015` $tid 5.2 Move `output-arrow-check.png` into `documentation/images/`, update README references, and verify the referenced file exists at the documented relative path.
- [x] `C027-T016` $tid 5.3 Add `src/templates/typescript-template.js` with lean TypeScript-compatible JSDoc and purposeful section and method comments, and verify its structure with a focused test.

## 6. Final Verification

- [x] `C027-T017` $tid 6.1 Search source, tests, documentation, and configuration for stale old module and image paths, and verify no obsolete import or screenshot references remain.
- [ ] `C027-T018` $tid 6.2 Run the complete `npm test` suite and verify every test passes.
- [x] `C027-T019` $tid 6.3 Run `npm run build`, verify the production bundle completes successfully, and inspect the final diff to confirm the migration contains no unintended behavior or unrelated formatting changes.
