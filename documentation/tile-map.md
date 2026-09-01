# Tile Map Editing

This project uses [Tiled](https://www.mapeditor.org/) as its exclusive level editor. Tiled JSON map (`.tmj`) and external tileset (`.tsj`) files are repository files, and the game loads the saved TMJ directly.

The AI is responsible for creating and maintaining:

- the `.tiled-project` file;
- map size, tile size, and the game tile `(0,0)` origin marker;
- TMJ maps and TSJ tilesets;
- visual and gameplay layers and their ordering;
- classes, properties, animations, offsets, and collision metadata;
- camera and runtime-loading configuration.

The human edits level content on the existing layers. Do not create a blank map, resize the map, move the origin marker, or add, remove, rename, or reorder layers or tilesets. Ask the AI to make structural changes and repair validation errors.

## Open a Level

For `Level01`, use these repository files:

- Tiled project: `public/levels/tiled/stealth-grid.tiled-project`
- Level map: `public/levels/tiled/maps/Level01.tmj`
- Terrain tileset: `public/levels/tiled/tilesets/Tilemap_color3.tsj`
- Spawner palette: `public/levels/tiled/tilesets/SpawnerTypes.tsj`

1. Ask the AI which level to edit. The AI will give you the exact `.tiled-project` and `.tmj` paths.
2. Open Tiled.
3. Select **File > Open File or Project** and open the `.tiled-project` path supplied by the AI.
4. In Tiled, select **File > Open File** and open the `.tmj` map path supplied by the AI.
5. Confirm that the existing visual and gameplay layers appear in the Layers panel.

Do not substitute another map or create a new map from Tiled's menus. If a new level is required, ask the AI to create its configured TMJ file first.

## Place Spawners

Select the `Spawners` object layer, then choose one of the four items in the
`Spawner Types` palette:

- `Player Spawner` uses `type: PLAYER`;
- `Sheep Spawner` uses `type: SHEEP`;
- `Enemy Spawner` defaults to `type: GOBLIN`.
- `Goal Spawner` places the runtime goal the player must reach to finish the level.

Each placement has only one gameplay custom property: `type`. To make an Enemy
Spawner create a Warrior, override that property on the placed object with
`WARRIOR`. Babylon code owns the actor role, population counts, check interval,
and initial-spawn behavior for all four supported values. Do not add those
settings as Tiled custom properties.

Every level must contain exactly one Player Spawner and exactly one Goal Spawner. Sheep and Enemy spawners
are optional, and a level may contain multiple non-player spawners. A missing or
duplicate Player Spawner stops loading with:

`Invalid Level Format: Must contain 1 Player Spawner`

The black circles labeled P, S, and E are editor-only placement icons. The game
continues to render its own small black-and-white diagnostic spawner markers.

## Edit and Save

1. Select the existing layer whose content you want to change.
2. Paint or erase tiles, place or move configured objects, or edit the exposed values on those objects.
3. Leave layer names, ordering, map dimensions, tilesets, and the editor-only origin marker unchanged.
4. Press **Ctrl+S** or select **File > Save**.
5. Tell the AI the path of the TMJ file you saved so it can inspect and validate the changes.

## AI Workflow: Create a Placeable Object

Use this pattern when artwork represents one independently selectable thing in
Tiled, such as a bush, prop, door, trigger, spawn marker, or interaction. Do not
paint it into a terrain tile layer merely because its artwork is tile-like.

1. Inspect the source artwork, its complete frame dimensions, visible alpha
   bounds, animation frames, intended anchor, interaction behavior, and whether
   its collider blocks movement or acts only as a sensor.
2. Add one external image-collection TSJ entry for the logical object. The
   Tilesets panel must present one named item, not every animation frame as a
   separately placeable tile.
3. Give the Tiled item and its placements the appropriate project class. Put
   reusable behavior and asset metadata on the tileset item; use object
   properties only for placement-specific overrides.
4. Place it as a tile object on the designated object layer. Reactive visual
   props in this project belong on `Y-Sorted Props`, use a bottom-center anchor,
   and keep independent object IDs and state.
5. Keep sensor geometry distinct from blocking terrain collision. A sensor may
   detect supported character colliders without entering movement or projectile
   obstacle collections.
6. Extend the pure TMJ/TSJ normalizer, validation, runtime controller, rendering,
   disposal, and tests only as required by the object's declared contract.

### Editor Preview and Selection Bounds

The Tiled preview controls editor appearance and selection bounds; it does not
have to be the runtime spritesheet.

- Default the tile-object selection footprint to exactly one map tile. This
  project uses `64 x 64`, so the preview PNG, TSJ `tilewidth`/`tileheight`, tile
  `imagewidth`/`imageheight`, and placed TMJ object `width`/`height` are all
  `64 x 64` unless the user explicitly chooses another footprint.
- Fit artwork proportionally inside the preview without stretching it. Preserve
  nearest-neighbor sampling for pixel art and center the visible alpha bounds.
- Use TSJ `tileoffset` when necessary to preserve the artwork's intended visual
  location relative to its bottom-center object anchor.
- Keep the untouched runtime image and true runtime frame dimensions in separate
  properties. Cropping or fitting an editor preview must not change in-game
  scale, animation frames, sensor coordinates, or runtime texture sampling.
- Update existing placed object dimensions when the preview footprint changes,
  then close and reopen the map or tileset in Tiled to clear its cached preview.

The verified bush example uses:

- one `64 x 64` editor preview:
  `public/assets/terrain/decorations/bushes/Bushe1-frame0.png`;
- one untouched eight-frame `1024 x 128` runtime sheet:
  `public/assets/terrain/decorations/bushes/Bushe1.png`;
- one placeable image-collection tile:
  `public/levels/tiled/tilesets/TinySwordsBushDecorations.tsj`;
- one `ReactiveDecoration` tile object on `Y-Sorted Props` in `Level01.tmj`;
- runtime frame metadata of eight `128 x 128` frames, independent of the
  `64 x 64` editor selection footprint.

### Required Verification

Add a focused test before implementation and confirm it fails for the missing
object contract. After implementation, verify:

- preview and runtime PNG dimensions;
- exactly one placeable tileset item;
- class/default/placement override resolution;
- object layer, anchor, authored position, and selection dimensions;
- sensor geometry and blocking classification;
- animation trigger, looping/reset/rearm rules, and independent instances;
- runtime size, non-blocking passage, Y ordering, and disposal;
- focused tests, full tests, production build, Tiled JSON contract, and a real
  browser interaction when the object has runtime behavior.

## Inspect Terrain Collision

Terrain collision is authored in `public/levels/tiled/tilesets/Tilemap_color3.tsj`, not in Babylon runtime configuration.

1. Open `Tilemap_color3.tsj` in Tiled.
2. Select a tile and switch the tileset view to **Tile Collision Editor**.
3. Frames `41`, `42`, `43`, `44`, `50`, `51`, `52`, and `53` have full-cell rectangles.
4. Frames `45` and `48` have triangular polygons.
5. Tiles without a collision object are walkable.

Ask the AI to change collider geometry so the TSJ, importer tests, and runtime behavior remain synchronized.

## Close Tiled

1. Make sure the map no longer shows an unsaved-change marker in its tab.
2. Close the map and Tiled.
3. If Tiled asks whether to save, choose **Save** before closing.

## Open and Play the Game

1. Open a terminal at the repository root.
2. If dependencies have not been installed, run:

   ```powershell
   npm install
   ```

3. Start the development server:

   ```powershell
   npm run dev
   ```

4. Open the local URL printed by Vite.
5. The game loads the saved TMJ directly, so no separate Tiled export or runtime-map conversion is required.
6. Play the level and check that the edited tiles and objects appear where expected.

To stop the development server, return to its terminal and press **Ctrl+C**.

## Editing Loop

For another pass:

1. Stop or close the game.
2. Reopen the exact `.tiled-project` and `.tmj` files supplied by the AI.
3. Edit existing layer content and save.
4. Close Tiled.
5. Start the game and play the updated map.

## Related Folder Structure

```text
plugins/
+-- tiled-babylon-lite/
    +-- index.js                 Reusable TMJ/TSJ validation and loading
    +-- README.md                Supported-format and library-audit notes

public/
+-- assets/
|   +-- terrain/
|       +-- tilesets/
|           +-- Tilemap_color3.png   Tiny Swords terrain atlas
|       +-- decorations/
|           +-- bushes/              Runtime sheet and editor preview
|
+-- levels/
    +-- tiled/
        +-- stealth-grid.tiled-project
        +-- maps/
        |   +-- Level01.tmj      Editable source and runtime level
        +-- tilesets/
            +-- Tilemap_color3.tsj               Terrain and collision objects
            +-- TinySwordsBushDecorations.tsj    One-item object tileset
            +-- SpawnerTypes.tsj                 Player, Sheep, and Enemy palette

        +-- icons/
            +-- *-spawner.svg                    Editor-only placement icons

test/
+-- tiled-level.test.js          Level data, origin, and collision import
+-- tiled-terrain.test.js        Runtime collision conversion
+-- reactive-decoration-tiled.test.js  Object authoring and asset contract
+-- tiled-spawner-authoring.test.js     Spawner palette and level validation
```

The TMJ is both the authored file and the runtime file. Saving `Level01.tmj` updates what the game loads on its next start or browser refresh.
