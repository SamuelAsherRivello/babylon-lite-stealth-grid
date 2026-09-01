## 1. Plugin Contract and Test Fixtures

- [x] `C014-T001` $tid 1.1 Audit current Babylon Lite-compatible Tiled libraries for TMJ/TSJ coverage, maintenance, license, bundle size, tree-shaking, and browser/Node support; record candidates and verify the decision either selects a qualifying dependency behind the plugin API or justifies local implementation
- [x] `C014-T002` $tid 1.2 Create the `/plugins/tiled-babylon-lite/` package structure, stable public exports, and README around the selected dependency or local implementation, and verify Node can import its entry point without a browser or WebGPU
- [ ] `C014-T003` $tid 1.3 Add minimal supported and invalid TMJ/TSJ fixtures plus failing contract tests for external tilesets, required layers, unsupported maps, direct-TMJ loading, and actionable errors, and verify the focused tests fail for the missing implementation
- [ ] `C014-T004` $tid 1.4 Add failing grid-planning tests for exact and non-divisible screens, portrait and landscape layouts, incompatible tilesets, and the 576-by-1024 Tiny Swords 9-by-16 viewport, and verify failures identify missing decisions or implementation
- [ ] `C014-T005` $tid 1.5 Add failing coordinate tests for origin-relative tile cells, points, rectangles, polygons, tile objects, negative coordinates, map bounds, and round trips, and verify each failure identifies the unimplemented conversion

## 2. Reusable Tiled Normalization

- [ ] `C014-T006` $tid 2.1 Implement finite orthogonal TMJ validation and external TSJ resolution, and verify the focused parser and unsupported-map tests pass
- [ ] `C014-T007` $tid 2.2 Implement deterministic normalization of ordered layers, global tile identifiers, properties, tile offsets, animations, collision shapes, and gameplay objects, and verify the normalization fixture tests pass
- [ ] `C014-T008` $tid 2.3 Implement coordinate conversion for all supported cell and object shapes, and verify the focused conversion and round-trip tests pass
- [ ] `C014-T009` $tid 2.4 Implement collision and terrain-semantic extraction with placed override precedence and whole-cell fallback bounds, and verify focused collision tests pass
- [ ] `C014-T010` $tid 2.5 Implement a browser fetch adapter with tileset caching and descriptive fetch errors, and verify it with mocked fetch tests
- [ ] `C014-T011` $tid 2.6 Implement pure AI-facing grid planning that preserves inherent tile dimensions and returns exact or explicit candidate layouts, and verify all focused grid-planning tests pass

## 3. Tiled Authoring Workspace

- [ ] `C014-T012` $tid 3.1 Create the AI-managed repository `.tiled-project`, class/property definitions, and Tiny Swords external TSJ files using relative asset paths, and verify Tiled JSON files parse and every referenced image exists
- [ ] `C014-T013` $tid 3.2 Create the canonical finite empty level with a 64 px grid, 9-by-16 initial viewport, exactly one non-rendered origin marker tile, and ordered visual, grid-gameplay, and object-gameplay layers, and verify the reusable validator accepts it and derives origin-relative bounds
- [ ] `C014-T014` $tid 3.3 Create a small authored sample level containing visible terrain, water foam, one elevation, blocked and walkable cells, one player spawn, one enemy patrol, one trigger, and one exit, and verify normalization exposes every authored element
- [ ] `C014-T015` $tid 3.4 Add a project-local read-only Tiled extension that validates the active map and reports actionable issues, and verify its shared validation behavior with Node tests plus a syntax check

## 4. Babylon Lite Integration

- [ ] `C014-T016` $tid 4.1 Add failing adapter tests for converting normalized visual layers into Babylon Lite sprite inputs with correct layer order, frame IDs, positions, offsets, visibility, and animation metadata, and verify they fail before the adapter exists
- [ ] `C014-T017` $tid 4.2 Implement the Babylon Lite sprite adapter and verify the focused adapter tests pass without initializing WebGPU
- [ ] `C014-T018` $tid 4.3 After resolving the recorded invalid-map runtime policy, migrate `src/main.js` to load the human-saved sample TMJ directly, construct visual layers and collision inputs, and derive origin-relative playfield bounds while preserving player animation, input, viewport scaling, and diagnostics; verify existing and new integration tests pass
- [ ] `C014-T019` $tid 4.4 Remove only obsolete startup assumptions from the hard-coded terrain review path while retaining reusable reviewed classification and collision helpers until their remaining callers are migrated, and verify no existing test coverage is silently discarded

## 5. Documentation and End-to-End Verification

- [x] `C014-T020` $tid 5.1 Document the exact content-only human workflow: open the AI-named project and map, edit existing layers and configured objects, save the TMJ, and identify it to the AI; document that all dimensions, origins, tilesets, layers, classes, properties, and runtime setup are AI-managed, and verify every documented path exists
- [ ] `C014-T021` $tid 5.2 Run focused plugin tests, the full `npm test`, and `npm run build`, and verify all commands complete successfully
- [ ] `C014-T022` $tid 5.3 Open the built application in a real WebGPU-capable browser, verify the authored sample renders with correct ordering and collision diagnostics, and record the tested URL and observed level behavior
- [ ] `C014-T023` $tid 5.4 Review the final diff for accidental Sprite Fusion support, new production dependencies, generated downloads, or unrelated edits, and verify the delivered integration remains exclusively Tiled and repository-local
