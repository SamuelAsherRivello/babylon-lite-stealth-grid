## Context

See `proposal.md` for motivation and `specs/terrain-collision-classification/spec.md` for behavior. `Tilemap_color3.tsj` declares a 64 by 64 grid and currently has collider objects on 38 of its 54 tile frames. The geometry includes fractional coordinates, rectangles slightly outside tile bounds, inconsistent edge thicknesses, exact full squares, approximate and exact triangles, and two zero-area objects on tile 21.

The referenced tilesheet is the visual confirmation source. Existing collider geometry remains the primary evidence of intent because the assignment is to normalize authored collisions, not infer new collision coverage from artwork.

## Goals / Non-Goals

**Goals:**

- Produce deterministic integer collider geometry from the existing authored shapes.
- Preserve the set of tile frames with meaningful collision.
- Keep Tiled object identity and non-geometry metadata stable.
- Make the result directly testable as external TSJ data.

**Non-Goals:**

- Adding colliders to visually obstructed tiles that currently have none.
- Copying collision metadata to `Tilemap_color1`, `color2`, `color4`, or `color5`.
- Combining multiple border rectangles into a concave polygon.
- Changing runtime collision algorithms or frame classifications outside the TSJ.

## Decisions

### Complete classification before mutation

Perform a read-only pass over all existing collider objects, then inspect corresponding tilesheet cells. Polygon area is derived from polygon vertices because Tiled stores zero rectangle dimensions on valid polygons. If any category or orientation is uncertain, stop with the relevant tile IDs before writing. This prevents a partially normalized file from mixing confirmed and unresolved interpretations.

Alternative considered: normalize confident tiles first. Rejected because the user explicitly chose an all-or-nothing preflight when ambiguity exists.

### Quantize objects in place

Keep each meaningful rectangle or polygon object and replace only its geometry with the canonical coordinates for its classified shape. Remove only zero-area non-polygon rectangles. This preserves IDs, metadata, valid polygons, and the established multi-edge representation.

Alternative considered: recreate object arrays or combine each tile into one polygon. Rejected because it adds needless object churn and may introduce concave polygons with different importer behavior.

### Use exact 4-pixel edge strips

For the 64-pixel grid, use a 4-pixel thickness, exactly one sixteenth of the tile. Left and top begin at zero; right and bottom begin at coordinate 60. Each strip spans the full orthogonal dimension, and overlaps at corners remain intentional.

Alternative considered: the original 5-pixel proposal. Rejected in favor of the cleaner power-of-two fraction selected by the user.

### Express triangles with exact absolute tile-corner vertices

Retain polygon objects but normalize their object origin and relative points so their absolute vertices are three of `(0,0)`, `(64,0)`, `(64,64)`, and `(0,64)`. The missing corner determines one of four orientations.

Alternative considered: preserve approximate polygon origins. Rejected because fractional origins undermine exact validation without adding semantic value.

## Risks / Trade-offs

- [Artwork may not make a collider's intended side clear] → Stop before editing and ask with tile IDs rather than guessing.
- [Reducing broad approximate borders to 4 pixels changes collision area] → This is the intentional quantization; verify every classification visually and through regression assertions.
- [JSON serialization could create an excessively broad diff] → Make focused geometry edits and inspect the final diff for unrelated formatting or metadata churn.
- [Zero-area rectangle removal changes object counts] → Assert that only the two confirmed non-polygon artifacts are removed and meaningful collider-bearing tiles remain collider-bearing.

## Migration Plan

1. Capture the original collider-bearing tile IDs, object metadata, and shape classifications.
2. Add validation coverage that expresses canonical geometry, unchanged collider-free scope, and zero-area removal.
3. Quantize the confirmed objects and remove zero-area artifacts.
4. Parse the TSJ, run focused and full tests, and inspect the diff.

Rollback is the additive Git-safe reversal of the focused TSJ and test changes through a new edit or commit; do not discard unrelated working-tree changes.
