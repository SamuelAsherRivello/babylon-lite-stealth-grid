## Why

The source tree has grown across characters, gameplay, environment, spawners, objects, UI, and reusable editor/runtime integrations without a consistent ownership hierarchy. Reorganizing these modules now will make feature locations and plugin boundaries predictable while preserving existing game behavior.

## What Changes

- Group player, enemy, and NPC implementations under `src/characters/`.
- Group reusable runtime services under `src/systems/`, including environment, objects, and spawners.
- Group core gameplay calculations under `src/gameplay/`.
- Keep DOM-specific application code under `src/ui/` and move the pause controller there.
- Move reusable virtual-controller behavior and its scoped styles into `plugins/virtual-controller-babylon-lite/`.
- Move reusable Tiled loading, validation, normalization, and terrain-runtime conversion into `plugins/tiled-babylon-lite/`.
- Move the project screenshot into `documentation/images/` and update references.
- Add `src/templates/typescript-template.js` as a lean JavaScript/JSDoc structure template for humans and AI agents.
- Update imports and tests without changing observable gameplay behavior.

## Capabilities

This is a behavior-preserving structural refactor, so it intentionally introduces no specification deltas. The change opts out of specs through `skip_specs: true`.

## Impact

The change affects module paths throughout `src/`, tests, plugin directories, CSS ownership, documentation image references, and imports from `src/main.js`. It introduces no new external dependency and must preserve the existing public runtime behavior, tests, production build, and GitHub Pages-compatible relative paths.
