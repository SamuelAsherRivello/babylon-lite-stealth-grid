## Purpose

Provides a shared health and defeat model so player, sheep, and goblin entities can
receive damage from defined combat interactions and transition into a consistent
death animation when health reaches zero.

## ADDED Requirements

### Requirement: Entities start with health
Each player, sheep, and goblin entity SHALL start with exactly 100 health points and SHALL track current health internally during gameplay.

#### Scenario: Initial health state
- **WHEN** gameplay starts
- **THEN** the hero, sheep, and enemy each have 100 current health points

### Requirement: Damage is applied only by defined sources and amounts
The system SHALL apply damage only through the defined interaction matrix and SHALL ignore all other contact sources for damage.

#### Scenario: Sheep is hit by goblin
- **WHEN** the sheep collider overlaps a goblin collider as a result of touch
- **THEN** sheep health is reduced by 100 and no other damage type is applied in the same frame

#### Scenario: Hero shoots sheep
- **WHEN** a hero arrow collider overlaps a sheep collider
- **THEN** sheep health is reduced by 100

#### Scenario: Hero shoots goblin
- **WHEN** a hero arrow collider overlaps a goblin collider
- **THEN** goblin health is reduced by 50

#### Scenario: Hero walks into goblin
- **WHEN** the hero collider overlaps the goblin collider while the hero is moving
- **THEN** goblin health is reduced by 25

#### Scenario: Goblin damages hero only during attack swing
- **WHEN** the goblin is in an active swing damage phase and its damage window overlaps the hero
- **THEN** hero health is reduced by 25

#### Scenario: Goblin touching hero outside attack swing
- **WHEN** the goblin overlaps the hero while not in an attack damage phase
- **THEN** the hero health does not change

### Requirement: Death animation triggers at zero health
When an entity health reaches 0 or below, the entity SHALL stop moving and SHALL run a 250ms in-place death animation.

#### Scenario: Entity dies from projectile
- **WHEN** hero arrow damage causes a target health to reach 0 or below
- **THEN** the target stops moving immediately and plays a 250ms death animation that scales from current scale to 0, fades opacity from 1 to 0, and rotates randomly by -20° or +20°

### Requirement: No health visibility
The health system SHALL NOT render any health bars or numeric health UI during gameplay.

#### Scenario: Health never shown
- **WHEN** gameplay is running and any entity takes damage
- **THEN** no health bar or health value appears in the game UI for that entity
