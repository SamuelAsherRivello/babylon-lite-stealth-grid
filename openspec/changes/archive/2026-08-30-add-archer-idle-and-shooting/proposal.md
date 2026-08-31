## Why

The archer currently loops its running animation even while stationary and has
no attack action. Adding idle, shooting, and projectile behavior makes the
existing movement prototype read as a responsive playable character.

## What Changes

- Display the supplied idle animation whenever the archer is not moving.
- Continue displaying the run animation while the archer moves with WASD or
  the arrow keys.
- Start one complete shooting animation when Space is pressed, temporarily
  locking movement and ignoring repeated shoot input until it finishes.
- Release the supplied arrow sprite at the visual release point of the shoot
  animation in the archer's last horizontal facing direction.
- Give each arrow a gameplay collider and a gravity-driven arc that ends when
  it reaches the ground, after which the arrow disappears.
- Add the supplied idle, shoot, and arrow sprite sheets to the project's local
  archer assets and use their native frame dimensions.

## Capabilities

### New Capabilities

- `archer-ranged-attack`: Defines archer animation states, Space-triggered
  shooting, projectile release, flight, collision, landing, and removal.

### Modified Capabilities

None.

## Impact

- Affects `src/main.js`, movement/projectile logic in `src/game-logic.js`,
  corresponding tests in `test/game-logic.test.js`, and the controls described
  in `README.md`.
- Adds `Archer_Idle.png`, `Archer_Shoot.png`, and `Arrow.png` under
  `public/assets/units/archer/`.
- Corrects archer atlas frame sizing from 192x144 to the assets' native
  192x192 frames.
- Adds no runtime or development dependencies.
