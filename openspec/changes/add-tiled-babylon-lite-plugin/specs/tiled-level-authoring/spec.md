## Purpose

Provide a reusable and verifiable Tiled level-authoring contract that turns repository-managed maps into Babylon Lite visual layers, collision geometry, and gameplay objects.

## ADDED Requirements

### Requirement: AI-managed repository Tiled workspace
The AI SHALL create and maintain the Tiled project, external tileset definitions, maps, required layers, classes, properties, animations, offsets, collision metadata, and runtime-loading configuration. The human SHALL be able to open, edit content on existing layers, and save from the repository without creating or structurally configuring Tiled-format or runtime files.

#### Scenario: User starts a new level
- **WHEN** the user opens the documented empty level in the repository
- **THEN** the map displays the configured Tiny Swords tilesets and all required visual and gameplay layers in their defined order

#### Scenario: User saves an authored level
- **WHEN** the user saves the map as Tiled JSON in the configured maps directory
- **THEN** the saved map and its external tileset references remain readable from the repository using relative paths

#### Scenario: Structural change is requested
- **WHEN** the human needs a resized map, moved origin, changed tileset, or added, removed, renamed, or reordered layer
- **THEN** the AI updates the affected Tiled-format files and tells the human exactly which project and map files to open

### Requirement: AI-selected tile-aligned grid
The AI SHALL inspect the inherent cell dimensions of the selected tilesets and the user's desired logical screen size and orientation before creating a map. It SHALL preserve source tile dimensions and calculate tile-aligned viewport columns, rows, and logical dimensions rather than silently stretching tiles.

#### Scenario: Tiny Swords portrait grid is exact
- **WHEN** the desired logical screen is 576 px by 1024 px and the selected tileset uses 64 px by 64 px cells
- **THEN** the AI configures a 9-column by 16-row initial viewport with 576 px by 1024 px logical dimensions

#### Scenario: Desired screen is not tile-aligned
- **WHEN** either desired logical-screen dimension is not evenly divisible by the inherent tile dimension
- **THEN** the AI presents tile-aligned layout candidates and their viewport trade-offs before creating the map

#### Scenario: Tilesets disagree on cell size
- **WHEN** selected tilesets declare incompatible inherent cell dimensions
- **THEN** the AI reports the incompatibility and obtains a layout decision instead of silently resampling artwork

### Requirement: Tiny Swords visual layer model
The prepared map SHALL include ordered visual layers for background water, animated water foam, flat ground, elevation shadows, elevated terrain, ground decorations, Y-sorted props, and foreground artwork. Additional elevation SHALL be represented by another ordered shadow-and-terrain pair.

#### Scenario: Rendering one elevation level
- **WHEN** a map contains flat terrain and elevation-one artwork
- **THEN** water and foam render below flat ground, the elevation-one shadow renders below elevation-one terrain, and foreground artwork renders above gameplay actors

### Requirement: Gameplay authoring model
The prepared map SHALL provide distinct authoring layers for blocked cells, height values, height transitions, vision blockers, cover, noise surfaces, player spawn, enemy spawns, patrol routes, triggers, doors, interactions, and level exits. Grid-aligned classifications SHALL use tile layers, while positioned entities and arbitrary shapes SHALL use object layers.

#### Scenario: Author places gameplay data
- **WHEN** the user places a typed enemy spawn, patrol route, trigger shape, or exit on its designated object layer
- **THEN** the saved map preserves its type, position or shape, and configured gameplay properties

### Requirement: Reusable Tiled map normalization
The integration SHALL accept finite orthogonal Tiled JSON maps with external JSON tilesets and SHALL expose a normalized representation of visible tile layers, tile properties, animations, collision shapes, and object layers without requiring a browser or Babylon Lite renderer.

#### Scenario: Valid map is normalized
- **WHEN** a supported Tiled JSON map and its referenced tilesets are loaded
- **THEN** the integration returns deterministic map dimensions, ordered layers, resolved tile identifiers, tile placements, properties, animations, collision data, and gameplay objects

#### Scenario: Unsupported map is rejected
- **WHEN** a map is infinite, non-orthogonal, uses an unsupported encoding, or references unavailable tileset data
- **THEN** validation reports an actionable error instead of silently producing a partial level

### Requirement: Coordinate conversion
The integration SHALL convert Tiled's top-left tile coordinates to the game's bottom-left positive-X, positive-Y grid while preserving each cell's visual position. It SHALL define explicit conversions for tile cells, points, rectangles, polygons, and tile objects.

#### Scenario: Bottom-left tile is loaded
- **WHEN** a tile occupies column zero and the last Tiled row of a finite map
- **THEN** its normalized game-grid coordinate is column zero and row zero

#### Scenario: Coordinate round-trip
- **WHEN** a supported Tiled coordinate is converted to game coordinates and back
- **THEN** the original Tiled coordinate is recovered within the documented pixel precision

### Requirement: Declared game origin cell
Every map SHALL contain exactly one editor-only origin marker tile whose cell is game tile `(0,0)`. The level content at that coordinate SHALL render in the lower-left cell of the initial viewport, while authored cells left of or below it SHALL normalize to negative game coordinates and begin offscreen.

#### Scenario: Map extends around the initial viewport
- **WHEN** authored content exists left of or below the origin marker tile
- **THEN** normalization preserves it with negative game X or Y coordinates without requiring an infinite Tiled map

#### Scenario: Origin marker is invalid
- **WHEN** the map contains zero, multiple, off-grid, or render-enabled origin marker tiles
- **THEN** validation reports an actionable error and does not infer an origin

### Requirement: Level-coordinate diagnostics
Every visible level cell SHALL have an optional diagnostic label derived from its origin-relative level column and row rather than its tileset frame number. The label SHALL use zero-padded `column,row` text, appear at the cell's upper-right, and use half the previous 14 px diagnostic font size.

#### Scenario: Origin cell diagnostic is visible
- **WHEN** coordinate diagnostics are enabled
- **THEN** the rendered lower-left origin cell displays `00,00` at its upper-right in a 7 px font

### Requirement: Authored collision and terrain semantics
The integration SHALL derive ordinary collision and terrain semantics from Tiled layer properties, tile properties, and tileset collision shapes, with designated override layers taking precedence over reusable tile defaults.

#### Scenario: Collidable tile is instantiated
- **WHEN** an authored tile is on a collision layer or resolves to a non-walkable tile property
- **THEN** the normalized level exposes collision geometry at that placement using its authored tile collision shape or whole-cell bounds when no shape is supplied

#### Scenario: Invisible override blocks movement
- **WHEN** a cell is marked on the blocked-cells override layer
- **THEN** that cell blocks movement even if its visual terrain tile is normally walkable

### Requirement: Tiled validation extension
The Tiled project SHALL include a project-local JavaScript extension that validates the active level against the supported map contract and reports actionable issues without rewriting authored content.

#### Scenario: Required content is missing
- **WHEN** the user validates a map with a missing required layer, missing player spawn, duplicate player spawn, invalid object type, unresolved patrol route, unsupported tile size, or unavailable tileset
- **THEN** Tiled reports an error or warning identifying the affected layer or object

#### Scenario: Valid map passes validation
- **WHEN** the active map satisfies the supported contract
- **THEN** validation completes without errors and confirms that the level is ready for the game loader

### Requirement: Babylon Lite rendering adapter
The integration SHALL convert normalized visible tile layers into Babylon Lite sprite-layer inputs while preserving layer order, atlas frames, tile offsets, visibility, animation metadata, and the map's authored dimensions.

#### Scenario: Authored level starts in the game
- **WHEN** the game loads a valid authored level
- **THEN** its visible tiles render in authored order and current player movement, animation, collision diagnostics, and viewport scaling continue to operate against the authored map bounds

### Requirement: Saved TMJ is the runtime level
The game SHALL load and validate the same TMJ file the human saves in Tiled, resolving its TSJ references directly. The workflow SHALL require no human export action and SHALL not depend on a separately generated runtime-map file.

#### Scenario: Human saves valid content edits
- **WHEN** the human saves content changes in the AI-designated TMJ file
- **THEN** the next level load consumes those changes directly without an intervening conversion step

### Requirement: Content-only human workflow
The documented human workflow SHALL permit painting and erasing on existing tile layers, placing or moving configured objects, editing exposed object values, and saving. It SHALL direct structural map, origin, layer, tileset, class, property, and runtime changes back to the AI.

#### Scenario: Human begins an editing session
- **WHEN** the AI has prepared or repaired a level
- **THEN** it identifies the exact `.tiled-project` and `.tmj` files to open and the existing layers intended for content editing

### Requirement: Exclusive Tiled support
The documented authoring and runtime contract SHALL use Tiled project, TMJ, and TSJ files exclusively and SHALL not require or advertise Sprite Fusion project or export compatibility.

#### Scenario: User follows level-authoring documentation
- **WHEN** the user follows the repository instructions to create or edit a level
- **THEN** every required step is performed with Tiled and repository-managed files
