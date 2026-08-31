## Context

See `proposal.md` for motivation. The application currently has 52 JavaScript source files, broad unit coverage, and direct imports across root-level gameplay modules, character folders, UI, and two repository plugins. The working tree also contains unrelated user changes, so migration edits must preserve overlapping content and avoid destructive Git operations.

## Goals / Non-Goals

**Goals:**

- Give every current source module one clear destination in the agreed hierarchy.
- Keep reusable Tiled and virtual-controller behavior in repository plugins.
- Preserve module APIs and observable gameplay behavior while changing import paths.
- Protect the migration with focused tests before moving behavior that lacks direct coverage.
- Keep DOM-specific application behavior and styling in `src/ui/`.

**Non-Goals:**

- Redesign gameplay, actor behavior, collision rules, rendering, settings, or level data.
- Introduce TypeScript, a UI framework, new packages, or a new build system.
- Refactor the large internal implementations of `main.js`, `game-logic.js`, or actor modules beyond import adjustments required by the move.
- Remove provisional or apparently unused modules during the structural migration.

## Decisions

### Organize application code by ownership

Characters move under `src/characters/{player,enemies,npc}`; core calculations move under `src/gameplay`; spawners, environment, and runtime objects move under `src/systems`; DOM-related application modules move under `src/ui`. This keeps the migration mechanical and avoids mixing structural work with behavior refactoring.

Alternative considered: organize everything by technical layer. That would scatter each character across state, rendering, and controller directories and make a small game harder to navigate.

### Keep reusable Tiled conversion inside the Tiled plugin

The current `src/tiled-terrain.js` accepts normalized Tiled placements and converts their coordinates and collision shapes into runtime terrain records. It moves to `plugins/tiled-babylon-lite/terrain-runtime.js`, while game-specific grid, depth, decoration behavior, and frame configuration remain in `src/systems/environment/`.

The existing plugin `index.js` will remain its public entry point. Its implementation may be divided into loader, normalizer, validator, and terrain-runtime modules without changing exported function names.

Alternative considered: keep terrain conversion in `src`. This would leave a reusable portion of the Tiled pipeline split across application and plugin ownership.

### Make the virtual controller self-contained

The current DOM controller moves to `plugins/virtual-controller-babylon-lite/`. Joystick normalization needed by the controller moves with it so the plugin does not import application gameplay code. Controller-specific CSS moves to the plugin and is imported through its public entry point; general game UI CSS stays in `src/ui/style.css`.

Alternative considered: leave vector calculation in `src/gameplay/game-logic.js`. That would invert the dependency by making a reusable plugin depend on its host application.

### Preserve public exports during moves

Tests and application imports will be updated to canonical new paths. Plugin `index.js` files will expose reusable APIs so consumers do not depend on plugin internals. Temporary compatibility shims are unnecessary because this is one bundled application with no published module API.

### Add a lean JavaScript/JSDoc template

`src/templates/typescript-template.js` will demonstrate modern module ordering and TypeScript-compatible JSDoc. Comments will precede meaningful sections and methods only, describing intent or constraints rather than restating syntax.

### Use a test-first migration sequence

Before moves, run the existing suite and add focused tests only for behavior crossing a new boundary that is not already directly protected. Then move one coherent area at a time, updating imports and running focused tests after each group. Finish with the full Node test suite and production build.

## Risks / Trade-offs

- [Risk] Large import-path churn can leave stale references. → Search the whole repository for old paths after every move and before final verification.
- [Risk] Existing uncommitted changes overlap migration targets. → Inspect diffs, use additive filesystem moves, and preserve file contents without Git restore/reset operations.
- [Risk] Moving virtual-controller CSS can change selector order or cascade behavior. → Preserve rule text and loading order, then verify the production build and relevant UI tests.
- [Risk] Splitting the Tiled plugin could accidentally change normalization behavior. → Keep public exports stable and rely on existing Tiled level, decoration, spawner, and terrain tests.
- [Risk] Pure file moves create noisy diffs. → Avoid unrelated formatting and behavioral cleanup.

## Migration Plan

1. Record the baseline test and build results.
2. Add focused boundary tests if the virtual-controller vector logic, plugin terrain conversion, screenshot path, or template contract lacks protection.
3. Create destination directories and move character and gameplay modules, updating imports and tests.
4. Move environment, object, and spawner modules, updating imports and tests.
5. Move DOM modules into `src/ui/` and create the virtual-controller plugin with scoped CSS.
6. Move Tiled terrain conversion into the Tiled plugin and, where useful, split its internal implementation behind stable exports.
7. Move the documentation screenshot, add the template, and update references.
8. Search for stale paths, run all tests, run the production build, and inspect the final diff.

Because this is an internal source migration deployed as one build, rollback consists of reverting the migration commit through a new additive commit; no runtime data or schema rollback is required.
