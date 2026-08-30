# Babylon Light Stealth Grid

Babylon Light Stealth Grid is a clean starting point for a new portrait-oriented Babylon Light game.

The project intentionally contains no gameplay, scene code, or assets. Its only browser-visible structure is an empty 9:16 game frame that stays centered and resizes to fit the available viewport without cropping.

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

- `index.html`: Minimal browser page and empty portrait game frame.
- `src/style.css`: Centering and responsive 9:16 frame sizing.
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

