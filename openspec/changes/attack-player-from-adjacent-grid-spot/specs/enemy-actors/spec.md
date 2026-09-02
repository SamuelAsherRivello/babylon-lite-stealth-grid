## ADDED Requirements

### Requirement: Combat enemies attack a cardinally adjacent player independently of awareness
Every living Goblin, Warrior, Lancer, and Archer SHALL accept its existing attack against the living player on the next active gameplay update when their authoritative GridSpots differ by exactly one column and zero rows, or zero columns and one row, and the enemy is eligible to start an attack. This rule SHALL apply in `NONE`, `SUSPICIOUS`, `INVESTIGATING`, and `ALERT`, without requiring a detection event, facing toward the player, or a visible player. The attack decision SHALL take priority over patrol, investigation, pursuit, blocked-navigation waiting, and selection of another target. Adjacency alone SHALL NOT change the perception state or grant ongoing knowledge of a non-adjacent player. As refined by C057, accepting an attack SHALL first center the enemy in its occupied GridSpot, then update heading toward the live player, and only then start the attack animation; an already centered enemy SHALL start on the same update.

#### Scenario: Four directions in every alert state
- **WHEN** an eligible Goblin, Warrior, Lancer, or Archer is one GridSpot above, below, left, or right of a living player in any of the four perception states
- **THEN** it begins attack preparation on the next active update, centers in its own GridSpot, stops locomotion, faces the live player, and then starts its existing attack

#### Scenario: Hidden player or player behind the enemy
- **WHEN** a living player is cardinally adjacent but undetected, hidden, or behind an eligible combat enemy
- **THEN** the enemy begins attack preparation without waiting for perception to escalate

#### Scenario: Navigation or alternate target is pending
- **WHEN** the player becomes cardinally adjacent while an eligible combat enemy is patrolling, investigating, pursuing, waiting for a route retry, or selecting a sheep or bush target
- **THEN** the player attack takes priority and obsolete movement does not resume during the attack

#### Scenario: Diagonal or non-adjacent player
- **WHEN** the player is diagonal, in the same GridSpot, or more than one cardinal step away
- **THEN** this adjacency rule does not start an attack and existing non-adjacent combat rules remain in effect

#### Scenario: Continuous motion within grid spots
- **WHEN** character positions move within their currently registered GridSpots
- **THEN** attack eligibility follows those GridSpots rather than artwork offsets or a separate pixel-distance threshold

### Requirement: Adjacency attacks preserve action lifecycle
Adjacency attacks SHALL respect existing protected actions, recovery, death, disposal, and pause. They SHALL NOT restart or retarget an active attack. After the existing attack and recovery complete, the enemy SHALL reevaluate the live player and SHALL attack again if cardinal adjacency still holds. A prior attack against that player SHALL NOT suppress later eligible attacks. Archer attacks SHALL keep their existing captured target, animation, one-arrow release, and recovery behavior. This change SHALL NOT introduce new damage amounts, hitboxes, or projectile collision rules.

#### Scenario: Player remains adjacent
- **WHEN** an attack and its existing recovery have finished and the living player is still cardinally adjacent
- **THEN** the enemy starts a new attack from a fresh eligibility check

#### Scenario: Player leaves or dies
- **WHEN** the player moves away or dies during an attack or recovery
- **THEN** the current attack retains its existing lifecycle and no subsequent adjacency attack starts from stale target information

#### Scenario: Protected action or paused game
- **WHEN** the enemy is already attacking, recovering, or otherwise action-locked, or gameplay is paused
- **THEN** adjacency does not restart the action or bypass the lock or pause

#### Scenario: Inactive actor
- **WHEN** the enemy is dead or disposed, or there is no living player
- **THEN** no adjacency attack starts

### Requirement: Monk remains non-combatant
The Monk SHALL patrol and respond to the four perception states through its existing navigation behavior. Player adjacency SHALL NOT trigger an attack or healing animation for the Monk.

#### Scenario: Adjacent Monk in every alert state
- **WHEN** a Monk is cardinally adjacent to the player in `NONE`, `SUSPICIOUS`, `INVESTIGATING`, or `ALERT`
- **THEN** it continues the applicable patrol or alert behavior without attacking or healing
