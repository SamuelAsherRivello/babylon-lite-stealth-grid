## Why

Adjacent enemies can keep patrolling or responding to alerts instead of attacking the player. Cardinal GridSpot adjacency should consistently trigger combat regardless of awareness.

## What Changes

- Goblin, Warrior, Lancer, and Archer attack a living player one GridSpot above, below, left, or right in every alert state.
- Give this decision priority over navigation while preserving active attacks and recovery.
- Keep the Monk non-combatant: it patrols and reacts to alerts, without automatic attacks or healing.
- Preserve existing non-adjacent combat, damage, and projectile rules.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-actors`: shared cardinal-adjacency attack priority and explicit Monk exemption.

## Impact

Enemy awareness arbitration, actor attack adapters, Goblin recovery integration, Archer shot initiation, main-loop player snapshots, and regression tests. No dependencies or artwork changes. Canonical change C056 uses permanent C056-T### task IDs.
