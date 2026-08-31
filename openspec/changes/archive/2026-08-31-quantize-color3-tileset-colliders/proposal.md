## Why

`Tilemap_color3.tsj` contains hand-drawn collider geometry with fractional coordinates, inconsistent edge thicknesses, out-of-bounds values, and two zero-area artifacts. Quantizing the existing colliders makes the authored collision contract deterministic and reviewable without expanding collision to any tile that is currently collider-free.

## What Changes

- Classify every existing `Tilemap_color3.tsj` collider as a full square, half-tile corner triangle, or one or more tile-edge strips, using the existing geometry as primary evidence and the tile artwork as confirmation.
- Pause before editing if any tile remains ambiguous or its artwork conflicts with its collider geometry.
- Quantize full squares to the 64 by 64 tile bounds, triangles to exact three-corner half-tile polygons, and edge strips to exact 4-pixel full-length side rectangles.
- Preserve existing collider object structure and metadata while removing zero-area rectangle artifacts; Tiled polygon objects retain their normal zero-valued rectangle dimensions.
- Leave tiles without existing colliders and all sibling tilesets unchanged.
- Validate the edited TSJ and add regression coverage for the canonical geometry and unchanged collider scope.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `terrain-collision-classification`: Define canonical authored collider geometry for the color-three terrain tileset while preserving which tile frames have collision.

## Impact

- `public/levels/tiled/tilesets/Tilemap_color3.tsj` collider geometry.
- Tests or validation utilities that inspect external Tiled tileset collision objects.
- No runtime API, dependency, sibling tileset, or collider-free tile changes.
