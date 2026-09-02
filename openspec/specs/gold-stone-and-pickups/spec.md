# gold-stone-and-pickups Specification

## Purpose

Provides a Tiled-authored destructible Gold Stone that creates animated, player-only Gold Pickup objects as a visible resource reward.

## Requirements

### Requirement: One-shot Gold Stone placement
Each authored Gold Stone placement SHALL spawn exactly one stone at its authored position per level load and SHALL NOT respawn during that level session.

#### Scenario: Level loads a Gold Stone
- **WHEN** a level containing a Gold Stone placement is loaded
- **THEN** exactly one stone appears at that placement

### Requirement: Gold Stone appearance and idle animation
Each spawned stone SHALL independently choose Gold Stone 5 or Gold Stone 6, display its idle frame, and play its six-frame highlight animation once after a randomized delay between five and ten seconds, repeating while alive.

#### Scenario: Stone idles and highlights
- **WHEN** a living stone reaches its randomized highlight delay
- **THEN** it plays one complete highlight cycle and returns to its idle frame

### Requirement: Projectile damage and object death
The stone SHALL expose a combat collider for the existing player projectile attack and SHALL have exactly one health. At zero health, it SHALL stop accepting damage and perform ObjectDeath by fading, rotating, and shrinking, then be removed.

#### Scenario: Player projectile destroys stone
- **WHEN** an existing player projectile overlaps a living Gold Stone combat collider
- **THEN** the stone takes one damage and begins ObjectDeath

### Requirement: Gold Stone drop creation
After ObjectDeath completes, the stone SHALL create two or three Gold Pickup objects with equal probability. Each pickup SHALL independently choose Gold Stone 1 or Gold Stone 2.

#### Scenario: Stone creates pickups after death
- **WHEN** the stone finishes ObjectDeath
- **THEN** two or three independently rendered pickups are created

### Requirement: 9-grid pickup placement
Each pickup SHALL choose a distinct valid unoccupied tile from the eight cells surrounding the stone's center cell in the 3-by-3 9-grid. Invalid or blocked destinations SHALL be re-rolled; if fewer valid cells remain, only safely placeable pickups SHALL be created.

#### Scenario: Pickups land around the stone
- **WHEN** pickups are created
- **THEN** every pickup targets a distinct valid neighboring 9-grid cell and never the center cell

### Requirement: Pickup spawn animation and collection
Each pickup SHALL use a tweened PickupSpawnAnimation from its authored or drop origin toward its destination, including fade-in, scale-in, and an arc rising about one tile. Its non-blocking player collection combat collider SHALL be centered on its current logical position and SHALL be transformed by the shared viewport scale. Overlap by the player SHALL cancel the spawn tween and begin PickupObjectDeath. A pickup SHALL expose `IsPickedUp`, initialized to `false`, and SHALL expose a `pickup()` transition that sets `IsPickedUp` to `true` immediately upon successful collection. Once `IsPickedUp` is `true`, the pickup SHALL no longer expose a collection collider or accept another pickup transition.

#### Scenario: Player collects a flying pickup
- **WHEN** the player's walk collider overlaps a pickup during PickupSpawnAnimation
- **THEN** the pickup's `pickup()` transition succeeds, `IsPickedUp` becomes `true`, the spawn tween is cancelled, and PickupObjectDeath begins

#### Scenario: Collected pickup cannot be collected again
- **WHEN** a pickup has `IsPickedUp` equal to `true`
- **THEN** it exposes no collection combat collider and any subsequent `pickup()` call fails without restarting or resetting PickupObjectDeath

#### Scenario: Pickup remains aligned during resize
- **WHEN** the viewport is resized while a pickup exists
- **THEN** its sprite and combat collider remain aligned at the same logical position relative to the grid

### Requirement: Pickup object death
PickupObjectDeath SHALL fade and scale the pickup out, then remove it. Pickup collection SHALL have no other gameplay consequence and non-player colliders SHALL NOT collect it.

#### Scenario: Pickup disappears on collection
- **WHEN** the player collects a pickup
- **THEN** it fades and scales out and no reward or other state change occurs
