## ADDED Requirements

### Requirement: Enemy player attacks prepare at the center of their own grid space
Every living Goblin, Warrior, Lancer, and Archer choosing to attack the player SHALL first move its authoritative world center to the exact center of the GridSpot it occupies at that decision. It SHALL then stop movement, update heading toward the player's current position, and only then initiate its existing attack. This sequence SHALL apply to both adjacent-player and existing non-adjacent player attack decisions. For C056 adjacency decisions, the next active update SHALL begin this preparation; attack animation initiation SHALL wait for preparation to finish. An already centered enemy SHALL face and attack without an artificial waiting period. Monk behavior and attacks targeting sheep or bushes SHALL remain unchanged.

#### Scenario: Off-center enemy chooses an attack
- **WHEN** any combat enemy chooses an eligible player attack while off-center in its occupied GridSpot
- **THEN** it moves to that GridSpot's center before facing the player and starting its attack
- **AND** no attack animation, attack sound, damage event, or projectile starts during preparation

#### Scenario: Already centered enemy
- **WHEN** an eligible enemy chooses a player attack while exactly centered
- **THEN** it stops locomotion, updates heading toward the player, and starts the attack in that order on the same active update

#### Scenario: Player moves during preparation
- **WHEN** the player moves while the enemy is centering and remains eligible when centering finishes
- **THEN** the enemy faces the player's latest position before starting the attack
- **AND** its existing target-locking rules apply after attack initiation

### Requirement: Attack centering uses normal world movement
Preparation SHALL use continuous, collision-aware movement at the enemy's normal movement speed and respect existing axis movement rules. The destination SHALL be the captured occupied GridSpot center using configured grid dimensions, rather than a patrol destination or the player's cell. The enemy SHALL arrive at the exact center without overshoot or oscillation. Preparation SHALL take locomotion priority over patrol, pursuit, investigation, and awareness-facing actions. Ordinary movement heading during centering SHALL remain permitted; the final heading update toward the player SHALL occur only after arrival.

#### Scenario: Decision during a patrol step
- **WHEN** an attack is chosen partway through movement toward another cell
- **THEN** the enemy centers in the cell occupied at the decision and obsolete navigation cannot replace its centering destination

#### Scenario: Configurable grid and frame duration
- **WHEN** centering runs with a different supported grid size or a frame step longer than the remaining travel distance
- **THEN** arrival is clamped to the configured cell center through collision-aware movement and the enemy does not attack from an offset position

### Requirement: Preparation respects eligibility and interruptions
The enemy SHALL revalidate the living player and the initiating attack rule before starting the attack. If eligibility is lost, preparation SHALL cancel without an attack and normal decisions SHALL resume. Death, disposal, or movement-locking displacement SHALL cancel preparation; paused gameplay SHALL freeze it. A blocked or stalled centering movement SHALL use existing bounded recovery rather than teleporting, attacking off-center, or retrying in an unbounded update loop. Repeated decisions SHALL NOT duplicate preparations, attacks, or recovery updates. Existing committed attacks and their cooldowns SHALL remain protected.

#### Scenario: Player becomes ineligible
- **WHEN** the player dies or no longer satisfies the initiating attack rule before attack initiation
- **THEN** no attack starts from the stored decision and the enemy resumes normal decision-making

#### Scenario: Centering is obstructed
- **WHEN** terrain or an actor prevents reaching the captured center
- **THEN** no attack begins and bounded movement recovery handles the obstruction without passing through it

#### Scenario: Pause or interruption
- **WHEN** gameplay pauses during preparation
- **THEN** preparation does not advance until gameplay resumes
- **AND** death, disposal, or movement-locking displacement cancels the pending attack

#### Scenario: Repeated decisions and existing attack lifecycle
- **WHEN** multiple attack triggers occur during preparation or an attack and its recovery
- **THEN** only one preparation and one committed attack are accepted, with the existing animation, damage, projectile release, and recovery lifecycle preserved
