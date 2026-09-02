## 1. Movement Resolver

- [x] C044-T001 Remove the playfield-boundary predicate from the shared character movement resolver while preserving terrain-overlap blocking and axis-independent movement; verify focused movement tests pass for unobstructed movement beyond all four logical screen edges.
- [x] C044-T002 Preserve the public movement call shape and update any affected comments or test expectations; verify no actor-specific navigation path still rejects movement solely due to logical screen bounds.

## 2. Verification

- [x] C044-T003 Add or update regression coverage for terrain blocking within and beyond the logical screen area, then run the focused test suite and verify terrain collisions still reject overlapping movement.
- [ ] C044-T004 Run the complete unit test suite, production build, OpenSpec validation, and a real-browser smoke test; verify a controllable character can cross the visible screen edge and return without runtime errors.
