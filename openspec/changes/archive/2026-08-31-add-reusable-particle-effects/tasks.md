## 1. Assets and Descriptor Contract

- [x] `C011-T001` $tid 1.1 Copy the untouched `Particle FX.aseprite` into `assets/source/particles/` and all eight exported PNG sheets into `public/assets/particles/`, then verify filenames, byte-for-byte source equality, PNG dimensions, and that application code contains no runtime `.aseprite` URL.
- [x] `C011-T002` $tid 1.2 Add failing unit tests for descriptor validation and the eight-entry Particle FX catalog, covering names, asset URLs, 64x64 or 192x192 native grids, frame counts, forward direction, 100 ms timing, looping defaults, and configurable 64x64 preview size; run the focused test and confirm it fails before production modules exist.
- [x] `C011-T003` $tid 1.3 Implement the immutable Particle FX catalog and generic descriptor validation under `plugins/aseprite-babylon-lite/`, then rerun the focused descriptor tests and verify they pass.

## 2. Reusable Playback Integration

- [x] `C011-T004` $tid 2.1 Add failing unit tests for the reusable adapter/base lifecycle, verifying native-grid atlas loading, capacity-one top-left-pivot layer creation, frame-range playback, restart-from-zero behavior, idempotent repeated `play()` and `stop()`, and retention of the sprite after stopping; run the focused test and confirm the missing behavior fails.
- [x] `C011-T005` $tid 2.2 Implement the reusable Babylon Lite adapter and `AnimatedParticleEffect` base using public `@babylonjs/lite` APIs, then rerun the focused lifecycle tests and verify all control cases pass.
- [x] `C011-T006` $tid 2.3 Document the local plugin's descriptor format, Aseprite inspection workflow, runtime boundary, supported uniform-grid limitation, and example consumer usage in `plugins/aseprite-babylon-lite/README.md`; verify every documented import and field matches implemented code.

## 3. Concrete Particle Classes

- [x] `C011-T007` $tid 3.1 Add failing unit tests that import and instantiate Dust 01, Dust 02, Explosion 01, Explosion 02, Fire 01, Fire 02, Fire 03, and Water Splash from their effect-specific `src/particle-fx/` folders and verify each selects exactly its corresponding catalog descriptor.
- [x] `C011-T008` $tid 3.2 Implement the eight concrete particle-effect classes in their specified subfolders, plus a particle-effects barrel export, and rerun the concrete-class tests to verify independent construction and inherited `play()`/`stop()` behavior.

## 4. Centered Preview Integration

- [x] `C011-T009` $tid 4.1 Add failing tests for a pure eight-cell row-layout helper, verifying X positions 32 through 480, Y 480, 64x64 display cells, 512x64 centered bounds, stable catalog order, and render order 3 in the 576x1024 logical viewport.
- [x] `C011-T010` $tid 4.2 Implement the layout helper and update `src/main.js` to load all eight effects, append their layers above the existing layers, apply viewport zoom to every particle layer, and start each preview instance looping; run tests and a production build to verify integration and asset resolution.
- [x] `C011-T011` $tid 4.3 Update `README.md` to describe the particle source/runtime asset split, plugin, concrete class locations, preview behavior, and play/stop usage; verify documented paths and commands against the checkout.

## 5. Final Verification

- [ ] `C011-T012` $tid 5.1 Run `npm.cmd test`, `npm.cmd run build`, `openspec validate add-reusable-particle-effects --strict`, and `git diff --check`, and verify every command passes.
- [x] `C011-T013` $tid 5.2 Run the app and perform a real WebGPU browser smoke test at desktop and portrait viewport sizes, verifying exactly eight distinct animations loop in one centered horizontal row above existing sprites, remain aligned after resize, and produce no console or asset-loading errors.
- [x] `C011-T014` $tid 5.3 Exercise one particle instance's `stop()` and `play()` methods in the browser, verifying stop freezes its current visible frame, repeated stop/play calls are safe, and play restarts looping from frame zero without creating concurrent animation handles.

## 6. Persisted Preview Debug Settings

- [x] `C011-T015` $tid 6.1 Add failing settings-store tests for independent `showParticleFxPreview` and `showAnimatedTilePreview` boolean keys, false defaults, persistence, invalid-value recovery, notifications, and reset behavior; run the focused tests and confirm the new expectations fail.
- [x] `C011-T016` $tid 6.2 Implement both debug keys in the existing settings store and rerun the focused store tests to verify they pass.
- [x] `C011-T017` $tid 6.3 Add failing Settings-menu tests for exact `Particle FX Preview?` and `Animated Tile (Preview)` checkbox labels, persisted initial values, independent writes, and reset synchronization; run the focused tests and confirm the missing controls fail.
- [x] `C011-T018` $tid 6.4 Implement both Settings-menu controls using the existing checkbox style and store, then rerun the focused UI tests to verify they pass.
- [x] `C011-T019` $tid 6.5 Add failing runtime integration tests requiring both previews to initialize hidden and stopped, apply persisted values, and subscribe independently using Babylon Lite layer visibility plus play/stop operations; run the focused tests and confirm current always-visible playback fails.
- [x] `C011-T020` $tid 6.6 Implement the two independent preview subscriptions and cleanup in `src/main.js`, update documentation to describe their off-by-default behavior, and rerun focused particle/settings tests plus the production build.
- [x] `C011-T021` $tid 6.7 Perform a real WebGPU browser test covering default-hidden state, each preview enabled alone, both enabled, stopped hidden animations, Reset, reload persistence, portrait resize, asset loading, and console errors; record observed results.
- [ ] `C011-T022` $tid 6.8 Run the complete automated gate, resolve only in-scope failures, mark task 5.1 complete only if every listed command passes, validate that all OpenSpec tasks are complete, and prepare the change for archive.
