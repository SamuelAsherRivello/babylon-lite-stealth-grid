## 1. Establish the Collider Baseline

- [x] `C025-T001` $tid 1.1 Add a focused TSJ regression test that records the original collider-bearing tile IDs, rejects new colliders on previously collider-free tiles, and initially fails on noncanonical or zero-area geometry.
- [x] `C025-T002` $tid 1.2 Complete a read-only classification of every existing collider against its `Tilemap_color3.png` cell and verify every tile is unambiguously categorized before editing.

## 2. Quantize Existing Geometry

- [x] `C025-T003` $tid 2.1 Quantize confirmed full-square and half-tile triangle objects in place and verify their absolute geometry uses only exact tile bounds and corners.
- [x] `C025-T004` $tid 2.2 Quantize each confirmed left, right, top, and bottom edge object to a separate full-length 4-pixel rectangle and verify multi-edge tiles retain every detected side with intentional corner overlaps.
- [x] `C025-T005` $tid 2.3 Remove the confirmed zero-area non-polygon rectangles while preserving meaningful collider IDs, valid polygons, metadata, tile entries, object-group metadata, sibling tilesets, and unrelated TSJ data; verify the focused diff contains no out-of-scope changes.

## 3. Validate the Result

- [x] `C025-T006` $tid 3.1 Run the focused TSJ regression test and verify all collider shapes are canonical, in bounds, free of zero-area rectangles, and limited to the original collider-bearing tile IDs.
- [x] `C025-T007` $tid 3.2 Run `npm.cmd test`, `npm.cmd run build`, strict JSON parsing, and `openspec validate quantize-color3-tileset-colliders --type change --strict --no-interactive`; verify every command succeeds.
