## 1. Coordinate Contract

- [x] C039-T001 Audit all world-layer coordinate boundaries and verify the inventory with source review
- [x] C039-T002 Add shared logical world-position and grid-cell-center helpers and verify exact-center unit tests

## 2. Shared Viewport Rendering

- [x] C039-T003 Implement one centralized viewport-scale application and verify resize preserves relative positions in a real browser
- [x] C039-T004 Migrate all world layers to the shared viewport path and verify no object-specific resize calculation remains
- [x] C039-T005 Preserve centralized Y-sorted render depth and verify representative draw ordering

## 3. Pickup and Collider Alignment

- [x] C039-T006 Place gold sprites at exact grid-cell centers with no visual offsets and verify sprite/collider center tests
- [x] C039-T007 Keep pickups out of movement-collision inputs while retaining combat collection and verify player pass-through

## 4. Verification

- [x] C039-T008 Add runtime QA logging for authored cell, logical position, collider center, and viewport scale; verify resize stability
- [x] C039-T009 Run focused tests, production build, and real-browser resize/collection smoke test against all specifications
