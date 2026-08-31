## ADDED Requirements

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
