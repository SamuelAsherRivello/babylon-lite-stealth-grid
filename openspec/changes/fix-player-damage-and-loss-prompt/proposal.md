## Why

The player starts with 100 health, but enemy attacks can appear to land without reducing it: melee damage currently requires body overlap despite adjacent-cell attacks, and projectile collision routing excludes the player. Player death already animates but never transitions to a loss prompt.

## What Changes

- Make successful Goblin, Warrior, and Lancer attacks apply 25 player damage once per attack using their committed attack direction and damage event, including cardinally adjacent targets.
- Route enemy Archer arrows to the living player, applying 25 damage once per successful arrow hit. Keep player-owned arrows from damaging their owner.
- Test Archer arrows against the player throughout their visible flight; a hit removes the arrow immediately and prevents landing. Missed arrows stick in the ground and become harmless owner-only pickups, playing the temporary bush sound and rising 50 pixels while fading over 0.18 seconds, like gold, when their firing Archer overlaps their combat collider. Otherwise they persist until level cleanup, without timed or capacity-based eviction.
- Keep player starting health at 100; four successful 25-damage hits cause death. Do not introduce speculative 10/20/30/40 class tuning.
- Apply knockback on every successful enemy hit, including the lethal hit: Goblin 0.25 grid cell, Archer 0.5, Warrior 0.75, and Lancer 1.0, limited by blocking geometry.
- Finish the existing 250 ms shrink, fade, and rotation death animation while allowing the lethal hit knockback before showing a loss dialog styled like the level-win prompt.
- Show "You Lost" with "Try again!" and a "Continue" button that reloads the level, matching the current win action.
- Prevent further player actions or victory after lethal damage; pause gameplay once the death animation completes.

## Capabilities

### New Capabilities

- `player-loss-flow`: Ordered player defeat, animation completion, and loss dialog lifecycle.

### Modified Capabilities

- `combat-health-system`: Successful enemy melee and arrow hits damage the player exactly once per attack or projectile, with source-specific knockback distances.

## Impact

Combat routing in `src/main.js`, enemy attack event adapters, projectile ownership routing, the game state machine, end-of-level UI, and regression/browser tests. Coordinate with C056 (adjacent attacks) and C057 (centering before attacks), without changing their navigation scope. No new assets or dependencies. Canonical change identity uses C### and permanent task identities use C###-T###; the readable change name is `fix-player-damage-and-loss-prompt`.

