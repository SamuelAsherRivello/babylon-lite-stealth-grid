## 1. Persistent Settings Foundation

- [x] 1.1 Add failing settings-store tests for 100/100/false defaults, valid reads and writes, per-key validation, malformed and wrong-version payload recovery, and unavailable storage; verify the focused tests fail before production code exists.
- [x] 1.2 Implement the versioned `babylon-lite-stealth-grid.settings` store with get, set, subscribe, and immediate persistence behavior; verify the focused defaults, validation, recovery, and notification tests pass.
- [x] 1.3 Add failing reset tests covering document removal, in-memory defaults, subscriber notification, unrelated-key preservation, and rejected removal; implement resilient reset and verify the focused tests pass.
- [x] 1.4 Add tests and a small category-volume helper for Music and SFX normalization, base-volume multiplication, clamping, mute, and no-audio safety; verify the focused tests pass without adding media assets.

## 2. Pause and Input Isolation

- [x] 2.1 Add failing pause-controller tests for active versus zero game delta, clearing input on pause, timestamp reset on resume, and idempotent open/close transitions; verify they fail before the pause implementation.
- [x] 2.2 Add a reset/cancel API to keyboard and virtual-controller input ownership and wire it into the pause controller; verify focused tests prove held keys and captured pointers do not survive pause.
- [x] 2.3 Route player movement, Jump/Shoot actions, player animation, animated terrain, coordinate mutation, and diagnostic updates through the active-time pause boundary while keeping rendering and resize scaling alive; verify unit/contract tests prove no mutable state advances while paused and no wall-clock catch-up occurs after resume.

## 3. Reusable Window and Settings UI

- [x] 3.1 Add failing DOM-harness tests for a reusable modal window's dialog labelling, single-instance lifecycle, direct-backdrop dismissal, X dismissal, non-dismissal from panel content, focus entry, and focus return; verify the tests fail before the window implementation.
- [x] 3.2 Implement the reusable game-window primitive and verify all focused lifecycle, dismissal, and accessibility tests pass.
- [x] 3.3 Add failing settings-UI tests for gear toggling, `Settings Menu` title, Music and SFX 0-100 sliders with endpoint labels, `Collider?`, immediate store updates, Reset synchronization while remaining open, and gear/X/backdrop close paths; verify they fail before the settings composer exists.
- [x] 3.4 Implement the settings composer and mount one persistent UI host and gear inside the game frame; verify the focused settings-UI tests pass and modal input does not reach the canvas or virtual controller.

## 4. Inspiration Styling and Diagnostics Integration

- [x] 4.1 Add the inspiration gear SVG as a local public asset and add a contract test that verifies the gear uses it with an accessible button label; verify the asset and contract test pass.
- [x] 4.2 Port the inspiration's frame-relative gear, 50 percent backdrop, 76cqw modal, dark blue gradient, circular X, controls, Reset button, focus styles, spacing, and z-order into the existing stylesheet; verify CSS contract tests reject fixed viewport sizing and confirm the authored cqw measurements.
- [x] 4.3 Bind `debug.showColliders` to the full diagnostic canvas draw path so the default and Reset hide it and enabling it redraws current terrain and player diagnostics without changing collision results; verify focused tests cover off, on, reload, and reset states.
- [x] 4.4 Resolve any gear/coordinate-pill overlap by adjusting only the existing HUD layout while preserving the specified gear measurements; verify screenshots show both controls readable at desktop and portrait-mobile sizes.
- [x] 4.5 Add a failing component contract test for `Coordinates UI`, rename the existing coordinate readout's HTML id/class, CSS selector, JavaScript references, and tests to that name, then position it directly below the unchanged gear and verify focused tests plus desktop and portrait screenshots.
- [x] 4.6 Add failing path-contract tests, move all DOM UI modules and the stylesheet under `src/ui/`, move the gear to `public/ui/gear.svg`, update imports and Vite-safe asset paths, and verify no moved UI source or asset remains at its former root location.

## 5. Integrated Verification

- [x] 5.1 Run `npm.cmd test` and fix only regressions caused by this change until the full suite passes.
- [x] 5.2 Run `npm.cmd run build` and verify the production bundle succeeds with no new runtime dependency or missing gear asset.
- [x] 5.3 Launch the documented Vite dev server and use a real browser to verify gear placement, visual parity, all settings controls, persistence after reload, Reset remaining open, X/gear/backdrop dismissal, focus behavior, and blocked underlying controls in a large desktop viewport.
- [x] 5.4 Repeat the live flow in a narrow 9:16 portrait-mobile viewport, resize while the menu is open, and verify frame-relative composition, touch dragging, no overlap, frozen gameplay/animations, continued rendering, and clean resume without fast-forward.
- [x] 5.5 Inspect the final diff and confirm the implementation excludes `Skip Start Menu`, native-file/server persistence, new audio media, unrelated HUD redesign, and unrelated repository changes.
