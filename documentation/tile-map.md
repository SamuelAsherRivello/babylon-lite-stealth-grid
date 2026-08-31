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

The Tiled integration files are created as part of the `add-tiled-babylon-lite-plugin` change. Until that change is applied, ask the AI to complete the setup before attempting this workflow.
