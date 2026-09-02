## Context

The centralized perception service already identifies living enemies, cardinal visual cells, visual strength, and perception snapshots. The current canvas diagnostics render perception geometry only as Collider-mode overlays; the new asset is a 64x64 tile-sized PNG at `public/assets/terrain/tile-shadow.png`.

## Goals / Non-Goals

**Goals:**

- Share one visibility calculation between normal gameplay shadows and Collider-mode perception rendering.
- Preserve the existing 40/30/20/10 visual-strength mapping.
- Keep the shadow centered and tile-aligned while allowing multiple enemies to render independently.
- Ensure terrain and living-character blockers clip the rendered path at the first blocked cell.

**Non-Goals:**

- Changing enemy perception rules, detection events, alert reactions, or visual range.
- Replacing the existing Collider-mode outlines, active markers, or audio diagnostics.
- Adding player-controlled toggles or a new dependency.

## Decisions

- Add a dedicated shadow draw-command representation carrying cell position and opacity, rather than embedding image loading or blocker logic in enemy controllers. This keeps perception behavior rendering-agnostic and testable; directly drawing from controllers was rejected because it would couple gameplay updates to canvas lifecycle.
- Derive the visible visual path from the enemy's current cardinal cells and the same terrain/living-character blocker contract used by perception. Stop before the first blocker, rather than displaying the full geometric range; this matches the requested observable sight behavior.
- Draw the PNG at native 64x64 tile size, centered on the logical cell. Scaling to the cell avoids assumptions about the source image's original 192x192 canvas and keeps the updated asset pixel-aligned.
- Use the existing visual falloff values as alpha multipliers: 0.40, 0.30, 0.20, and 0.10. A fixed base opacity was rejected because it would not communicate distance as clearly.
- Run the shadow pass in the normal world-render lifecycle and invoke the same command generation during Collider mode. Debug outlines remain additive so enabling diagnostics does not change gameplay perception state.

## Risks / Trade-offs

- [Runtime image loading may briefly leave shadows absent] -> Load the static asset with the existing asset-loading path and tolerate a missing image without failing the game render.
- [Different render layers may place shadows above characters] -> Place the shadow pass beneath character art while preserving terrain and collider readability.
- [Blocker data can drift from perception evaluation] -> Centralize or reuse the same visible-prefix helper and cover terrain, living-character, dead-character, and multiple-enemy cases with focused tests.
- [Overlapping enemies can darken a cell] -> Keep per-enemy commands independent; normal alpha compositing provides deterministic overlap without changing perception strength.
