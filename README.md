<!-- ai may update existing content, but only add/remove content if requrested by user -->

# Babylon Light Stealth Grid

Babylon Light Stealth Grid is a portrait-oriented Babylon Lite sprite game
prototype that runs with WebGPU.

A Babylon-branded startup preloader appears before the first game graphics,
covers asset loading, and closes after the first rendered frame. Loading errors
show a Retry button. This lightweight screen is local to the project because
Babylon Lite does not ship the full engine's default loading UI.

<figure>
  <a href="https://samuelasherrivello.github.io/babylon-lite-stealth-grid/">
  <img
    alt="Babylon Light Stealth Grid gameplay screenshot"
    src="./documentation/images/output-arrow-check.png"
    width="400px"
  >
  </a>
  <figcaption>
    Image 1 - Babylon.js Lite Game - HTML5 + WebGPU
  </figcaption>
</figure>

## Live Demo

[Play the live demo](https://samuelasherrivello.github.io/babylon-lite-stealth-grid/)

WebGPU not working? See [Troubleshooting](#troubleshooting).

## Table of Contents

1. [Live Demo](#live-demo)
2. [Getting Started](#getting-started)
3. [Project Overview](#project-overview)
4. [Project Details](#project-details)
5. [Troubleshooting](#troubleshooting)
6. [Resources](#resources)
7. [Credits](#credits)

## Getting Started

### Play Project

1. Clone or download this repo.
2. Open the repository root in a command line.
3. Run `npm install` to install the project dependencies.
4. Run `npm run build` to build the project.
5. Run `npm run dev` to launch the local development server.
6. Open the URL printed by Vite.

### Release Workflow

1. Run `npm ci`, `npm test`, `npm run test:publish`, and `npm run build`.
   Both the full test suite and focused publishing checks must pass before deployment.
2. Commit and push to `master` in
   [`SamuelAsherRivello/babylon-lite-stealth-grid`](https://github.com/SamuelAsherRivello/babylon-lite-stealth-grid).
   The `Deploy live demo` workflow runs all tests, validates publishing contracts, builds `dist`,
   and deploys it using GitHub Actions. No release tag is needed to publish.
3. Wait for the [deployment workflow](https://github.com/SamuelAsherRivello/babylon-lite-stealth-grid/actions/workflows/deploy-pages.yml)
   to succeed, then verify the [live game](https://samuelasherrivello.github.io/babylon-lite-stealth-grid/).

For a versioned release, also update `public/environment.json` and optionally
create a matching three-component GitHub Release tag such as `v0.1.8`.
The displayed version comes from that file, not from Git tags.

GitHub repository Settings → Pages → Source must remain **GitHub Actions**.
To redeploy the current branch without a new commit, use **Run workflow** on
`Deploy live demo`. Vite uses `base: "./"`, so asset URLs remain relative to the
Pages project path after a repository rename. If renamed again, update the Git
remote and these README links; keep the workflow branch aligned with the
repository's publishing branch. The screenshot above also opens the live game.

To recover from a bad publish, make a corrective commit and push it to `master`;
do not rewrite history or force-push.

### More Commands

| # | Name | Command | Comment |
| --- | --- | --- | --- |
| 1 | Install | `npm install` | Installs the project dependencies. |
| 2 | Dev | `npm run dev` | Runs the project with hot reload. |
| 3 | Build | `npm run build` | Creates the production bundle. |
| 4 | Preview | `npm run preview` | Serves the production bundle locally. |
| 5 | Test | `npm test` | Runs the automated tests. |
| 6 | Publishing checks | `npm run test:publish` | Checks Pages links, screenshot, relative paths, and release metadata. |

## Project Overview

This repo demonstrates browser-based game development with Babylon.js Lite,
JavaScript, Vite, and WebGPU.

### Documentation

- `README.md`: Primary documentation for this repo.
- [`documentation/tile-map.md`](documentation/tile-map.md): Tiled map editing
  workflow.
- [`documentation/grid-and-ui-contract.md`](documentation/grid-and-ui-contract.md): Logical grid
  and UI placement contract.
- [`documentation/render-depth-order.md`](documentation/render-depth-order.md): Babylon Lite
  sprite and DOM overlay depth bands.

### Configuration

- `Game Engine`: Babylon.js Lite powers the graphics and gameplay systems.
- `Renderer`: WebGPU renders the game in supported browsers.
- `Level Editor`: Tiled authors the terrain map and layers.

### Structure

- `index.html`: Browser page and application entry point.
- `src/main.js`: Babylon Lite game bootstrap and scene composition.
- `src/ui/style.css`: Application styles and responsive layout.
- `src`: Application source code.
- `test`: Automated tests.

### Dependencies

- `package.json`: Lists project dependencies and scripts.
- `vite.config.js`: Configures local development and production builds.

## Project Details

### Editor Tooling

- Visual Studio Code: Source code editor.
- Tiled: Tile map and level editor.
- Babylon.js Inspector: Runtime scene inspection.

### Code Packages

- `@babylonjs/lite`: Lightweight Babylon.js rendering and game APIs.
- `vite`: JavaScript bundling and local development server.
- Node.js test runner: Automated JavaScript testing.

### Tile Map

Levels are authored with Tiled. The AI prepares the Tiled project, map,
tilesets, grid, origin marker, layers, properties, and runtime integration; the
human edits content only on the existing layers.

See [Tile Map Editing](documentation/tile-map.md) for the open, edit, save,
close, and play workflow.

### OpenSpec

[OpenSpec](https://openspec.dev/) keeps feature intent, implementation, and
current specifications aligned.

| # | Name | Command | Custom | Comment |
| --- | --- | --- | :---: | --- |
| 1 | [Explore](.agents/skills/openspec-explore/SKILL.md) | `/opsx:explore` | ☐ | Optional feature discovery and planning. |
| 2 | [Propose](.agents/skills/openspec-propose/SKILL.md) | `/opsx:propose <name>` | ☐ | Creates one focused feature change. |
| 3 | [Grill Me](.agents/skills/open-spec-grill-me/SKILL.md) | `/open-spec-grill-me <name>` | ☑ | Resolves design decisions before implementation. |
| 4 | [Apply](.agents/skills/openspec-apply-change/SKILL.md) | `/opsx:apply <name>` | ☐ | Implements and completes one change. |
| 5 | [Sync](.agents/skills/openspec-sync-specs/SKILL.md) | `/opsx:sync <name>` | ☐ | Updates main specs without archiving. |
| 6 | [Archive](.agents/skills/openspec-archive-change/SKILL.md) | `/opsx:archive <name>` | ☐ | Finalizes and archives a change. |

#### Workflow Depth

- LOW: Use no steps. Just chat with a fast model like
  [Spark](https://developers.openai.com/api/docs/models/gpt-5.3-codex).
- MED: Use steps 2/4 with a
  [Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna) or
  [Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra).
- HIGH: Use steps 1-6 with
  [Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol).

## Troubleshooting

### WebGPU not working?

First, open the [official WebGPU Samples hello-triangle
test](https://webgpu.github.io/webgpu-samples/?sample=helloTriangle). If it does
not render, the browser or device cannot currently run this project's WebGPU
path.

For Chrome-specific troubleshooting, see the official [WebGPU
documentation](https://developer.chrome.com/docs/web-platform/webgpu/). It
covers browser requirements, secure origins, graphics acceleration,
`chrome://gpu`, and the `enable-unsafe-webgpu` development flag.

Third-party references:

- [WebGPU Report](https://webgpureport.org/) shows the detected adapter, limits,
  and features.
- [WebGPU Fundamentals](https://webgpufundamentals.org/) explains compatibility
  mode and its experimental Chrome flag.
- [WebGPU Check](https://webgpucheck.com/) provides browser-specific enablement
  guidance and diagnostics.
- [Can I use: WebGPU](https://caniuse.com/webgpu) tracks current browser support.

## Resources

- [Babylon.js Lite getting started](https://doc.babylonjs.com/lite/01-getting-started)
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Babylon.js Playground](https://playground.babylonjs.com/)
- [Babylon.js Inspector](https://doc.babylonjs.com/toolsAndResources/inspector)
- [Vite Documentation](https://vite.dev/guide/)

## Credits

### Created By

- Samuel Asher Rivello
- Over 25 years of game development experience as of 2026

### Contact

- Twitter: <https://twitter.com/srivello/>
- Git: <https://github.com/SamuelAsherRivello/>
- Resume and portfolio: <http://www.SamuelAsherRivello.com>
- LinkedIn: <https://Linkedin.com/in/SamuelAsherRivello>

### License

Provided as-is under the MIT License.
Copyright © 2026 Rivello Multimedia Consulting, LLC.
