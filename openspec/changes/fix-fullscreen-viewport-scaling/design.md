## Context

See `proposal.md` for motivation and
`specs/responsive-game-viewport/spec.md` for the behavior contract. The current
page centers a 9:16 `.game-frame` whose width is derived from viewport height.
On screens narrower than 9:16, the frame is wider than the visible viewport and
clips both game content and DOM controls. The page also omits
`viewport-fit=cover`, allowing some mobile fullscreen configurations to reserve
a page-background strip at the top.

The `babylon-walking-mobile` reference uses `viewport-fit=cover`, full-height
viewport units, safe-area variables, fixed top alignment, `ResizeObserver`, and
`visualViewport` listeners. Its centered 9:16 crop is suitable for a 3D camera
and crop-aware HUD, but this sprite game has a fixed logical 576x1024 world and
must not crop its map or controls.

## Goals / Non-Goals

**Goals:**

- Make the game container equal the current drawable viewport rectangle.
- Preserve a uniform logical-world scale and expose all logical content.
- Extend only the background into cutout regions while keeping controls safe.
- Respond reliably to fullscreen, orientation, layout-viewport, and
  visual-viewport changes.
- Keep the solution dependency-free and compatible with the existing Babylon
  Lite render loop and DOM overlays.

**Non-Goals:**

- Changing the 576x1024 logical world, tile grid, gameplay coordinates, or
  sprite assets.
- Copying the reference game's fixed 9:16 horizontal crop.
- Redesigning HUD positions, control artwork, or settings behavior beyond the
  adjustments required to keep them visible.
- Implementing browser-specific JavaScript branches when standards-based
  viewport and safe-area primitives suffice.

## Decisions

### Use a viewport-shaped frame instead of a fixed-aspect frame

The stage and `.game-frame` will occupy the full drawable viewport width and
height. The frame will no longer derive width from height or declare a fixed CSS
aspect ratio. Both canvases and the DOM overlay will fill that frame exactly.

Alternative considered: retain the 9:16 frame and center-crop it like
`babylon-walking-mobile`. Rejected because the reported failure is loss of
actual 2D map and control content, not merely peripheral 3D camera scenery.

### Separate viewport coverage from logical-world scaling

The render surface and green clear color will cover the complete frame. The
logical 576x1024 view will use a uniform contain scale based on the smaller of
the horizontal and vertical scale factors, with the logical view centered in
the remaining game-background space. DOM overlays will use the full frame and
safe-area constraints rather than inheriting a cropped logical width.

Alternative considered: non-uniformly stretch the 576x1024 canvas to the
viewport. Rejected because it would distort sprites, tiles, colliders, and
movement geometry.

### Adopt the reference viewport and safe-area contract

Add `viewport-fit=cover`, expose all four `env(safe-area-inset-*)` values, and
size the root, body, stage, and frame with full width plus `100vh`/`100dvh`
height fallbacks. The background may render behind unsafe regions; interactive
controls will add the appropriate safe-area inset to their edge offsets.

Alternative considered: pad the entire game frame by safe-area values. Rejected
because it recreates visible outer bars and wastes drawable background space.

### Synchronize with every viewport signal that can change mobile layout

Use a small disposable viewport coordinator to respond to window resize,
orientation change, fullscreen change, frame `ResizeObserver` notifications,
and `visualViewport` resize/scroll. Updates will be coalesced when practical and
will synchronize render-surface dimensions, logical scale/offset, and overlays.

Alternative considered: rely only on CSS and the existing engine start loop.
Rejected because mobile browser chrome and fullscreen transitions can change
the visual viewport without producing a reliable layout result at the same
moment as a conventional window resize.

## Risks / Trade-offs

- [Tall screens show additional green space outside the logical game view] →
  Treat that area as intentional game background so all content remains visible
  without distortion or black letterboxing.
- [Safe-area padding could crowd controls on unusually small displays] → Use
  the existing responsive clamps and validate minimum hit-target visibility at
  the narrowest supported portrait viewport.
- [Several resize signals may fire for one transition] → Coalesce layout work
  and make updates idempotent; dispose every observer and listener on pagehide.
- [Babylon Lite may already resize its backing surface internally] → Inspect
  the current engine behavior during apply and keep one authoritative resize
  path, adding coordination only where browser tests prove it is needed.
- [Other active changes also modify `src/main.js` and `style.css`] → Re-read the
  live files before apply and preserve unrelated release metadata, NPC, and
  particle work.

## Migration Plan

1. Add failing contract tests for viewport coverage, no fixed-aspect overflow,
   safe-area offsets, and the required viewport meta declaration.
2. Replace fixed-aspect frame sizing with full-viewport sizing and uniform
   logical contain scaling.
3. Add and dispose the required viewport synchronization hooks.
4. Run focused tests, the full Node test suite, and a production build.
5. Verify narrow portrait, tall portrait, landscape, and desktop layouts in a
   real browser, including fullscreen entry and exit where supported.
6. Publish through the existing demo workflow. Rollback is an additive revert
   commit restoring the prior frame rules if a supported browser regresses.
