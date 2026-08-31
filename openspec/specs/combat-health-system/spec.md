# combat-health-system Specification

## Purpose
Provides a shared health and defeat model so player, sheep, and goblin entities can
receive damage from defined combat interactions and transition into a consistent
death animation when health reaches zero.

## Requirements

### Requirement: Entities start with health
Each player, sheep, and goblin entity SHALL start with exactly 100 health points and SHALL track current health internally during gameplay.

#### Scenario: Initial health state
- **WHEN** gameplay starts
- **THEN** the hero, sheep, and enemy each have 100 current health points

### Requirement: Damage is applied only by defined sources and amounts
The system SHALL apply damage only through the defined interaction matrix and
SHALL ignore all other contact sources for damage. An arrow approaching from
the direction the Warrior is already facing SHALL always trigger defense and
deal no damage. An arrow approaching from behind SHALL never trigger defense
and SHALL reduce Warrior health by 50. An upward-moving arrow SHALL be defended
only when its 50% defense attempt succeeds. A downward-moving arrow SHALL never
be defended and SHALL reduce Warrior health by 50.

#### Scenario: Sheep is hit by goblin
- **WHEN** the sheep collider overlaps a goblin collider as a result of touch
- **THEN** sheep health is reduced by 100 and no other damage type is applied in the same frame

#### Scenario: Hero shoots sheep
- **WHEN** a hero arrow collider overlaps a sheep collider
- **THEN** sheep health is reduced by 100

#### Scenario: Hero shoots goblin
- **WHEN** a hero arrow collider overlaps a goblin collider
- **THEN** goblin health is reduced by 50

#### Scenario: Hero shoots undefended Warrior
- **WHEN** a hero arrow approaches from behind and overlaps the Warrior
- **THEN** Warrior health is reduced by 50 and the normal arrow-hit lifecycle applies

#### Scenario: Hero shoots defending Warrior
- **WHEN** a hero arrow approaches from the direction the Warrior is facing and overlaps the Warrior
- **THEN** Warrior health does not change and the arrow enters its deflected lifecycle

#### Scenario: Upward arrow hits Warrior
- **WHEN** an upward-moving hero arrow overlaps the Warrior after its 50% defense attempt
- **THEN** it is deflected for no damage on success or reduces Warrior health by 50 on failure

#### Scenario: Downward arrow hits Warrior
- **WHEN** a downward-moving hero arrow overlaps the Warrior
- **THEN** Warrior health is reduced by 50 and the normal arrow-hit lifecycle applies

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

### Requirement: Bushes participate in shared health without visible UI
Each bush SHALL start with exactly 100 health, accept damage only while living, and expose no health bar or numeric health value during gameplay.

#### Scenario: Bush starts undamaged
- **WHEN** a bush placement becomes active in gameplay
- **THEN** it has 100 current health and no visible health UI

#### Scenario: Non-goblin contact reaches a bush
- **WHEN** character movement, a projectile, or another undefined source overlaps a bush
- **THEN** the bush takes no damage

### Requirement: Goblin fire swings deal 50 bush damage once per swing
A successful goblin fire swing SHALL reduce the targeted living bush's health by exactly 50 once, regardless of how many update frames its colliders remain overlapping. A swing SHALL be successful only when the goblin movement-collider center cell and bush combat-collider center cell are exactly one cardinal cell apart at attack commitment. An undamaged bush SHALL therefore require two successful swings to reach zero health.

#### Scenario: First fire swing lands
- **WHEN** a goblin's committed bush swing reaches its damage event against a 100-health bush
- **THEN** the bush has 50 health and starts one Fire 3 cycle

#### Scenario: Second fire swing lands
- **WHEN** a later committed bush swing reaches its damage event against the same 50-health bush
- **THEN** the bush reaches zero health and starts its second Fire 3 cycle

#### Scenario: Swing remains overlapped
- **WHEN** one goblin swing overlaps the bush combat collider across multiple update frames
- **THEN** only one 50-damage event and one Fire 3 cycle are recorded for that swing

#### Scenario: Hit geometry overlaps without cardinal adjacency
- **WHEN** projected attack geometry overlaps a bush but the authoritative collider-center cells are not exactly one cardinal cell apart
- **THEN** no bush attack is committed and the bush takes no damage

### Requirement: Lethal bush damage waits for the second fire cycle before visual death
When a bush reaches zero health from its second fire swing, it SHALL immediately stop accepting damage and cease being a living AI target, but SHALL remain visibly in place until that swing's complete Fire 3 cycle ends. It SHALL then run the shared 250 ms in-place death animation, shrinking to zero, fading from opaque to transparent, and rotating randomly by -20 degrees or +20 degrees before removal.

#### Scenario: Second fire cycle is playing
- **WHEN** a bush has reached zero health and its second Fire 3 cycle has not completed
- **THEN** the bush remains visible but is not attackable, targetable, or damageable

#### Scenario: Second fire cycle completes
- **WHEN** the zero-health bush's second Fire 3 cycle reaches its final frame
- **THEN** the bush begins the shared 250 ms spin, fade, and shrink death animation

#### Scenario: Death animation completes
- **WHEN** the bush's death animation reaches zero scale and opacity
- **THEN** the bush and its gameplay fire-effect resources are removed from active rendering and updates
