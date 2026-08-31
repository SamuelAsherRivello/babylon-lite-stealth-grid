## Context

The current page centers a full-height 9:16 `.game-frame`. On viewports narrower
than 9:16, that world frame is intentionally wider than the screen, but the DOM
HUD currently lives inside the same clipped frame. As a result, the world crop
also cuts off the version, gear, coordinates, virtual controls, and settings
dialog. The page also omits `viewport-fit=cover`, which can leave mobile
fullscreen showing page background above the game.

The approved model separates presentation into two coordinate spaces: a
centered, full-height 9:16 world layer that may crop horizontally, and a UI
layer bounded by the visible intersection of that world and the viewport.

## Goals / Non-Goals

**Goals:**

- Fill the drawable viewport vertically with the game world and no top bar.
- Preserve the world's 9:16 aspect ratio without stretching.
- Allow peripheral world content to crop horizontally on narrow screens.
- Keep every HUD and interactive UI element inside a margin-preserving safe
  rectangle derived from the visual viewport and device safe-area insets.
- Recalculate both layers across fullscreen, orientation, and visual viewport
  changes.

**Non-Goals:**

- Changing the 576x1024 logical world, gameplay coordinates, camera, or assets.
- Making the whole world visible on every aspect ratio.
- Moving the UI back inside the cropped world frame.
- Redesigning controls or settings beyond responsive containment.

## Decisions

### Keep the world as a centered full-height 9:16 crop

`.game-frame` remains `56.25dvh` wide and `100dvh` high with a 9:16 aspect
ratio, centered inside an overflow-hidden viewport stage. This fills the
vertical space first, preserves world proportions, and permits only peripheral
horizontal cropping on narrower screens.

Alternative considered: stretch or contain the complete logical world within
the viewport. Rejected because stretching distorts the game and containing it
reintroduces letterboxing instead of the approved full-height crop.

### Put UI in an independent visual-viewport layer

The HUD, coordinates, virtual controller, settings UI, and error output move
from `.game-frame` into a sibling `.ui-layer`. Its bounds are the intersection
of the game frame and visible viewport: on wide screens it matches the game
window, while on narrow screens it matches only the visible crop. This keeps UI
inside the game window without allowing world cropping to hide it. It also acts
as the query container for responsive UI sizing.

Alternative considered: counter-transform individual controls inside the world
frame. Rejected because it couples every UI element to world crop math and is
fragile as controls are added.

### Define one safe rectangle for all UI edges

The page opts into `viewport-fit=cover`. CSS combines each
`env(safe-area-inset-*)` with the configured `--screen-margin`; release
metadata, gear, coordinates, controller groups, and settings dialog all anchor
or constrain themselves using those shared safe edges. The settings backdrop
may cover the viewport, while the complete dialog must fit and scroll inside
the safe rectangle.

Alternative considered: pad the entire world by safe-area values. Rejected
because that creates visible outer bars and reduces the world coverage.

### Track the visual viewport with a disposable coordinator

A small coordinator reads `window.visualViewport` when present, otherwise the
layout viewport, intersects it with `.game-frame`, and applies the resulting
offset and dimensions to `.ui-layer`. It
updates on window resize, orientation change, fullscreen change, visual
viewport resize/scroll, and document resize observation. All subscriptions are
disposed on pagehide.

The world remains CSS-sized; the coordinator owns only visible UI bounds. This
keeps one clear responsibility and avoids changing Babylon Lite's existing
canvas/backing-surface behavior.

## Risks / Trade-offs

- [Peripheral world content is hidden on narrow screens] -> This is intentional
  and limited to the world layer; gameplay UI remains fully visible.
- [Safe insets plus the screen margin leave little room on very small screens]
  -> Constrain the dialog to the safe rectangle and allow its contents to
  scroll; retain responsive clamps for control sizes.
- [Desktop viewport-width query units could oversize UI] -> Cap critical HUD
  and dialog sizes while retaining proportional mobile sizing.
- [Several viewport signals fire for one transition] -> Make updates
  idempotent and dispose all observers/listeners.
- [Other active changes touch shared files] -> Re-read live files immediately
  before editing and preserve unrelated work.

## Migration Plan

1. Add failing contracts for the sibling UI layer, safe rectangle, viewport
   coordinator, and lifecycle disposal.
2. Move UI markup outside the world and add `viewport-fit=cover`.
3. Implement safe-edge CSS and settings containment.
4. Integrate the viewport coordinator without changing world coordinates.
5. Run focused tests, the full suite, a production build, and responsive real-
   browser checks. Release remains a separately authorized step.
