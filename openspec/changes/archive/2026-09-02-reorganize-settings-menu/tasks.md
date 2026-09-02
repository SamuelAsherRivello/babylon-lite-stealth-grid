## 1. Settings Window Composition

- [x] 1.1 `C042-T001` Refactor `src/ui/settings-ui.js` so the top-level Settings Menu keeps Music, SFX, and FullScreen, replaces the Developer section with a `Developer Settings` button, and verify focused settings composition tests pass
- [x] 1.2 `C042-T002` Add nested Developer Settings lifecycle using the existing `GameWindow`, moving Collider, Crop Marks, Particle FX (Preview), Animated Tile (Preview), and Reset into it; verify child open/close and parent visibility behavior with unit tests
- [x] 1.3 `C042-T003` Preserve single pause/resume ownership, fullscreen listener disposal, reset synchronization, focus return, and active-layer input isolation; verify lifecycle and dismissal tests pass

## 2. Styling and Verification

- [x] 2.1 `C042-T004` Update `src/ui/style.css` for the Developer Settings button and stacked modal layer while preserving frame-relative responsive measurements; verify style contract tests pass
- [x] 2.2 `C042-T005` Extend `test/ui/settings-ui.test.js` with exact button/option labels, nested modal, X/backdrop dismissal, reset placement, and keyboard/input isolation coverage; verify `npm test` passes
- [x] 2.3 `C042-T006` Run the production build and verify the live browser flow gear → Settings Menu → Developer Settings → X/backdrop on desktop and portrait-sized frames
