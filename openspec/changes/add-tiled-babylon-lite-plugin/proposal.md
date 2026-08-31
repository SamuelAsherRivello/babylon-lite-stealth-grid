## Why

Level design currently lives in a hard-coded terrain review grid, which prevents a user from authoring complete visual and gameplay layouts without editing JavaScript. A repository-local Tiled workflow will provide a visual 64-by-64-pixel level editor while keeping maps readable, testable, and reusable with Babylon Lite projects.

## What Changes

- Add a reusable `/plugins/tiled-babylon-lite/` integration. First audit existing Babylon Lite-compatible Tiled libraries for maintenance, licensing, supported formats, bundle size, and browser/Node compatibility; adopt a qualifying library behind the plugin API or implement the integration locally when none qualifies.
- Convert Tiled's top-left tile coordinates into the game's bottom-left, positive-Y world grid and expose normalized visual tiles, collision data, and gameplay objects.
- Create a project-local Tiled extension for level validation and a documented, repository-friendly edit/save workflow.
- Make the AI responsible for choosing tile-aligned grid dimensions from the user's desired logical screen and the tilesets' inherent cell sizes, then creating and maintaining the Tiled project, maps, external tilesets, layers, classes, properties, animations, offsets, collision metadata, and runtime loader.
- Provide a configured Tiled project, Tiny Swords external tilesets, and an empty stealth-level template with ordered visual, collision, elevation, spawn, patrol, trigger, exit, and editor-only origin-marker layers.
- Load the human-saved TMJ directly at runtime with no human export/conversion step or generated runtime-map copy.
- Limit the documented human workflow to opening the exact AI-named project/map, editing content on existing layers, saving, and identifying the saved map to the AI; structural Tiled edits remain the AI's responsibility.
- Replace the hard-coded terrain review layout with loading and rendering of an authored Tiled level while preserving current player movement, animation, diagnostics, and Babylon Lite sprite rendering.
- Support Tiled exclusively; no Sprite Fusion project or export compatibility will be added.

## Capabilities

### New Capabilities

- `tiled-level-authoring`: Defines the reusable Tiled project, map contract, validation behavior, Babylon Lite loading, and user editing workflow.

### Modified Capabilities

None. Terrain collision consumption is included in the new Tiled capability because the completed terrain-classification change has not yet been archived into the main specifications.

## Impact

- Adds repository files under `/plugins/tiled-babylon-lite/` and a project-specific level-authoring directory.
- Changes the startup path in `src/main.js` and introduces level-loading modules and fixtures.
- Extends tests to cover parsing, validation, coordinate conversion, layer order, collision extraction, and the prepared empty map.
- Uses the existing `@babylonjs/lite` dependency. The apply phase must repeat and record the library audit against the then-current ecosystem; it SHALL avoid adding a production dependency unless a qualifying Babylon Lite/Tiled library is found.
