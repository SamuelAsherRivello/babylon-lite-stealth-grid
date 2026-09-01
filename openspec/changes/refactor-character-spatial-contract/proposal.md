## Why

Character actors currently duplicate sprite placement, pivot, art-offset, collider, scaling, and lifecycle logic. Small structural differences between assets therefore create recurring alignment defects, as seen with the monk and lancer, and require manual per-character correction after implementation.

## What Changes

- Introduce a shared runtime character actor core with behavior modules/hooks.
- Define one canonical spatial contract for all runtime characters.
- Quantize level spawner positions to grid-cell centers and place character logical centers there at runtime.
- Derive the green movement collider from each character's skeletal override, including its radius or shape.
- Use one grid-sized, bottom-aligned red combat collider for all characters for now.
- Align artwork to the grid-cell bottom through the shared transform path; initialize all art offsets to `{ x: 0, y: 0 }`.
- Route creation, movement, animation, spawn scaling, death scaling, diagnostics, grid occupancy, and render depth through shared spatial calculations.
- Preserve unique character behavior through per-character behavior modules.
- Rename code-facing `Pawn` terminology to `Player` where applicable, without renaming art files or changing their paths.
- Migrate Player, Sheep, Goblin, Archer, Warrior, Lancer, and Monk to the shared runtime structure.

## Capabilities

### New Capabilities

- `character-spatial-contract`: Defines the canonical grid-center placement, artwork alignment, collider roles, skeletal overrides, and shared actor behavior boundary.

### Modified Capabilities

None.

## Impact

- Affects character actor modules under `src/characters/` and shared coordinate/collider logic under `src/gameplay/`.
- Affects spawner setup, diagnostics, perception position reads, render-depth ordering, and visual spawn/death transforms in `src/main.js` and related systems.
- Requires migration and regression coverage for all seven runtime characters.
- Does not require new dependencies, art-file renames, or a combat-collider scale override.
