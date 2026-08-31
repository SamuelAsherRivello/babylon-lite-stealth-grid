# Babylon Light Stealth Grid

Babylon Light Stealth Grid is a portrait-oriented Babylon Lite sprite game prototype.

[Play the live demo](https://samuelasherivello.github.io/babylon-light-stealth-grid/)

The current demo displays all 54 Tiny Swords terrain atlas frames in a numbered review grid and places an animated archer below it. The archer loops its idle animation while stationary, runs while moving, and plays one complete shooting animation before releasing an arrow. Move with WASD, the arrow keys, or the on-screen controller; jump with C and shoot with V or the matching action buttons. The game uses quadrant-I world coordinates: positive X points right and positive Y points up.

## Terrain Collision Review

Collider visualization is available in Settings while terrain walkability is being classified:

- White numbers identify valid terrain frames; grey numbers identify empty atlas positions that create no sprite or collider.
- Empty atlas positions are `4`, `13`, `22`, `31`, `37`, `38`, `40`, `46`, `47`, and `49`.
- Red shapes are provisionally non-walkable terrain regions.
- The cyan circle is the archer collider: a 26 px radius body circle centered at local frame coordinates (93, 126).
- Fully blocked frames are `41`–`44` and `50`–`53`; frame `39` is fully walkable.
- Frame `36` has no collision. Frame `45` blocks the upper-right triangle, mirroring frame `48`.
- Frame `48` blocks only the lower-left triangle formed by its upper-left, lower-right, and lower-left corners, leaving the upper-right triangle walkable.
- When the hero moves horizontally into a diagonal polygon, the circle is pushed along the slope's outward normal.
- Movement resolves one axis at a time, so the archer slides along blocked edges.

The blocked-frame list and custom collision polygons are deliberately easy to revise after visual review.

## Particle FX Preview

The center of the game displays one looping instance of each Tiny Swords
Particle FX animation: Dust 1, Dust 2, Explosion 1, Explosion 2, Fire 1,
Fire 2, Fire 3, and Water Splash. The eight effects use 64 px preview cells in
a centered horizontal row while retaining their native 64 px or 192 px atlas
frame boundaries.

Each effect has its own reusable class under `src/particle-fx/`. Instances
provide `play()` and `stop()` methods; `play()` restarts at frame zero without
adding another animation handle, and `stop()` freezes the visible current
frame. The running preview instances are available as
`globalThis.particleFxPreview.effects` for console inspection.

The editable `Particle FX.aseprite` source is preserved under
`assets/source/particles/`, while the browser loads only the exported PNG
sheets under `public/assets/particles/`. See
[`plugins/aseprite-babylon-lite/README.md`](plugins/aseprite-babylon-lite/README.md)
for the reusable descriptor and integration workflow.

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
