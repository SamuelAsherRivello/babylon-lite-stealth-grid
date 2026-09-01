## 1. Lock Down the Two-Layer Contract

- [x] `C019-T001` $tid 1.1 Update responsive layout tests to require `viewport-fit=cover`, a
  full-height centered 9:16 world, and a sibling viewport UI layer; run them and
  verify the new assertions fail before production changes.
- [x] `C019-T002` $tid 1.2 Add focused safe-viewport calculation tests for visual-viewport and
  layout-viewport fallback rectangles; verify they fail before the coordinator
  exists.
- [x] `C019-T003` $tid 1.3 Add lifecycle tests for resize, orientation, fullscreen,
  `ResizeObserver`, visual-viewport resize/scroll, idempotent updates, and
  disposal; verify they fail before implementation.

## 2. Separate World and UI Presentation

- [x] `C019-T004` $tid 2.1 Add `viewport-fit=cover` and move the complete UI markup into a
  sibling `.ui-layer`, leaving only world canvases in `.game-frame`.
- [x] `C019-T005` $tid 2.2 Preserve the centered full-height 9:16 world layer and stage overflow
  crop without stretch or vertical letterboxing.
- [x] `C019-T006` $tid 2.3 Make `.ui-layer` cover the visible intersection of the game frame and
  viewport, accept pointer events only through its interactive descendants,
  and provide the responsive query context for UI sizing.

## 3. Preserve the UI Safe Area

- [x] `C019-T007` $tid 3.1 Define shared safe-edge offsets from all four device safe-area insets
  plus `--screen-margin`.
- [x] `C019-T008` $tid 3.2 Anchor release metadata, gear, coordinates, joystick, action buttons,
  labels, and errors inside the corresponding safe edges while capping critical
  sizes on wide screens.
- [x] `C019-T009` $tid 3.3 Let the settings backdrop cover the visible UI layer while constraining
  the complete dialog to the safe rectangle with internal scrolling when
  necessary.

## 4. Synchronize Visual Viewport Changes

- [x] `C019-T010` $tid 4.1 Implement a pure visual-viewport reader and UI-layer bounds applier
  with a layout-viewport fallback.
- [x] `C019-T011` $tid 4.2 Subscribe one disposable coordinator to window resize, orientation,
  fullscreen, document resize observation, and visual-viewport resize/scroll;
  dispose it on pagehide.
- [x] `C019-T012` $tid 4.3 Integrate the coordinator without changing Babylon Lite world sizing,
  gameplay coordinates, or its existing canvas resize responsibility.

## 5. Verify

- [x] `C019-T013` $tid 5.1 Run focused responsive and viewport tests, `npm.cmd test`,
  `npm.cmd run build`, and `git diff --check`; record unrelated pre-existing
  failures separately.
- [x] `C019-T014` $tid 5.2 Use a real browser at narrow portrait, tall portrait, landscape, and
  desktop sizes; verify the world touches top and bottom, UI bounds preserve
  safe margins, settings stays contained, and there are no console errors.
- [x] `C019-T015` $tid 5.3 Exercise fullscreen entry/exit and a viewport-size transition where
  supported; verify the world crop and UI safe rectangle update without reload.

## 6. Correct Wide-Screen UI Containment

- [x] `C019-T016` $tid 6.1 Add a regression test proving the safe UI bounds equal the
  game-frame/viewport intersection on both wide and narrow screens.
- [x] `C019-T017` $tid 6.2 Apply the intersection bounds in the viewport coordinator and observe
  the game frame for responsive changes.
- [x] `C019-T018` $tid 6.3 Keep the UI layer hidden during its unbounded initial state and reveal
  it immediately after the first correct intersection bounds are applied.

## 7. Compact the Settings Gear

- [x] `C019-T019` $tid 7.1 Halve the responsive gear width, height, padding, and border while
  preserving its existing top and right safe-area anchors.
