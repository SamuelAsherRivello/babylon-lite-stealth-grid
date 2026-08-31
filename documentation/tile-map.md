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

1. Ask the AI which level to edit. The AI will give you the exact `.tiled-project` and `.tmj` paths.
2. Open Tiled.
3. Select **File > Open File or Project** and open the `.tiled-project` path supplied by the AI.
4. In Tiled, select **File > Open File** and open the `.tmj` map path supplied by the AI.
5. Confirm that the existing visual and gameplay layers appear in the Layers panel.

Do not substitute another map or create a new map from Tiled's menus. If a new level is required, ask the AI to create its configured TMJ file first.

## Edit and Save

1. Select the existing layer whose content you want to change.
2. Paint or erase tiles, place or move configured objects, or edit the exposed values on those objects.
3. Leave layer names, ordering, map dimensions, tilesets, and the editor-only origin marker unchanged.
4. Press **Ctrl+S** or select **File > Save**.
5. Tell the AI the path of the TMJ file you saved so it can inspect and validate the changes.

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
|
+-- levels/
    +-- tiled/
        +-- stealth-grid.tiled-project
        +-- maps/
        |   +-- Level01.tmj      Editable source and runtime level
        +-- tilesets/
            +-- Tilemap_color3.tsj   Terrain frames and collision objects

test/
+-- tiled-level.test.js          Level data, origin, and collision import
+-- tiled-terrain.test.js        Runtime collision conversion
```

The TMJ is both the authored file and the runtime file. Saving `Level01.tmj` updates what the game loads on its next start or browser refresh.
