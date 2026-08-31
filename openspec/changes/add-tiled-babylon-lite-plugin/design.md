## Context

See `proposal.md` for motivation. The game currently creates a fixed 576 px by 1024 px Babylon Lite sprite renderer, lays all 54 terrain atlas positions into a review grid, and computes collision against generated 64 px cells. Its logical world uses a bottom-left origin and positive Y upward. Tiled uses a top-left origin for orthogonal maps and stores editable maps and external tilesets as JSON-compatible TMJ and TSJ files.

The Tiny Swords pack uses a 64 px grid. Its recommended composition begins with background water, water foam, and flat ground, then repeats shadow and elevated-ground pairs for each height. Animated or oversized foam and shadow artwork needs authored offsets that are independent of collision.

## Goals / Non-Goals

**Goals:**

- Keep map parsing and validation reusable outside this game and independently testable without WebGPU.
- Make the repository the source of truth for the Tiled project, maps, tilesets, extension, and templates.
- Give the game a small adapter from normalized level data to its existing Babylon Lite sprite and collision primitives.
- Fail clearly when a designer uses unsupported Tiled features.
- Make structural authoring and runtime-file setup an AI responsibility while keeping the human loop limited to content editing and saving.
- Derive a tile-aligned initial viewport from desired logical screen dimensions and tileset metadata while allowing a finite map to extend around the game origin.

**Non-Goals:**

- Supporting Sprite Fusion or other level editors and export formats.
- Implementing every TMJ/TMX feature, infinite maps, isometric maps, compressed binary data, or arbitrary embedded scripts.
- Creating a general-purpose physics engine, navigation mesh, or in-game editor.
- Redistributing Tiny Swords assets separately from their existing repository usage.
- Automatically redesigning authored terrain or generating elevation from visual appearance.

## Decisions

### Build a repository plugin with a pure normalization core

Place the reusable integration under `plugins/tiled-babylon-lite`. Its core reads already-parsed JSON plus a caller-supplied external-tileset resolver and returns plain normalized data. File fetching and Babylon rendering remain adapters. This keeps Node tests deterministic and allows reuse in other Vite or Babylon Lite projects.

Before implementation, audit existing loaders against Babylon Lite compatibility, TMJ/TSJ coverage, active maintenance, license suitability, bundle size, tree-shaking, and browser plus Node support. A qualifying library is wrapped behind the plugin's stable API. If none qualifies, implement the narrow supported profile locally. A full Babylon.js-only loader does not qualify because it targets a different engine API and adds unrelated runtime weight.

### Treat native TMJ and TSJ as the source of truth

Load finite orthogonal JSON maps directly instead of introducing a second generated runtime format. The human-saved TMJ is the runtime source, the browser adapter fetches it and its referenced TSJ files, and Node tests inject fixtures. Any future compact export format requires a separate change because it would alter the confirmed no-conversion workflow.

### Make grid planning a pure AI-facing operation

Inspect each tileset's inherent tile width and height, then calculate initial viewport columns and rows from the requested logical screen. Preserve artwork cell size; do not use grid planning to resample source tiles. Exact divisions produce one answer. Non-divisible requests produce explicit smaller, larger, crop, or letterbox candidates for user selection. Incompatible tileset grids stop planning until resolved.

### Anchor game coordinates with an editor-only origin tile

Use a required single-cell marker on a non-rendered metadata tile layer. Its cell normalizes to game tile `(0,0)`, and the level content at that coordinate renders in the initial viewport's lower-left cell. Because the marker can sit inside a finite Tiled map, authored cells may normalize to negative game coordinates without adding infinite-map chunk support. Runtime bounds become minimum and maximum X/Y values relative to this marker rather than zero-based width and height. Diagnostic labels display origin-relative `column,row` values at cell upper-rights rather than atlas-frame identifiers.

### Separate AI structural work from human content editing

The AI creates and changes projects, maps, dimensions, origins, tilesets, layers, classes, properties, and runtime integration. The human paints or erases existing tile layers, places or moves configured objects, edits exposed content properties, and saves. Validation detects structural drift, but documentation does not make repairing that drift a human responsibility.

### Keep visual ordering explicit

Tiled layer order is authoritative. Required layer names are validated, but renderer behavior is driven by ordered normalized layers rather than hard-coded numeric slots. Visual layers and gameplay-only layers are distinguished by group membership and properties so editor helpers never render accidentally.

### Separate tile classifications from placed overrides

Reusable facts such as `walkable`, `height`, terrain kind, animation, and default collision geometry live on tileset tiles. Map layers provide placement and broad semantics. Dedicated gameplay layers provide exceptions such as invisible blocked cells or vision-only barriers. Explicit placed overrides win over tile defaults.

### Normalize coordinates at the boundary

All runtime consumers receive bottom-left game coordinates. Tile row conversion uses `gameRow = mapHeight - tiledRow - 1`. Pixel-space objects and shapes use documented anchor-aware conversions based on map pixel height. Conversion and round-trip behavior will be isolated in pure functions and covered before rendering integration.

### Use Tiled classes and object layers for gameplay entities

Player spawns, enemy spawns, patrol routes, triggers, doors, interactions, and exits use typed objects rather than invisible semantic tiles. Tiled class definitions provide stable property names and types. Grid classifications remain tile layers where cell painting is the better editing interaction.

### Ship a read-only validation extension

The project-local Tiled extension registers a validation action and reports issues through Tiled's Issues view. It reads the active map but does not auto-correct or rewrite authored content. The same validation rules are implemented by or shared with the reusable core so editor and automated validation agree.

### Integrate through existing Babylon Lite sprite primitives

The renderer adapter produces the atlas, frame, position, size, offset, visibility, and animation inputs expected by the existing sprite renderer. It does not hide engine lifecycle or player behavior behind a new framework. `src/main.js` becomes the composition root that loads the authored map, builds layers and collision inputs, and starts the existing systems.

## Risks / Trade-offs

- [TMJ is a broad evolving format] -> Declare a deliberately narrow supported profile and reject unsupported orientation, infinite maps, encodings, or unresolved assets with actionable errors.
- [Tiled and game coordinates differ for tiles and anchored objects] -> Centralize conversions and require round-trip fixtures for tile cells, points, rectangles, polygons, and tile objects.
- [Oversized Tiny Swords shadows and foam may not align like ordinary 64 px tiles] -> Preserve tileset object alignment, drawing offset, and tile offsets independently from logical cell collision.
- [Browser fetches of several TSJ files add startup requests] -> Reuse loaded tilesets and revisit bundling only after measuring actual startup behavior.
- [Project-local Tiled scripts can execute with file/process access] -> Keep the extension small, version-controlled, documented, and free of process execution or network access.
- [Replacing the review grid could obscure unfinished collision classification] -> Preserve diagnostics and add a dedicated test/sample map demonstrating authored blocked and walkable tiles before removing review-only startup behavior.
- [Required layer names can become brittle] -> Define canonical names in one contract module and validate them in both tests and Tiled instead of scattering string literals.
- [Directly loading an invalid save can prevent a level from starting] -> Keep validation shared between Tiled and runtime; the exact runtime fallback policy remains unresolved and must be decided before implementation reaches startup integration.

## Migration Plan

1. Repeat and record the ecosystem audit, adopting a qualifying dependency behind the plugin boundary or documenting why a local implementation is required.
2. Add failing core tests and fixtures for grid planning, origin-relative bounds, the supported Tiled profile, required layers, coordinate conversions, external tilesets, collision, objects, and animations.
3. Implement the reusable parser, normalizer, validator, and browser loader under `/plugins/tiled-babylon-lite/`.
4. Add the AI-prepared Tiled project, class definitions, external tilesets, extension, origin marker, and empty/sample maps using existing assets by relative path.
5. Add the Babylon Lite sprite adapter and migrate `src/main.js` from the generated review layout to the directly loaded sample TMJ while retaining diagnostics.
6. Validate with focused tests, the full test suite, production build, Tiled-file validation, and a real-browser smoke test.

## Open Questions

- When a directly loaded TMJ is invalid at runtime, should startup fail with precise errors, partially load valid content, or use a fallback level? This must be decided before the startup integration task begins.

Rollback is an additive Git revert of the integration change. Existing terrain review helpers remain available until the authored-map path passes all verification, so no destructive data migration is required.
