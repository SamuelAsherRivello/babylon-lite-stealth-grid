## Why

Enemies currently have no shared stealth-perception model. A centralized system is needed so the goblin, archer, and warrior consistently sense the player, report grid-based detections, and enter predictable alert behavior.

## What Changes

- Add centralized `Character Perception` registration and evaluation.
- Add `Visual Perception` as a cardinal facing-direction line with default range four and distance-ranked strength: 100%, 75%, 50%, and 25%.
- Add `Audio Perception` as an omnidirectional default 9-grid radius.
- Block Visual Perception at unwalkable terrain while allowing Audio Perception through it.
- Register the player on spawn and deregister it on death.
- Report perception type, strength, and detected grid spot to registered enemies.
- Add enemy alert handling that accepts the first trigger, performs the strength-specific response, waits through alert/cooldown time, then resumes prior behavior.

## Capabilities

### New Capabilities

- `character-perception`: Centralized Visual and Audio Perception, detection reporting, and enemy alert behavior.

### Modified Capabilities

None.

## Impact

Likely affects the main update coordinator, player lifecycle, goblin/archer/warrior integration, enemy state behavior, grid/terrain queries, and new unit tests. No new dependency is required. The detection output must expose a stable read-only snapshot/event contract for the separate debug-rendering change.
