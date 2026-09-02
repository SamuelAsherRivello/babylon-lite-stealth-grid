## Why

Enemies can start attacks while between grid centers, making their stance and turn toward the player look awkward. Moving to the exact center of their own occupied grid space before aiming gives each attack a consistent visual starting position.

## What Changes

- Add an ordered preparation phase for enemy attacks against the player: center in the enemy's own GridSpot, update heading toward the player, then start the attack.
- Apply the sequence to Goblin, Warrior, Lancer, and Archer, including adjacent-player and existing non-adjacent player attack paths.
- Move continuously through normal collision-aware movement; stop exactly at the captured cell center before aiming or starting attack effects.
- Recheck the live player and existing attack eligibility after centering; cancel invalid or interrupted preparations without firing an attack.
- Preserve existing attack animations, damage, recovery, and target locking once an attack begins.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-actors`: Require ordered centering, heading update, and attack initiation for player-targeted enemy attacks.

## Impact

Canonical change ID: C057. Tasks use permanent IDs C057-T###; the readable change name is `center-enemies-before-attacking`.

Affected areas include the shared adjacent-player attack decision, awareness/navigation ownership, Goblin combat decisions, Archer autonomous shooting, actor movement integration, and character/browser tests. Integrate with C056 and the current GridSpot contract without changing their eligibility or quantization rules. No new dependencies or asset changes are required. Sheep and bush targeting, player controls, and the non-attacking Monk remain outside this change.
