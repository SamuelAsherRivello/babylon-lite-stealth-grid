## Why

The current height-first presentation still leaves a black strip above the game
on some mobile fullscreen viewports and clips controls together with the wider
9:16 world. The game needs a full-bleed world layer that may crop independently
from a safe-area-aware UI layer whose interactive content always stays visible.

## What Changes

- Extend the page into mobile display cutouts and fullscreen safe-area regions
  so the game background begins at the physical top of the drawable viewport.
- Keep the world as a centered, full-height 9:16 presentation that preserves
  artwork proportions and may crop peripheral world content horizontally.
- Separate the UI presentation from the cropped world and lay it out against an
  explicit visible safe-area rectangle.
- Track browser, fullscreen, orientation, and visual-viewport changes so the
  world crop and UI safe area remain aligned as mobile browser chrome changes.
- Keep every HUD element and interactive control inside the UI safe area
  without stretching world sprites or tying UI positions to cropped edges.
- Add automated responsive-layout coverage and real-browser portrait,
  landscape, and desktop verification based on the proven viewport handling in
  `babylon-walking-mobile`.

## Capabilities

### New Capabilities

- `responsive-game-viewport`: Defines edge-to-edge world coverage, permitted
  world cropping, safe-area-contained UI, and resize behavior across desktop
  and mobile fullscreen layouts.

### Modified Capabilities

None.

## Impact

- Affects the document viewport declaration, stage and game-frame CSS, canvas
  presentation, crop-aware world layout, safe-area UI layout, and resize
  lifecycle.
- Updates responsive-layout and viewport-scaling tests and adds browser QA at
  representative narrow portrait, landscape, and desktop sizes.
- Introduces no new runtime dependency and does not change gameplay rules,
  input bindings, logical world dimensions, or asset content.
