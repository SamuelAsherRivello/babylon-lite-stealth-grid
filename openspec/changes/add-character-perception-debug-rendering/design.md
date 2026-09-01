## Context

The game already has a canvas-based collider diagnostics pass that draws grid lines, terrain colliders, character colliders, centers, and projectile colliders. The centralized perception change provides read-only geometry and active detection data.

## Goals / Non-Goals

**Goals:**

- Add perception overlays to the existing Collider-mode diagnostics pass.
- Keep channel colors, stroke widths, overlap, and active-state emphasis deterministic.
- Consume a stable snapshot without coupling rendering to enemy controllers.

**Non-Goals:**

- Rendering perception during normal gameplay.
- Tap, mouse, or finger selection of a character.
- Rendering awareness percentages as graduated line widths.

## Decisions

- Draw centered triangles at 50% of each logical cell rather than filling cells; this preserves terrain, sprites, and collider readability.
- Use white 4px Visual strokes and purple 2px Audio strokes; active indicators double their respective widths.
- Draw both channels independently when they overlap, with render ordering that preserves both outlines.
- Add perception drawing inside the existing debug canvas lifecycle after grid setup and before/around existing collider markers according to readability tests.
- Treat the perception manager's snapshot as the only input; the renderer does not recalculate detection or inspect actors.

## Risks / Trade-offs

- [Many enemies can create dense overlays] -> Keep indicators cell-sized, low visual complexity, and limited to Collider mode.
- [Canvas/world Y conversion can invert up/down] -> Use the canonical grid-to-screen helper and test all four facings.
- [A rendering change can accidentally become a gameplay dependency] -> Define the snapshot as read-only and keep alert behavior outside this change.

## Migration Plan

Add the drawing commands to the existing diagnostics pass and verify Collider mode on/off behavior. If the overlay is unsuitable, disable its draw call without changing centralized detection.
