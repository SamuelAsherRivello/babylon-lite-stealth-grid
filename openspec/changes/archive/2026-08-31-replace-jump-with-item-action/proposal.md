## Why

The current action layout exposes a Jump action that is no longer part of the
gameplay model. Replacing it with a clearly named Item action makes the mobile
and keyboard controls match the player loadout while removing an obsolete
movement capability.

## What Changes

- **BREAKING** Rename the virtual-controller `Jump` button to `Item`.
- Keep `C` as the keyboard shortcut, but make it request item use instead of
  jump.
- Use the currently held item when Item is activated, clear the inventory slot,
  and drop gold as a pickup from the player's center in the movement direction.
  Wood and meat are consumed but do not yet create map pickups.
- Keep `V` as the Attack shortcut and make Attack use the equipped weapon.
- Remove jump input handling, jump state transitions, physics/motion, and jump
  animation behavior from the player flow.
- Preserve Attack as a weapon-only action; with no equipped weapon it remains a
  no-op.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `virtual-player-controller`: Replace Jump with Item and define independent
  pointer/keyboard item activation alongside weapon attack.

## Impact

The virtual controller, keyboard input mapping, player interaction state, Pawn
animation selection, gold pickup spawning, and their tests will change. No new dependency or public
service API is required.
