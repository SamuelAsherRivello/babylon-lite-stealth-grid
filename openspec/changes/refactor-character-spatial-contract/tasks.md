## 1. Spatial Contract Foundation

- [x] 1.1 C038-T001 Define the shared character definition and canonical grid-center coordinate model; verify unit tests cover spawner center, logical center, and default zero art offset.
- [x] 1.2 C038-T002 Implement shared artwork transform and collider derivation, including skeletal movement-collider overrides and universal grid-sized combat collider; verify focused spatial-contract tests pass.
- [x] 1.3 C038-T003 Add validation for frame/display dimensions, animation descriptors, pivots, offsets, and movement geometry; verify invalid definitions fail with actionable errors.

## 2. Shared Actor Runtime

- [x] 2.1 C038-T004 Implement the shared actor lifecycle for sprite creation, animation switching, transform updates, visual effects, scaling, and disposal; verify lifecycle tests cover initial, animated, scaled, and disposed states.
- [ ] 2.2 C038-T005 Preserve behavior-module hooks for movement, attacks, healing, guarding, fleeing, and ranged actions; verify existing character behavior tests remain passing without spatial duplication.

## 3. Character Migration

- [ ] 3.1 C038-T006 Migrate Goblin as the reference character and verify its existing aligned artwork, green collider, red collider, grid cell, and depth order remain consistent.
- [ ] 3.2 C038-T007 Migrate Player, Sheep, Archer, and Warrior while preserving unique behavior and art filenames; verify per-character regression tests and existing behavior tests pass.
- [ ] 3.3 C038-T008 Migrate Lancer and Monk through the shared path, removing their divergent positioning implementations; verify both align without manual character-specific corrective code.
- [ ] 3.4 C038-T009 Rename code-facing Pawn terminology to Player without renaming art files or changing asset paths; verify source, labels, diagnostics, and tests use Player.

## 4. Integration and Verification

- [ ] 4.1 C038-T010 Migrate spawner markers, diagnostics, render-depth, grid occupancy, perception reads, and spawn/death transforms to the shared contract; verify all displayed centers and colliders agree.
- [ ] 4.2 C038-T011 Run the complete automated test suite and verify all seven runtime characters satisfy the spatial-contract scenarios.
- [ ] 4.3 C038-T012 Run a browser smoke test with all character types and verify artwork bottom alignment, grid-center placement, collider overlays, animation changes, and no renamed art assets.
