## MODIFIED Requirements

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
- **WHEN** the goblin reaches its swing damage event and the living hero overlaps its committed directional damage area, including the cardinally adjacent cell
- **THEN** hero health is reduced by 25 exactly once for that swing

#### Scenario: Goblin touching hero outside attack swing
- **WHEN** the goblin overlaps the hero while not in an attack damage phase
- **THEN** the hero health does not change


### Requirement: Death animation triggers at zero health
When an entity health reaches 0 or below, the entity SHALL stop voluntary movement and SHALL run a 250ms death animation. Non-player entities SHALL animate in place. The player SHALL complete the lethal hit's collision-limited knockback during its death animation, without accepting further attacks or player input.

#### Scenario: Entity dies from projectile
- **WHEN** hero arrow damage causes a target health to reach 0 or below
- **THEN** the target stops moving immediately and plays a 250ms in-place death animation that scales from current scale to 0, fades opacity from 1 to 0, and rotates randomly by -20° or +20°

#### Scenario: Player dies from an enemy hit
- **WHEN** an enemy hit reduces player health to zero or below
- **THEN** the player receives that hit's knockback while shrinking, fading, and rotating for 250ms, and finishes forced travel before death completion

## ADDED Requirements

### Requirement: Enemy melee hits are counted per committed swing
Goblin, Warrior, and Lancer SHALL deal 25 damage to a living player once per successful committed swing at the attack damage event. The directional hit area SHALL include the attacker's cell and the immediately cardinally adjacent cell in its locked attack direction. The player's current combat collider SHALL overlap that area at impact. Body overlap SHALL NOT be required for an adjacent hit. Idle contact, recovery, misses, and Archer shooting SHALL NOT inflict melee damage. Each later accepted swing SHALL be eligible to hit again without requiring body separation.

#### Scenario: Four successful melee hits
- **WHEN** a 100-health player receives four successful swings
- **THEN** health progresses through 75, 50, 25, and 0 and defeat begins on the fourth hit

#### Scenario: Consecutive adjacent attacks
- **WHEN** any melee enemy attacks a player in its adjacent target cell across multiple swings without overlapping bodies
- **THEN** each successful swing deals exactly 25 damage once

#### Scenario: Repeated frames or multiple attackers
- **WHEN** one swing remains active across multiple updates while another enemy lands an independent swing
- **THEN** each swing contributes at most one 25-damage hit and no damage is accepted after death begins

#### Scenario: Player escapes the committed direction
- **WHEN** the player leaves the committed directional damage area before impact
- **THEN** the swing misses without retargeting or damaging the player

### Requirement: Enemy arrows can damage the player
A gameplay enemy Archer arrow SHALL participate in collision and SHALL deal 25 damage once when it hits the living player, then disappear immediately with its collider and never land. Collision SHALL follow the visible ballistic arrow throughout flight, including rise, descent, and the final pre-landing segment, without tunneling across a player during long frames. Player-owned arrows SHALL NOT damage the player. Existing damage and defense behavior for other targets SHALL remain unchanged.

#### Scenario: Four enemy arrows hit
- **WHEN** four enemy arrows successfully hit a player initially at 100 health
- **THEN** each arrow deals 25 damage and the fourth starts defeat

#### Scenario: Mixed attack sources
- **WHEN** two successful melee hits and two enemy arrow hits reach a player initially at 100 health
- **THEN** the fourth total hit starts defeat

#### Scenario: Own projectile or repeated arrow overlap
- **WHEN** a player-owned arrow overlaps the player or a consumed enemy arrow overlaps again
- **THEN** no player damage is applied


### Requirement: Every successful enemy hit applies ranked player knockback
Every successful enemy hit SHALL push the player in the hit direction over 200 ms of active gameplay time, including lethal hits. In unobstructed space an isolated Goblin hit SHALL move the player 0.25 grid cell, Archer 0.5, Warrior 0.75, and Lancer 1.0, using the configured grid dimensions. Melee SHALL push away from the attacker and arrows SHALL push along their travel direction. Blocking terrain, world bounds, and blocking actors SHALL limit travel without penetration. Missed, ignored, or duplicate hits SHALL produce no knockback. Voluntary input SHALL NOT cancel knockback. A later accepted hit SHALL replace unfinished knockback from the current player position.

#### Scenario: Ordered distances in open space
- **WHEN** each enemy type independently lands one hit on a stationary player with unobstructed travel
- **THEN** displacement is 0.25, 0.5, 0.75, and 1.0 grid cells for Goblin, Archer, Warrior, and Lancer respectively, within 5 percent of each target distance across supported frame rates

#### Scenario: Wall blocks the push
- **WHEN** the player's knockback path reaches blocking geometry before the intended distance
- **THEN** movement stops at the collision boundary without passing through the obstacle

#### Scenario: Another hit during knockback
- **WHEN** a second successful hit arrives before the first impulse finishes
- **THEN** it deals its damage and starts its own knockback from the current position, replacing remaining travel

#### Scenario: Lethal Lancer hit
- **WHEN** a Lancer hit is lethal and the path is unobstructed
- **THEN** the player travels approximately one full grid cell during the death animation before the loss prompt appears


### Requirement: Grounded arrows are harmless owner-only pickups
An Archer arrow that finishes its flight without a consumed hit SHALL stick in the ground. Only then SHALL its non-blocking pickup combat collider activate around the visible grounded arrow. Overlap with the living Archer who fired it SHALL immediately disable the pickup collider and play the existing bush sound exactly once. The arrow SHALL rise 50 pixels and fade over 0.18 active seconds using the gold pickup animation, then its sprite SHALL be removed. During that animation it SHALL have no further interactions. This SHALL be its only interaction after landing: it SHALL NOT damage, block, deflect, or react to the player, other Archers, other characters, or objects. Uncollected arrows SHALL persist until ordinary level cleanup with no timeout or capacity-based eviction; new shots SHALL remain possible when the initial sprite capacity is filled.

#### Scenario: Player is struck anywhere along flight
- **WHEN** an arrow crosses the living player's combat collider during ascent, descent, or the final segment of a long update before landing
- **THEN** the player takes one 25-damage hit and the arrow disappears immediately without leaving a grounded arrow

#### Scenario: Only the firing Archer collects a missed arrow
- **WHEN** the living firing Archer's combat collider overlaps its grounded arrow
- **THEN** the pickup collider disappears and the bush sound plays once in the same update, while the arrow sprite rises and fades like gold for 0.18 active seconds before removal

#### Scenario: Flying arrow is not a pickup
- **WHEN** the firing Archer overlaps its arrow before it has landed
- **THEN** no pickup occurs and no pickup sound plays

#### Scenario: Another entity overlaps a grounded arrow
- **WHEN** the player, another Archer, an NPC, another enemy, or an object overlaps a grounded arrow
- **THEN** the arrow remains with no damage, blocking, defense, pickup sound, or other interaction

#### Scenario: Grounded arrows outlast their owner and initial capacity
- **WHEN** an arrow remains uncollected, its owner dies, or later shots exceed the initial sprite capacity
- **THEN** the grounded arrow stays visible and harmless until ordinary level cleanup, and later shots can still be created
