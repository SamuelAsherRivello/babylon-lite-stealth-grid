## 1. Depth contract

- [x] `C021-T001` $tid 1.1 Add centralized Babylon category/sub-depth constants and document the TileMap base/sub-Z mapping.
- [x] `C021-T002` $tid 1.2 Add the CSS z-index band constants/documentation for persistent UI, settings overlay, and error UI.

## 2. Babylon layer migration

- [x] `C021-T003` $tid 2.1 Move terrain and future TileMap layers to the TileMap band and explicit sub-depths.
- [x] `C021-T004` $tid 2.2 Move NPCs, player, projectiles, particles, and foreground layers to their reserved bands.
- [x] `C021-T005` $tid 2.3 Preserve projectiles/effects as a documented TBD relationship within the reserved range.

## 3. DOM overlay migration

- [x] `C021-T006` $tid 3.1 Assign explicit stacking values to the coordinate guide, coordinates widget, release metadata, gear, and virtual controller.
- [x] `C021-T007` $tid 3.2 Ensure the settings backdrop/window and controls are above persistent UI while open.
- [x] `C021-T008` $tid 3.3 Assign the error overlay the highest reserved UI band.

## 4. Verification and documentation

- [x] `C021-T009` $tid 4.1 Add focused tests for numeric band allocation and TileMap sub-depth ordering.
- [x] `C021-T010` $tid 4.2 Add CSS/DOM contract tests for persistent UI and settings-overlay precedence.
- [x] `C021-T011` $tid 4.3 Run the build and inspect representative overlapping layers in a browser.
- [x] `C021-T012` $tid 4.4 Update project documentation with the final depth table and the unresolved projectile/effect decision.
