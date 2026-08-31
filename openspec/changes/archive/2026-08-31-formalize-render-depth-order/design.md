## Context

See proposal.md and specs/render-depth-order/spec.md. Babylon Lite sprite layers expose a flat numeric `order` and the renderer sorts layers by that value; they do not provide nested sprite-layer render-order inheritance. The application therefore needs a logical category/sub-depth convention that compiles to flat orders. DOM overlays use CSS `z-index` independently.

## Goals / Non-Goals

**Goals:**

- Establish spaced, human-readable depth bands.
- Model TileMap as a base depth plus ordered sub-depths.
- Make persistent UI and settings-overlay precedence explicit.
- Preserve room for a later projectile/effect decision.

**Non-Goals:**

- Do not decide whether smoke, particles, or other effects draw above arrows.
- Do not introduce nested Babylon sprite layers or a UI framework.
- Do not redesign TileMap content or gameplay behavior.

## Decisions

- Use Babylon order bands of TileMap `0-99`, NPCs `100-199`, player `200-299`, projectiles/effects reserved `300-499`, and foreground/cover `500-599`. The gaps allow future additions without renumbering existing categories.
- Represent TileMap sublayers as base `0` plus explicit sub-Z values, such as background water `0`, foam `10`, ground `20`, shadows `30`, elevated terrain `40`, decorations `50`, props `60`, and foreground artwork `70`.
- Use CSS z-index bands beginning at `1000` for persistent UI, `2000` for settings overlays, and `3000` for fatal/error UI. This keeps DOM stacking clearly above the canvas layers.
- Keep projectiles and effects in one reserved range until a concrete visual example establishes whether they need a shared sortable band or distinct per-effect ordering.
- Prefer centralized constants or a documented mapping over unexplained numeric literals. Alternatives considered: retaining current values (not extensible), relying on DOM insertion order (implicit), or using Babylon scene-node parenting (does not solve flat sprite-layer sorting).

## Risks / Trade-offs

- [Existing content can change appearance when bands are widened] -> Verify representative overlaps and preserve intended current relationships during migration.
- [CSS and Babylon depths are independent] -> Document both systems and test the composed canvas/DOM stack.
- [Projectile/effect order remains unresolved] -> Treat `300-499` as provisional and add a follow-up decision when a visual requirement is known.

## Migration Plan

1. Add the depth contract and constants/documentation.
2. Update existing Babylon orders and CSS z-index values to use the contract.
3. Add focused contract tests and inspect the composed page in a browser.

## Open Questions

- Should projectile/effect ordering eventually be global, effect-specific, or Y/depth-driven? This remains intentionally deferred.
