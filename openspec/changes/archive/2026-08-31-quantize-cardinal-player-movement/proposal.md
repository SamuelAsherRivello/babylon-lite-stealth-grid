## Why

Free analog and diagonal movement lets the player drift away from grid centers, which makes cardinal travel imprecise in a level whose geometry is authored on an exact 64-pixel grid. The player needs gentle alignment during deliberate cardinal movement without losing diagonal freedom or bypassing collision rules.

## What Changes

- Detect cardinal player intent from keyboard input or analog input whose off-axis component is no more than 10% of its main-axis component.
- While moving vertically, ease the player's collision center toward the current grid column center over approximately 0.2 seconds; while moving horizontally, do the equivalent for the current grid row center.
- Leave diagonal movement unquantized and stop an active correction as soon as input no longer qualifies as cardinal.
- Preserve movement priority: collision constraints first, explicit player input second, grid quantization third, and programmatic effects last.
- Preserve current knockback behavior by suspending quantization during knockback and evaluating fresh input after knockback ends.

## Capabilities

### New Capabilities

- `player-grid-alignment`: Defines collision-aware, input-sensitive grid-centering assistance for cardinal player movement.

### Modified Capabilities

None.

## Impact

- Affects player movement selection and update behavior in `src/player.js` and reusable movement helpers in `src/game-logic.js`.
- Uses the canonical 64-pixel grid contract from `src/grid-contract.js` and the player's existing collider geometry.
- Extends movement-focused automated tests and requires browser verification of keyboard, analog, diagonal, collision, and knockback behavior.
- Adds no dependency, saved-data migration, public API break, or change to NPC/enemy navigation.
