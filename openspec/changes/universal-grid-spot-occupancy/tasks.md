## 1. Occupancy foundation

- [x] 1.1 C039-T001 Implement the shared logical grid-spot model with configurable grid dimensions, exact-midpoint tie handling, cell-center conversion, and explicit live-center updates.
- [x] 1.2 C039-T002 Add focused tests for spawn centering, both-axis midpoint behavior, one-pixel-beyond-midpoint transitions, configurable grid sizes, and invalid coordinates.

## 2. Entity integration

- [x] 2.1 C039-T003 Add one authoritative live-center/occupancy path to players, enemies, NPCs, and static or reactive world entities.
- [x] 2.2 C039-T004 Integrate bushes, pickups, gold stones, projectiles, and goals while preserving their existing physical movement, collider, interaction, and lifecycle behavior.
- [x] 2.3 C039-T005 Replace gameplay cell reads in AI, perception, targeting, adjacency, pickup, and bush interaction flows with shared occupancy reads.

## 3. Diagnostic rendering

- [x] 3.1 C039-T006 Centralize the existing small black X style, geometry, marker command creation, and canvas drawing in the diagnostic layer.
- [x] 3.2 C039-T007 Remove ad-hoc bush whole-cell and pickup center-marker plumbing; render one command per active entity, including overlapping entities.
- [x] 3.3 C039-T008 Add lifecycle and diagnostics tests for Collider visibility, inactive-entity removal, smooth sub-grid physical movement, and logical-marker snapping.

## 4. Verification

- [ ] 4.1 C039-T009 Run the complete automated suite and resolve regressions without changing unrelated behavior.
- [ ] 4.2 C039-T010 Run a real-browser smoke test with all entity categories moving or active and verify exactly one X per active entity at its current logical cell center.
