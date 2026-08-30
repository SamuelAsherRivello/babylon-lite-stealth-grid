# Babylon Light Stealth Grid

Babylon Light Stealth Grid is a portrait-oriented Babylon Lite sprite game prototype.

The current demo repeats a Tiny Swords terrain tile across the playfield and places an animated archer in its center. Move the archer with WASD or the arrow keys. The game uses quadrant-I world coordinates: positive X points right and positive Y points up.

## Getting Started

1. Clone or download this repository.
2. Open the repository root in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the URL printed by Vite.

## Commands

| # | Name | Command | Comment |
| --- | --- | --- | --- |
| 1 | Install | `npm install` | Installs the project dependencies. |
| 2 | Dev | `npm run dev` | Runs the project with hot reload. |
| 3 | Build | `npm run build` | Creates the production bundle. |
| 4 | Preview | `npm run preview` | Serves the production bundle locally. |

## Project Structure

- `index.html`: Browser page, portrait canvas, and compact control/coordinate overlays.
- `src/main.js`: Babylon Lite sprite renderer, terrain, animation, and keyboard input.
- `src/game-logic.js`: Quadrant-I movement and coordinate conversion.
- `src/style.css`: Centering and responsive 9:16 frame sizing.
- `public/assets`: Local Tiny Swords terrain and archer sprite sheets.
- `test/game-logic.test.js`: Movement and coordinate-contract tests.
- `vite.config.js`: Vite configuration for local development and production builds.

## Portrait Frame Contract

The game frame uses a 9:16 aspect ratio. Its width is the smaller of the full viewport width and 56.25% of the viewport height, so it remains fully visible and centered in both desktop and portrait browser windows.

Future visuals, controls, text, spacing, borders, and effects should size and position themselves relative to the game frame so the composition scales consistently as the frame resizes.

## Resources

- [Babylon.js Lite getting started](https://doc.babylonjs.com/lite/01-getting-started)
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Vite Documentation](https://vite.dev/guide/)

## License

Provided as-is under the MIT License.
