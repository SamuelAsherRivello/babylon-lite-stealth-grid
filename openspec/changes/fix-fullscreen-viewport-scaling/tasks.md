## 1. Lock Down the Two-Layer Contract

- [x] 1.1 Update responsive layout tests to require `viewport-fit=cover`, a
  full-height centered 9:16 world, and a sibling viewport UI layer; run them and
  verify the new assertions fail before production changes.
- [x] 1.2 Add focused safe-viewport calculation tests for visual-viewport and
  layout-viewport fallback rectangles; verify they fail before the coordinator
  exists.
- [x] 1.3 Add lifecycle tests for resize, orientation, fullscreen,
  `ResizeObserver`, visual-viewport resize/scroll, idempotent updates, and
  disposal; verify they fail before implementation.

## 2. Separate World and UI Presentation

- [x] 2.1 Add `viewport-fit=cover` and move the complete UI markup into a
  sibling `.ui-layer`, leaving only world canvases in `.game-frame`.
- [x] 2.2 Preserve the centered full-height 9:16 world layer and stage overflow
  crop without stretch or vertical letterboxing.
- [x] 2.3 Make `.ui-layer` cover the visible intersection of the game frame and
  viewport, accept pointer events only through its interactive descendants,
  and provide the responsive query context for UI sizing.

## 3. Preserve the UI Safe Area

- [x] 3.1 Define shared safe-edge offsets from all four device safe-area insets
  plus `--screen-margin`.
- [x] 3.2 Anchor release metadata, gear, coordinates, joystick, action buttons,
  labels, and errors inside the corresponding safe edges while capping critical
  sizes on wide screens.
- [x] 3.3 Let the settings backdrop cover the visible UI layer while constraining
  the complete dialog to the safe rectangle with internal scrolling when
  necessary.

## 4. Synchronize Visual Viewport Changes

- [x] 4.1 Implement a pure visual-viewport reader and UI-layer bounds applier
  with a layout-viewport fallback.
- [x] 4.2 Subscribe one disposable coordinator to window resize, orientation,
  fullscreen, document resize observation, and visual-viewport resize/scroll;
  dispose it on pagehide.
- [x] 4.3 Integrate the coordinator without changing Babylon Lite world sizing,
  gameplay coordinates, or its existing canvas resize responsibility.

## 5. Verify

- [x] 5.1 Run focused responsive and viewport tests, `npm.cmd test`,
  `npm.cmd run build`, and `git diff --check`; record unrelated pre-existing
  failures separately.
- [x] 5.2 Use a real browser at narrow portrait, tall portrait, landscape, and
  desktop sizes; verify the world touches top and bottom, UI bounds preserve
  safe margins, settings stays contained, and there are no console errors.
- [x] 5.3 Exercise fullscreen entry/exit and a viewport-size transition where
  supported; verify the world crop and UI safe rectangle update without reload.

## 6. Correct Wide-Screen UI Containment

- [x] 6.1 Add a regression test proving the safe UI bounds equal the
  game-frame/viewport intersection on both wide and narrow screens.
- [x] 6.2 Apply the intersection bounds in the viewport coordinator and observe
  the game frame for responsive changes.
- [x] 6.3 Keep the UI layer hidden during its unbounded initial state and reveal
  it immediately after the first correct intersection bounds are applied.

## 7. Compact the Settings Gear

- [x] 7.1 Halve the responsive gear width, height, padding, and border while
  preserving its existing top and right safe-area anchors.
