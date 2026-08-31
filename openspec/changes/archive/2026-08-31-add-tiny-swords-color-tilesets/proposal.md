## Why

The Tiled workspace currently exposes only the `Tilemap_color3` Tiny Swords terrain palette, which prevents level authors from painting the same terrain shapes in the pack's four other color variants. All five atlases share the same 576 by 384 image layout and 64 by 64 tile grid, so they can expand authoring choice without changing the current level appearance or collision behavior.

## What Changes

- Organize `Tilemap_color1.png` through `Tilemap_color5.png` together in the repository's terrain tileset asset area.
- Provide one external Tiled JSON tileset per PNG, named from its image filename: `Tilemap_color1.tsj` through `Tilemap_color5.tsj`.
- Attach all five external tilesets to the AI-managed Tiled maps so the human can paint with any color palette without creating or configuring tilesets.
- Migrate existing `Tilemap_color3` references without changing the tiles already authored in `Level01` or their runtime appearance.
- Resolve each placed tile to the matching runtime atlas while preserving Tiled layer order.
- Apply the existing frame-based terrain collision classification identically to corresponding local tile IDs in every color tileset.
- Update tests and Tile Map documentation for the expanded palette and unchanged open, edit, save, and play workflow.

## Capabilities

### New Capabilities

- `tiny-swords-color-tilesets`: Defines the repository organization, Tiled authoring availability, runtime atlas resolution, compatibility migration, and shared collision semantics for the five Tiny Swords terrain color tilesets.

### Modified Capabilities

None.

## Impact

- Tiled assets and external tilesets under `public/assets/terrain` and `public/levels/tiled/tilesets`.
- Existing TMJ tileset references and global tile IDs in `Level01` and other AI-managed maps.
- The reusable `plugins/tiled-babylon-lite` normalized tileset identity and Babylon Lite rendering integration.
- Runtime terrain atlas loading and tile grouping in `src/main.js` or a dedicated adapter.
- Tiled integration tests, browser smoke coverage, and `documentation/tile-map.md`.
- No new package dependency and no separate runtime export format.
