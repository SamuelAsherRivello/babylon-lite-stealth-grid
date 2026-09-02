## Why

Enemy actors currently receive cardinal patrol intents but move directly through continuous collision movement. This lets an enemy drift away from the centerline of its row or column, weakening grid readability and making occupancy, navigation, and combat positioning inconsistent.

## What Changes

- Add quantized enemy movement on one axis: vertical movement locks the enemy toward the current column center, and horizontal movement locks it toward the current row center.
- Apply the behavior consistently to Goblin, Archer, Warrior, Lancer, and Monk movement.
- Preserve smooth movement, obstacle collision handling, attack locks, knockback, and existing AI decisions.
- Reset or replace orthogonal alignment safely when movement stops, changes axis, or external displacement occurs.
- Add regression coverage for horizontal and vertical enemy movement and actor integration.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `actor-ai-behaviors`: Enemy cardinal movement now maintains the orthogonal grid-cell centerline while traveling.

## Impact

- Affects enemy actor movement implementations under `src/characters/enemies/` and shared movement utilities under `src/gameplay/game-logic.js`.
- Adds or updates enemy movement tests and may update browser smoke coverage.
- Requires no new dependencies, asset changes, or level-format changes.
