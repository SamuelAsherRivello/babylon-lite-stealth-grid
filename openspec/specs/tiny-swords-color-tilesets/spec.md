# tiny-swords-color-tilesets Specification

## Purpose
Provide five interchangeable Tiny Swords terrain color palettes in the AI-managed Tiled workspace while preserving existing levels, runtime rendering, and frame-based collision behavior.

## Requirements

### Requirement: Filename-matched terrain tilesets
The Tiled workspace SHALL provide `Tilemap_color1` through `Tilemap_color5` as separate external JSON tilesets. Each tileset definition and image SHALL use the corresponding source PNG filename, SHALL declare a 64 by 64 tile size, nine columns, six rows, and 54 local tile IDs, and SHALL use repository-relative references.

#### Scenario: User opens an AI-managed level
- **WHEN** the user opens an AI-managed TMJ map through the repository Tiled project
- **THEN** Tiled offers `Tilemap_color1`, `Tilemap_color2`, `Tilemap_color3`, `Tilemap_color4`, and `Tilemap_color5` as painting palettes without additional human setup

#### Scenario: Tileset filename identifies its palette
- **WHEN** the user or loader inspects a terrain tileset reference
- **THEN** its TSJ basename, declared tileset name, and PNG basename identify the same `Tilemap_colorN` palette

### Requirement: Existing color-three level compatibility
The migration SHALL preserve the visual output, tile positions, layer membership, origin marker, and normalized local frame numbers of existing `Tilemap_color3` placements in `Level01`.

#### Scenario: Existing Level01 is loaded after migration
- **WHEN** the migrated `Level01.tmj` is loaded without further human edits
- **THEN** every previously authored terrain cell renders the same `Tilemap_color3` frame at the same level coordinate and layer as before the migration

### Requirement: Runtime tileset-aware rendering
The runtime SHALL resolve each normalized tile placement to the image belonging to its external tileset source and SHALL render mixed color palettes while preserving authored Tiled layer order.

#### Scenario: One map uses multiple color palettes
- **WHEN** a saved map contains placements from two or more `Tilemap_colorN` tilesets
- **THEN** each placement renders from its referenced palette at its authored level coordinate and visual layer

#### Scenario: Tileset image cannot be resolved
- **WHEN** a placed tile references an unavailable or unsupported tileset image
- **THEN** level loading fails with an actionable error identifying the unresolved tileset instead of silently substituting another palette

### Requirement: Shared local-frame collision semantics
Corresponding local tile IDs across all five color tilesets SHALL use the same walkability and collision classification that the runtime currently applies to `Tilemap_color3`. Tileset global IDs and color palette SHALL NOT alter collision behavior.

#### Scenario: Corresponding frames use identical collision
- **WHEN** the same local frame number is placed from two different `Tilemap_colorN` tilesets
- **THEN** both placements expose equivalent whole-cell, partial-shape, or non-collidable behavior

#### Scenario: Palette is changed without changing frame
- **WHEN** an authored cell is repainted with the same local frame from another color tileset
- **THEN** its rendered color changes while its collision geometry remains unchanged

### Requirement: Unchanged human editing workflow
The human workflow SHALL remain open the designated Tiled project and TMJ map, paint on the existing layers using any prepared terrain palette, save, close or leave Tiled, and start or reload the game. It SHALL require no manual tileset creation, file conversion, or runtime export.

#### Scenario: Human paints with another palette
- **WHEN** the user selects a prepared `Tilemap_colorN` tileset, paints existing layers, and saves the designated TMJ
- **THEN** the next game load consumes those edits directly from the saved TMJ
