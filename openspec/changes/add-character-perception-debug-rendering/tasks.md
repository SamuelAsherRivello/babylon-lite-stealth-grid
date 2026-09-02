## 1. Rendering primitives

- [x] C045-T001 Add pure centered 50%-cell triangle geometry and channel styling helpers; verify exact pixel bounds, colors, and inactive/active widths in focused tests.
- [x] C045-T002 Adapt collider diagnostics to consume the centralized read-only perception snapshot; verify no perception indicators render when Collider mode is off.

## 2. Integration and overlap

- [x] C045-T003 Render all living detector geometries relative to current grid location and facing; verify all four directions and moving-cell updates in tests.
- [x] C045-T004 Render independent overlapping Visual/Audio triangles and double stroke widths for active channel detections; verify simultaneous channel activation behavior.

## 3. Verification

- [ ] C045-T005 Run the full unit suite, production build, and OpenSpec validation; record all passing commands.
- [ ] C045-T006 Verify in a real browser with Collider mode enabled that goblin, archer, and warrior overlays move, rotate, activate, overlap, and disappear when Collider mode is disabled.
