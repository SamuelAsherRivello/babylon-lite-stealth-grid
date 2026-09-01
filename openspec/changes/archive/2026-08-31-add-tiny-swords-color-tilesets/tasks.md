## 1. Protect Existing Behavior

- [ ] `C016-T001` $tid 1.1 Add a Level01 migration regression fixture or snapshot that records every existing nonzero GID, layer placement, normalized local frame, origin marker, and color-three tileset identity; run it before implementation and verify it fails only for the not-yet-migrated filename contract.
- [ ] `C016-T002` $tid 1.2 Add tests for five filename-matched 576 by 384, 64-grid external TSJs and verify the tests fail while only `TinySwordsTerrain.tsj` exists.
- [ ] `C016-T003` $tid 1.3 Add mixed-tileset normalization and rendering-adapter tests that require stable source/image identity and authored layer order; verify they fail because runtime atlas selection is currently hard-coded.
- [ ] `C016-T004` $tid 1.4 Add cross-palette collision tests for empty, fully blocked, and partial-collider local frames and verify the missing multi-palette path causes the pre-implementation failure.

## 2. Organize Assets and Tiled Definitions

- [ ] `C016-T005` $tid 2.1 Import `Tilemap_color1.png` through `Tilemap_color5.png` into `public/assets/terrain/tilesets/` without deleting the user's Downloads copies; verify each imported file is 576 by 384 and matches its supplied SHA-256 hash.
- [ ] `C016-T006` $tid 2.2 Create `Tilemap_color1.tsj` through `Tilemap_color5.tsj` with matching declared names and relative image paths; verify each parses as JSON and declares 54 tiles on a 64 by 64 grid.
- [ ] `C016-T007` $tid 2.3 Attach all five TSJs to `Level01.tmj`, `Level02.tmj`, and other verified live AI-managed maps while retaining color three at `firstgid: 1`; verify all pre-migration Level01 tile data and the origin-marker GID remain byte-for-byte equivalent as numeric arrays.
- [ ] `C016-T008` $tid 2.4 Update verified Tiled project/session references as needed and retire `TinySwordsTerrain.tsj` only after `rg` confirms no live map, runtime, test, or documentation reference remains.

## 3. Normalize Multiple Tilesets

- [ ] `C016-T009` $tid 3.1 Extend the reusable plugin's normalized tileset and placement data with authoritative TSJ source, resolved image URL, image dimensions, and local frame identity; verify the mixed-tileset normalization tests pass.
- [ ] `C016-T010` $tid 3.2 Add actionable validation for missing TSJ image metadata, incompatible grid dimensions, unresolved images, and out-of-range GIDs; verify focused invalid-fixture tests pass.
- [ ] `C016-T011` $tid 3.3 Verify corresponding GIDs from different first-GID ranges normalize to the same local frame while retaining different tileset identities.

## 4. Render and Collide by Tileset Identity

- [ ] `C016-T012` $tid 4.1 Replace the hard-coded color-three startup atlas with a resolved-image atlas cache that loads each image referenced by the current map once; verify atlas-loader tests cover one- and multi-palette maps.
- [ ] `C016-T013` $tid 4.2 Partition terrain sprites by authored Tiled layer and tileset source while preserving bottom-to-top layer order; verify adapter tests prove mixed palettes use their matching atlases at unchanged positions.
- [ ] `C016-T014` $tid 4.3 Keep terrain collision keyed exclusively by normalized local frame and verify cross-palette whole-cell, partial-shape, empty-frame, and walkable cases are equivalent.
- [ ] `C016-T015` $tid 4.4 Load unchanged migrated Level01 and compare it with the recorded baseline; verify tile count, layer placement, frames, origin, collisions, and color-three runtime appearance are unchanged.

## 5. Documentation and End-to-End Verification

- [ ] `C016-T016` $tid 5.1 Update `documentation/tile-map.md`, plugin documentation, and folder diagrams to list the five prepared palettes and retain the same open, paint, save, and play instructions; verify every documented path exists.
- [ ] `C016-T017` $tid 5.2 Run the focused Tiled integration tests and complete `npm.cmd test` suite and verify all tests pass.
- [ ] `C016-T018` $tid 5.3 Run `npm.cmd run build` and strict OpenSpec/Tiled JSON validation and verify production output builds without unresolved asset references.
- [ ] `C016-T019` $tid 5.4 Open the game in a real browser, verify Level01 has no console errors and matches its color-three baseline, then exercise a mixed-palette map or fixture and capture evidence that multiple palettes render with unchanged collision behavior.
