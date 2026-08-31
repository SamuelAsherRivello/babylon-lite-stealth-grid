## Context

See `proposal.md` for motivation. The current Babylon Lite renderer repeats atlas frame 10 over a 576 px by 1024 px playfield, while the terrain atlas is a 576 px by 384 px image divided into 64 px cells: 9 columns by 6 rows, or 54 frames. Movement currently applies a normalized input vector and clamps only the character anchor point to the playfield.

The animated character uses a 192 px by 144 px sprite frame with a vertical pivot of 0.78. Collision bounds therefore need to be derived from the rendered frame bounds and pivot rather than treating the character position as its center or bottom edge.

## Goals / Non-Goals

**Goals:**

- Make every terrain frame visually identifiable in a deterministic row-major layout.
- Keep provisional terrain classification centralized and easy to revise after user feedback.
- Separate collision calculations from rendering so they can be unit tested.
- Make first-pass collision geometry continuously visible during review.

**Non-Goals:**

- Tuning the character collider after visual review.
- Creating pixel-perfect or alpha-derived terrain colliders.
- Building a production terrain map or permanent terrain-authoring UI.
- Adding a physics-engine dependency.

## Decisions

### Use the atlas grid as the review layout

Render frame indices in zero-based row-major order in a 9 by 6 block. This reproduces the atlas organization, fits the playfield width exactly, and makes frame numbers straightforward to correlate with source artwork. A custom showcase course was considered, but it would make atlas omissions and numbering mistakes harder to see.

### Keep classification as data keyed by frame number

Store empty frame numbers and provisional non-walkable frame numbers in separate explicit collections. Each review position derives its validity and blocked state from those collections. Empty positions keep their atlas index but create neither a sprite nor collider. This favors fast collaborative revisions while making the known fully transparent source cells explicit.

### Use whole-tile AABBs for the first pass

Every provisionally non-walkable tile receives a 64 px by 64 px axis-aligned bounding box. Although edge and corner artwork will eventually benefit from partial shapes, full-tile bounds make initial classification behavior unambiguous and easy to visualize.

### Use explicit convex polygons for diagonal exceptions

Keep full-tile AABBs as the default and associate exceptional frames with normalized local polygon points. Frame 48 uses the triangle from upper-left to lower-right to lower-left, while frame 39 has no collider. A separating-axis overlap check lets the player's AABB interact with the triangle without embedding frame-specific rules in movement code.

### Use a circle for the character body

Derive a radius-26 circle centered at local frame coordinates (93, 126) from the 192 px by 144 px sprite frame and its non-central pivot. Circle-versus-polygon collision uses a minimum translation vector from separating-axis projections, so horizontal movement into a diagonal terrain edge is resolved along the slope normal instead of simply stopping.

### Resolve movement one axis at a time

Test and apply X movement, then test and apply Y movement using the character collider against playfield bounds and terrain shapes. Polygon overlap can additionally adjust either axis along a slope normal. Tests cover direct blocking, diagonal sliding and push, non-colliding movement, and boundary handling.

### Draw diagnostics in a dedicated overlay

Use a transparent overlay aligned exactly with the game canvas for frame identifiers and AABB outlines/fills. Keeping diagnostics separate from terrain and unit sprite layers avoids requiring debug art in either sprite atlas and makes later removal or toggling localized. Valid frame identifiers remain white, invalid empty-position identifiers are grey, and blocked tiles and the character use distinct colors.

## Risks / Trade-offs

- [Slope resolution can push the circle into a neighboring obstacle] -> Recheck all obstacles after applying the polygon minimum translation and reject unsafe results.
- [Custom polygons require deliberate per-frame authoring] -> Keep exceptions in one data map and add them only after visual review.
- [Labels or fills may obscure small artwork details] -> Use compact identifiers, thin outlines, and low-opacity fills with contrasting colors.
- [Discrete movement can tunnel through a collider during a long frame] -> Retain the existing delta-time cap and structure collision helpers so swept/substepped movement can be added if testing exposes tunneling.
- [X-first resolution can create a small directional bias at exact corners] -> Accept the deterministic bias for this review tool; revisit only if it affects later gameplay.

## Migration Plan

Replace the repeated terrain preview with the numbered atlas layout, introduce collision helpers and tests, then add the aligned diagnostic overlay. The change is local to the demo and requires no stored-data migration. Rollback is additive Git history reverting the implementation commit if needed.
