# character-collider-roles Specification

## Purpose
Define distinct character collision roles so navigation remains feet-based while combat can target each character's visible body.

## Requirements

### Requirement: Characters expose movement and combat collider roles
Every damageable player, enemy, and NPC character SHALL expose one movement collider and one combat collider that remain aligned with the character as it moves or changes animation. The default movement shape SHALL be a circle and the default combat shape SHALL be an axis-aligned rectangle, while each character SHALL be able to override either geometry.

#### Scenario: Character collider roles are queried
- **WHEN** a living player, goblin, warrior, or sheep is active
- **THEN** its current movement collider and combat collider are independently available in world coordinates

#### Scenario: Character uses tuned geometry
- **WHEN** a character defines collider dimensions that differ from the defaults
- **THEN** both roles remain aligned to that character's ground registration point using its configured geometry

### Requirement: Existing movement footprints are preserved
The player, goblin, warrior, and sheep movement colliders SHALL retain their existing circular geometry and SHALL remain the only character colliders used for terrain collision, playfield bounds, navigation, and physical separation between characters.

#### Scenario: Character traverses the environment
- **WHEN** a character moves near terrain or another character
- **THEN** collision resolution uses its movement circle and does not allow its taller combat rectangle to block movement

### Requirement: Combat colliders cover visible vulnerable bodies
The player SHALL initially use a 64 px wide by 128 px high combat rectangle centered horizontally with its bottom anchored to the character's visible feet. The goblin, warrior, and sheep SHALL use independently configured rectangles fitted to their visible body proportions, with humanoid rectangles extending upward and the sheep rectangle using a wider, shorter profile.

#### Scenario: Projectile crosses a character's upper body
- **WHEN** a projectile overlaps the living character's combat rectangle without overlapping its movement circle
- **THEN** the projectile is treated as hitting that character

#### Scenario: Character-specific proportions differ
- **WHEN** humanoid and sheep combat colliders are inspected
- **THEN** each rectangle follows its own configured dimensions rather than a universal rectangle

### Requirement: Combat overlap preserves existing damage rules
Projectile targeting and contact-damage overlap checks SHALL use combat colliders. Damage amounts, enemy attack-state gates, moving-player contact behavior, enemy-to-sheep contact behavior, and contact-pair reset behavior SHALL remain unchanged.

#### Scenario: Combat colliders overlap without an active damage trigger
- **WHEN** two combat colliders overlap but the existing actor-state and movement rules do not permit damage
- **THEN** neither actor receives damage solely because of the overlap

#### Scenario: Existing contact trigger is satisfied
- **WHEN** two combat colliders overlap and the existing actor-state or movement rule permits contact damage
- **THEN** damage is applied with the existing amount and contact-pair behavior

### Requirement: Collider diagnostics distinguish both roles
Collision diagnostics SHALL render every living character's combat collider in red and SHALL then render that character's movement collider in green so the green movement shape appears on top wherever the two overlap.

#### Scenario: Diagnostics show overlapping collider roles
- **WHEN** collision diagnostics are visible for any supported character
- **THEN** its red combat rectangle is drawn first and its green movement circle is drawn afterward

### Requirement: Character collider roles are distinct
The player and enemies SHALL expose a green movement collider as a solid physics shape and a red combat collider as a separate trigger shape. Movement collision tests SHALL use only solid movement shapes; combat overlap tests SHALL use only combat trigger shapes.

#### Scenario: Movement colliders are routed to movement physics
- **WHEN** a character moves
- **THEN** its green movement shape SHALL participate in terrain and character separation, while its red combat shape SHALL be excluded from movement blocking

#### Scenario: Combat colliders are routed to combat events
- **WHEN** an attack checks targets
- **THEN** only the red trigger overlap SHALL determine candidate contact, subject to the existing combat rules
