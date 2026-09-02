## MODIFIED Requirements

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

## ADDED Requirements

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
