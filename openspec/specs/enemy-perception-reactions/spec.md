# enemy-perception-reactions Specification

## Purpose

Defines bounded, readable, and recoverable enemy reactions to centralized perception events in the grid-based stealth game.

## Requirements

### Requirement: Enemies expose four escalating perception states
Each living enemy SHALL expose one of `NONE`, `SUSPICIOUS`, `INVESTIGATING`, or `ALERT` independently from its normal behavior and combat state. Entry into any non-`NONE` perception state SHALL stop current locomotion before a fresh state-appropriate decision is executed.

#### Scenario: No perception
- **WHEN** an enemy has no accepted detection
- **THEN** its perception state is `NONE` and its existing behavior continues normally

#### Scenario: Weak detection
- **WHEN** an enemy accepts a weak detection
- **THEN** its perception state becomes `SUSPICIOUS`, current movement stops, normal activity pauses, and it faces the detected grid cell

#### Scenario: Medium detection
- **WHEN** an enemy accepts a medium detection
- **THEN** its perception state becomes `INVESTIGATING`, it stops, and it freshly selects a bounded investigation destination based on the detected cell before starting movement

#### Scenario: Strong detection
- **WHEN** an enemy accepts a strong detection
- **THEN** its perception state immediately becomes `ALERT`, it stops, and it freshly selects pursuit of the player's currently detected grid cell before starting movement

### Requirement: Enemies preserve suspicion and last-known locations
An enemy SHALL maintain a suspicious cell, an alerted cell, and a last-known cell independently. While `ALERT`, a renewed direct visual detection SHALL update the alerted and last-known cells. When direct alert ends, the enemy SHALL retain the last-known cell and SHALL NOT track the player's current location without a new direct detection.

#### Scenario: Player hides after confirmation
- **WHEN** the player leaves direct perception while an enemy is `ALERT`
- **THEN** the enemy freezes the last confirmed cell and transitions to investigation or searching

#### Scenario: Suspicious location is remembered
- **WHEN** an enemy becomes `SUSPICIOUS`
- **THEN** it stores the detection cell as its suspicious location until the suspicion expires or stronger evidence replaces it

### Requirement: Investigation and searching are time-bounded
An investigating or searching enemy SHALL pause unrelated behavior, use its remembered grid location to choose movement and inspection cells, and return to its prior or patrol behavior when its configured reaction timer expires without stronger evidence.

#### Scenario: Investigation destination selection
- **WHEN** an enemy enters `INVESTIGATING`
- **THEN** it selects a valid one-cell, two-cell, or full-distance destination toward the suspicious location according to its reaction profile

#### Scenario: Search recovery
- **WHEN** an enemy completes its search timer without confirming the player
- **THEN** it returns to normal patrol or guard behavior and clears expired perception memory

### Requirement: Enemy reaction limits are profile-driven
Each enemy type SHALL have a reaction profile defining detection thresholds, timers, whether audio may confirm the player, investigation movement, and confirmation duration.

#### Scenario: Different enemy limits
- **WHEN** two enemy types receive the same detection event
- **THEN** each enemy applies its own profile and may enter different perception states

### Requirement: Perception markers show remembered locations
In Collider/debug mode, the perception view SHALL render a small X at the active enemy's alerted cell or, when no alerted cell exists, its last-known or suspicious cell. Runtime perception visuals are outside this capability.

#### Scenario: Confirmed marker
- **WHEN** an enemy is `ALERT`
- **THEN** the X is rendered at its alerted grid cell

#### Scenario: Suspicion marker
- **WHEN** an enemy is `SUSPICIOUS` or `INVESTIGATING` without a confirmed cell
- **THEN** the X is rendered at its suspicious grid cell

### Requirement: Perception reactions de-escalate and use configurable durations
Reaction durations SHALL be configurable per enemy profile. Without stronger evidence, an enemy SHALL de-escalate from `ALERT` to `INVESTIGATING`, then `SUSPICIOUS`, and finally `NONE`.

#### Scenario: Alert loses direct sight
- **WHEN** an alerted enemy loses direct visual perception
- **THEN** it freezes the last-known cell and enters investigating search behavior

#### Scenario: Investigation completes
- **WHEN** the enemy searches each configured facing direction for its configured duration without new evidence
- **THEN** it becomes `SUSPICIOUS` while retaining the remembered cell

#### Scenario: Suspicion expires
- **WHEN** the configurable suspicion duration expires without new evidence
- **THEN** the enemy becomes `NONE` and clears its perception marker

### Requirement: Awareness entry interrupts obsolete movement for every enemy
Every living enemy SHALL interrupt its previous walking action on a transition into `SUSPICIOUS`, `INVESTIGATING`, or `ALERT`, including transitions between those states. It SHALL remain stationary for at least the next eligible active locomotion update, with walking presentation stopped, before executing freshly selected movement. Old routes, destinations, and retry decisions SHALL NOT resume or override the new reaction. This entry interruption SHALL NOT add a timed stun or change the configured awareness durations.

#### Scenario: Walking enemy notices a source elsewhere
- **WHEN** a walking enemy enters any non-`NONE` perception state with a detected location outside its old walking direction
- **THEN** it stops at its current world position without finishing its old segment or snapping to a grid center, and subsequent movement follows a fresh decision for the new state

#### Scenario: Escalation and de-escalation
- **WHEN** an enemy escalates or de-escalates into a different non-`NONE` perception state
- **THEN** the same interruption occurs before the new state's behavior executes

#### Scenario: All enemy movement policies
- **WHEN** any supported enemy type enters a non-`NONE` perception state during patrol, specialized movement, or blocked-route waiting
- **THEN** its old movement and retry work cannot overwrite the fresh reaction

#### Scenario: Fresh decision legitimately retains direction
- **WHEN** the new state's target warrants the same direction as the old movement
- **THEN** the enemy still stops first and only resumes that direction as the result of the fresh decision

### Requirement: Awareness owns reaction locomotion without repeated freezes
While awareness is non-`NONE`, unrelated normal behavior SHALL NOT overwrite reaction locomotion. Repeated detections that leave the state unchanged SHALL preserve existing evidence and timer-refresh rules without restarting the entry interruption. Fresh reaction decisions SHALL respect movement locks, collision, occupancy, and known-location rules. Returning to `NONE` SHALL release reaction ownership and permit a fresh normal behavior decision without restoring obsolete movement.

#### Scenario: Continuous confirmed sight
- **WHEN** an `ALERT` enemy repeatedly sees the player while staying `ALERT`
- **THEN** its confirmed location and timer refresh normally and pursuit is not repeatedly frozen by entry handling

#### Scenario: Weaker evidence
- **WHEN** an enemy receives evidence weaker than its active perception state
- **THEN** that evidence neither downgrades the state nor restarts the entry interruption

#### Scenario: Attack lock or death
- **WHEN** an awareness transition occurs during a movement-locked action, or the enemy dies before pending reaction movement executes
- **THEN** the transition does not cancel the protected action or bypass its movement lock, and death prevents pending reaction movement from executing

#### Scenario: Blocked reaction destination
- **WHEN** a fresh reaction decision cannot safely move toward its target
- **THEN** the enemy uses the existing bounded recovery policy or remains stopped rather than continuing its obsolete route or bypassing collision

#### Scenario: Return to ordinary behavior
- **WHEN** awareness expires to `NONE`
- **THEN** a fresh normal behavior decision can run and no pre-alert route is silently restored
