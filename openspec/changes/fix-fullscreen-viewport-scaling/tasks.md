## 1. Lock Down the Responsive Contract

- [ ] 1.1 Update `test/responsive-layout.test.js` to require
  `viewport-fit=cover`, full viewport width and height, removal of the fixed
  frame aspect ratio, and safe-area variables; run the focused test and verify
  it fails against the current layout for the reported reasons.
- [ ] 1.2 Add focused logical-view layout tests for narrow portrait, tall
  portrait, landscape, and desktop rectangles; verify they require uniform
  contain scaling, centered offsets, and no logical-content clipping.
- [ ] 1.3 Add viewport lifecycle tests covering resize, orientation,
  fullscreen, `ResizeObserver`, and `visualViewport` signals plus disposal;
  verify the new tests fail before the coordinator exists.

## 2. Implement Edge-to-Edge Presentation

- [ ] 2.1 Add `viewport-fit=cover` to `index.html` and full safe-area variables
  to the root styles; verify the responsive contract test passes these
  assertions.
- [ ] 2.2 Replace height-derived 9:16 frame sizing with a top-aligned frame that
  exactly fills the drawable viewport width and `100vh`/`100dvh` height; verify
  computed bounds equal the test viewport without horizontal overflow.
- [ ] 2.3 Update settings, coordinate, and virtual-control edge offsets to
  include the relevant safe-area insets; verify every interactive hit target is
  contained by the safe visible rectangle in focused layout tests.

## 3. Preserve the Complete Logical Game View

- [ ] 3.1 Implement a pure logical-view layout calculation that returns the
  uniform contain scale and centering offsets for a 576x1024 world; verify all
  focused aspect-ratio cases pass without sprite distortion or clipping.
- [ ] 3.2 Apply the shared scale and offsets consistently to gameplay layers,
  debug drawing, coordinate conversion, and preview layers while preserving
  current gameplay coordinates; verify existing gameplay, projectile, NPC, and
  particle layout tests remain green.
- [ ] 3.3 Ensure the complete render surface clears to the game background
  outside the contained logical view; verify portrait and landscape browser
  screenshots contain no page-background bars.

## 4. Synchronize Runtime Viewport Changes

- [ ] 4.1 Inspect Babylon Lite's current backing-surface resize behavior and
  implement one disposable viewport coordinator for only the missing resize
  responsibilities; verify no duplicate authoritative resize path remains.
- [ ] 4.2 Subscribe the coordinator to window resize, orientation change,
  fullscreen change, frame `ResizeObserver`, and visual-viewport resize/scroll;
  verify focused lifecycle tests cover every signal and listener disposal.
- [ ] 4.3 Coalesce repeated layout notifications and synchronize canvas size,
  logical scale/offset, and overlay placement in one update; verify repeated
  events are idempotent and do not accumulate animation or event handles.

## 5. Verify and Release

- [ ] 5.1 Run the focused responsive and viewport tests, then `npm.cmd test`,
  `npm.cmd run build`, and `git diff --check`; record any unrelated pre-existing
  failure separately from this change.
- [ ] 5.2 Use a real browser to verify at least 614x1330 narrow portrait,
  648x1369 tall portrait, 1369x648 landscape, and 1440x900 desktop viewports;
  confirm frame edges, logical-content bounds, safe controls, and zero console
  errors at each size.
- [ ] 5.3 On a supported mobile or emulated fullscreen path, enter and exit
  fullscreen and change orientation; verify no top black strip, no horizontal
  clipping, and correct reflow without reload.
- [ ] 5.4 If a release is separately authorized, publish through the existing
  live-demo workflow and verify the public URL serves the updated viewport
  contract rather than a cached prior build.
