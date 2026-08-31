## Why

The current playable `Player` is rendered as an archer and is limited to a
three-state idle/run/shoot model. The supplied Tiny Swords Pawn artwork enables
a more expressive playable character with persistent independent weapon and
item slots while preserving the existing movement and jump experience.

## What Changes

- Replace the archer artwork and archer-specific player animation model with
  the Tiny Swords Pawn artwork copied under `public/assets/player/pawn/`.
- Keep the runtime character identity as `Player`, including movement,
  collision, jumping, facing, and world/grid integration.
- Add independent slots for zero or one weapon (`axe`, `hammer`, `knife`, or
  `pickaxe`) and zero or one item (`gold`, `meat`, or `wood`).
- Add temporary development controls: key `1` cycles weapons and key `2`
  cycles items.
- Disable both slot-switch controls during the active weapon animation,
  cooldown, and damage window.
- Replace `Shoot` with `Attack`; attacks use the equipped weapon interaction
  animation and do nothing when no weapon is equipped.
- Keep movement available during attacks; ignore new attack input until the
  current attack presentation ends.
- Show the held item during locomotion, temporarily show the weapon during its
  interaction and for 0.5 seconds afterward, then return to the held-item
  presentation.
- Add a movement collider and an attack-only combat collider. Weapon damage is
  knife 10, pickaxe 20, axe 30, and hammer 40.
- Remove the archer arrow-release behavior from the playable character.

## Capabilities

### New Capabilities

- `pawn-player-loadout`: Pawn presentation, independent item/weapon slots,
  temporary cycling, attack presentation, and melee combat.

### Modified Capabilities

- `virtual-player-controller`: Change the action control from `Shoot` to
  `Attack` while retaining movement and jump behavior.
- `archer-ranged-attack`: Remove the archer-specific playable attack and arrow
  requirements in favor of the pawn weapon interaction model.

## Impact

Affected areas include `src/player.js`, `src/player-state.js`, player-related
gameplay integration, player tests, and the action-control markup/styles. The
new PNG assets are already present in `public/assets/player/pawn/`. No new
dependency is expected.
