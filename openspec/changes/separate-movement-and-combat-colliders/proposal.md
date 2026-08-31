## Why

Characters currently expose one compact feet-centered collider for terrain movement, dynamic blocking, sensors, projectiles, and contact damage. This lets characters navigate the environment well but makes visible upper-body areas impossible to hit, so movement footprint and combat target area need independent geometry.

## What Changes

- Give every damageable character a `movementCollider` and a `combatCollider` with explicit subsystem ownership.
- Preserve the current circular movement colliders for the player, goblin, warrior, and sheep.
- Add per-character rectangular combat colliders, using a 64 px by 128 px feet-anchored rectangle as the player's initial geometry and artwork-fitted rectangles for the other characters.
- Use movement colliders for terrain, bounds, navigation, character blocking, and ground-level reactive sensors.
- Use combat colliders for projectile hits and the existing contact-damage overlap checks without changing when those checks deal damage.
- Display combat colliders in red and then movement colliders in green on top in collision diagnostics.

## Capabilities

### New Capabilities
- `character-collider-roles`: Defines separate, configurable movement and combat collider roles for damageable characters and assigns gameplay consumers to the correct role.

### Modified Capabilities
- `terrain-collision-classification`: Replaces the ambiguous single character collider requirement and diagnostic with an explicitly circular movement collider plus layered combat-collider visualization.
- `reactive-terrain-decorations`: Requires ground-level character sensors to use movement colliders rather than full-body combat colliders.

## Impact

This affects character construction and collider accessors in the player, goblin, warrior, and sheep modules; dynamic movement and navigation inputs; projectile and contact-combat queries; reactive-decoration inputs; collision diagnostics; and their automated tests. It adds no dependency and intentionally preserves existing movement geometry, damage amounts, attack-state gates, and contact-pair reset behavior.
