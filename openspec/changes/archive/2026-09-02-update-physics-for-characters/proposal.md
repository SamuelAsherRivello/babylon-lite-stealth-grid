## Why

Characters currently use manual movement-collider checks, which can leave enemies interpenetrating and stall gameplay. A bounded 2D separation solver is sufficient for this pixel-based game and avoids a heavyweight runtime.

## What Changes

- Give player and enemy movement colliders solid custom-physics shapes that cannot overlap.
- Resolve circle separation before movement and synchronize corrected transforms to rendering.
- Keep combat colliders as overlap sensors that never block movement.
- Bound solver iterations and report unresolved contacts without freezing gameplay.
- Preserve existing enemy AI, attacks, defense, healing, projectile, and debug visualization behavior.

## Capabilities

### New Capabilities
- `character-physics`: Solid movement shapes and overlap-permitting combat sensors for all characters.

### Modified Capabilities
- `character-collider-roles`: Update the existing movement/combat collider contract to be backed by physics body roles.

## Impact

Affected character actors, the main update loop, terrain collision setup, combat hit detection, debug collider rendering, and tests. No new runtime dependency is required.
