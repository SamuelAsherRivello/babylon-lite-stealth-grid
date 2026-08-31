# Babylon Light Stealth Grid

Babylon Light Stealth Grid is a portrait-oriented Babylon Lite sprite game prototype.

## Live Demo

[Play the live demo](https://samuelasherrivello.github.io/babylon-light-stealth-grid/)

## Getting Started

1. Clone or download this repository.
2. Open the repository root in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the URL printed by Vite.

## Tile Map

Levels are authored with Tiled. The AI prepares the Tiled project, map, tilesets, grid, origin marker, layers, properties, and runtime integration; the human edits content only on the existing layers.

See [Tile Map Editing](documentation/tile-map.md) for the open, edit, save, close, and play workflow.

## Commands

| # | Name | Command | Comment |
| --- | --- | --- | --- |
| 1 | Install | `npm install` | Installs the project dependencies. |
| 2 | Dev | `npm run dev` | Runs the project with hot reload. |
| 3 | Build | `npm run build` | Creates the production bundle. |
| 4 | Preview | `npm run preview` | Serves the production bundle locally. |

## Project Structure

- `index.html`: Browser page, portrait canvas, and compact control/coordinate overlays.
- `src/main.js`: Babylon Lite scene composition, numbered terrain review, and collider diagnostics.
- `src/player.js`: Archer idle/run/shoot animation states, input, movement, jumping, collision configuration, and cleanup.
- `src/player-state.js`: Explicit `PlayerState` state machine and guarded idle, running, and shooting transitions.
- `src/game-logic.js`: Quadrant-I movement, coordinate conversion, terrain layout, and collision helpers.
- `src/particle-fx`: Shared particle lifecycle, pack catalog, preview layout, and one concrete class per animation.
- `plugins/aseprite-babylon-lite`: Reusable descriptor validation and Babylon Lite grid-atlas adapter.
- `assets/source/particles`: Editable Aseprite authoring source; never loaded by the browser.
- `src/style.css`: Centering and responsive 9:16 frame sizing.
- `public/assets`: Local Tiny Swords terrain, archer, arrow, and exported particle sprite sheets.
- `test/game-logic.test.js`: Movement, coordinate, terrain-layout, and collision-contract tests.
- `vite.config.js`: Vite configuration for local development and production builds.

## Portrait Frame Contract

The game frame uses a 9:16 aspect ratio. Its width is the smaller of the full viewport width and 56.25% of the viewport height, so it remains fully visible and centered in both desktop and portrait browser windows.

Future visuals, controls, text, spacing, borders, and effects should size and position themselves relative to the game frame so the composition scales consistently as the frame resizes.

The canonical logical grid and oversized animated-tile placement rules are documented in [`docs/grid-and-ui-contract.md`](docs/grid-and-ui-contract.md).

## Resources

- [Babylon.js Lite getting started](https://doc.babylonjs.com/lite/01-getting-started)
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Vite Documentation](https://vite.dev/guide/)

## License

Provided as-is under the MIT License.
