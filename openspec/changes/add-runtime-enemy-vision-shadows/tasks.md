## 1. Asset and perception geometry

- [x] 1.1 `C055-T001` Verify `public/assets/terrain/tile-shadow.png` is the supplied 64x64 PNG and load it through the existing asset-loading path without adding dependencies; verify the asset exists and its dimensions are correct
- [x] 1.2 `C055-T002` Add a pure visible-visual-path helper that stops before the first terrain or living-character blocker and excludes dead or invalid enemies; verify clear paths, terrain blockers, living blockers, dead blockers, and all four headings in focused tests

## 2. Runtime rendering

- [x] 2.1 `C055-T003` Create tile-aligned shadow draw commands for every living enemy's visible visual cell with 40%, 30%, 20%, and 10% opacity by distance; verify command positions, ordering, opacity, multiple-enemy independence, and invalid-enemy omission in focused tests
- [x] 2.2 `C055-T004` Integrate the shadow pass into normal gameplay rendering beneath character art and preserve removal when enemies die or unregister; verify the production build and a browser smoke test show moving enemy sight shadows
- [x] 2.3 `C055-T005` Invoke the same shadow rendering during Collider mode while retaining existing perception outlines, collider diagnostics, and active markers; verify enabled/disabled debug behavior and additive rendering in focused UI tests

## 3. Validation

- [ ] 3.1 `C055-T006` Run focused perception/UI tests, the complete test suite, production build, OpenSpec validation, and a real-browser check with goblin, archer, and warrior enemies; verify no new console errors and visible blocker-aware 40/30/20/10 shadows in both normal and Collider modes
