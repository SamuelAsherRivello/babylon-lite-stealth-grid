## 1. Tiled Normalization Contract

- [x] 1.1 Add failing plugin tests for external image-collection tilesets, bottom-center tile-object coordinates, class/tile/object property precedence, animation descriptors, and sensor shapes; verify the new tests fail for missing object-layer normalization.
- [x] 1.2 Extend Tiled map and tileset validation for the supported reactive-decoration object contract and verify invalid layer, class, visual, frame, sensor, blocking, trigger, and playback fixtures produce object-specific actionable errors.
- [x] 1.3 Implement pure object-layer and reactive-decoration normalization while preserving existing tile-layer output; verify focused Tiled tests and the existing Tiled level tests pass.

## 2. Bush Authoring Assets

- [x] 2.1 Copy the supplied 1024 x 128 `Bushe1.png` into the repository and deterministically create its 128 x 128 frame-zero editor preview; verify both image dimensions and transparent PNG format in an automated asset test.
- [x] 2.2 Add the one-item external bush tileset with animation metadata, class defaults, and a non-blocking lower-footprint sensor; verify the tileset exposes exactly one placeable tile and resolves eight runtime frames.
- [x] 2.3 Add the `ReactiveDecoration` class and canonical `Y-Sorted Props` object layer to the Tiled project/map, register the decoration tileset, and place a sample bush; verify checked-in TMJ/TSJ references, object type, layer, anchor, and properties through automated tests.
- [x] 2.4 Update third-party asset attribution for the copied source and derived preview and verify repository documentation names their origin and role.

## 3. Reactive Decoration Runtime

- [x] 3.1 Add failing controller tests for initial frame zero, supported character entry, non-character exclusion, no restart while playing, completion reset, occupied disarm, empty-sensor rearm, multiple occupants, independent instances, and disposal.
- [x] 3.2 Implement the reusable occupancy-driven reactive-decoration controller against injected collider and animation APIs; verify all focused controller tests pass.
- [x] 3.3 Add failing renderer/integration tests for authored transform, bottom-center sensor alignment, shared animation-manager use, non-blocking obstacle separation, and Y-derived depth ordering.
- [x] 3.4 Integrate normalized decorations into the composition root, renderer lifecycle, living typed-character collider updates, shared animation manager, and disposal; verify focused runtime and render-depth tests pass.

## 4. End-to-End Verification

- [x] 4.1 Run the complete automated test suite and production build, fixing only in-scope regressions until both commands pass.
- [x] 4.2 Open the saved level in Tiled or validate its JSON-equivalent authoring contract and verify the bush appears as one selectable tile item placed as an independent object on `Y-Sorted Props`.
- [x] 4.3 Run the built game in a real browser and verify the sample bush is visible, permits character passage, plays frames zero through seven once on entry, does not restart while occupied, returns to frame zero, rearms after exit, and respects front/behind depth ordering.
