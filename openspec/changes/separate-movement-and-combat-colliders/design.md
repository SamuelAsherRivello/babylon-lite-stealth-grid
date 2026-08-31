## Context

See `proposal.md` for motivation. Character modules currently store one local collider descriptor and expose one world-space collider accessor. `main.js` routes that result through combat state and then reuses it for dynamic blocking, projectiles, contact damage, reactive decorations, and diagnostics. Sheep navigation also consumes dynamic colliders. The shared overlap helpers already support circles and axis-aligned rectangles.

## Goals / Non-Goals

**Goals:**
- Make collider role selection explicit at subsystem boundaries.
- Preserve existing movement feel while making visible bodies targetable.
- Keep collider geometry local to each character and convert both roles through the same world-space transform.
- Make both roles visually inspectable for tuning.

**Non-Goals:**
- Introducing animation-timed weapon hitboxes or a third attack-collider role.
- Changing damage values, invulnerability timing, attack-state rules, knockback, death lifecycle, or projectile geometry.
- Moving collider configuration into Tiled or adding a physics dependency.

## Decisions

### Use named collider accessors rather than an unordered collection

Characters will expose `getMovementCollider()` and `getCombatCollider()`. Movement/navigation records and combat-target records will carry the appropriately named collider instead of relying on a generic `getCollider()` or array position.

This makes incorrect subsystem routing visible in code review. An array of colliders was rejected because callers could silently choose the wrong shape, and a single descriptor with a mode argument was rejected because it makes every call site depend on stringly typed role selection.

### Store two local descriptors per character

Each actor will retain its current circle as `movementCollider` and gain a local rectangular `combatCollider`. Both descriptors will use the existing frame-and-pivot transformation into world coordinates. The player's first combat descriptor represents a 64 by 128 rectangle centered on the actor and extending upward from visible foot registration. Goblin, warrior, and sheep descriptors will be initialized from their art proportions and tuned using the diagnostics; they remain explicit per-character constants.

A universal rectangle was rejected because the sheep and humanoids have materially different silhouettes. Deriving collision from opaque pixels on every animation frame was rejected as unstable, unnecessarily expensive, and likely to make hits animation-dependent.

### Route by gameplay responsibility

Terrain collision, world bounds, path planning, dynamic character blocking, and bush sensing will receive movement colliders. Projectile targeting and all existing contact-damage overlap tests will receive combat colliders. The existing conditions surrounding those overlaps remain authoritative, so a persistent combat overlap does not itself create a new attack rule.

Combat state will suppress the combat collider for dying and dead actors as it does today. Movement participation during death will retain current lifecycle behavior rather than being redefined by this change.

### Draw combat before movement

Diagnostics will collect both collider roles for every supported living character. Combat rectangles will render red first; movement circles will render green second. Drawing order is part of the diagnostic contract because it keeps the smaller navigation footprint legible inside the larger body target.

Terrain collider styling remains separate even if it currently uses a red family of colors; character combat styling should use a distinguishable opacity or shade while retaining the requested red semantic.

## Risks / Trade-offs

- [Tall combat rectangles can create visually surprising contact overlap] -> Preserve current attack and movement gates, then verify all contact pairs in-browser before accepting geometry.
- [Pivot math can anchor a rectangle below or above visible feet] -> Add pure transform tests and inspect the debug overlay for every character and facing.
- [A generic collider may remain at an overlooked call site] -> Replace character-facing generic accessors and add routing tests for terrain, projectiles, navigation, bushes, and contact damage.
- [Red terrain and red combat overlays may be confused] -> Use distinct fill opacity or red shade while keeping combat red and movement green.
- [Per-character tuning can become inconsistent] -> Keep shape defaults documented and geometry constants beside each actor's frame and pivot configuration.

## Migration Plan

1. Add both role descriptors and accessors while preserving all existing movement values.
2. Split runtime snapshots into movement and combat collider collections and migrate each consumer by responsibility.
3. Update diagnostics and tune combat rectangles against visible sprites.
4. Run unit tests, build verification, and browser checks for navigation, projectiles, contact damage, sheep fleeing, bushes, and death cleanup.

Because this is an internal runtime API change, rollback consists of reverting the role split and returning consumers to the previous generic collider accessor; there is no saved-data migration.
