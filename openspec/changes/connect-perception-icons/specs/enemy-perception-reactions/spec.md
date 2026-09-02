## MODIFIED Requirements

### Requirement: Enemies expose four escalating perception states
Each living enemy SHALL expose one of `NONE`, `SUSPICIOUS`, `INVESTIGATING`, or `ALERT` independently from its normal behavior and combat state. Its runtime overhead expression SHALL reflect that current perception state: `NONE` hides the expression, `SUSPICIOUS` shows the suspicious expression, `INVESTIGATING` shows the investigating expression, and `ALERT` shows the alert expression.

#### Scenario: No perception
- **WHEN** an enemy has no accepted detection
- **THEN** its perception state is `NONE`, its overhead perception expression is hidden, and its existing behavior continues normally

#### Scenario: Weak detection
- **WHEN** an enemy accepts a weak detection
- **THEN** its perception state becomes `SUSPICIOUS`, its suspicious overhead expression becomes visible, normal activity pauses, and it faces the detected grid cell

#### Scenario: Medium detection
- **WHEN** an enemy accepts a medium detection
- **THEN** its perception state becomes `INVESTIGATING`, its investigating overhead expression becomes visible, and it begins moving toward a bounded investigation destination based on the detected cell

#### Scenario: Strong detection
- **WHEN** an enemy accepts a strong detection
- **THEN** its perception state becomes `ALERT`, its alert overhead expression becomes visible, and it immediately pursues the player's currently detected grid cell

#### Scenario: Perception state changes
- **WHEN** an enemy transitions between two perception states
- **THEN** its overhead expression changes to the icon for the new state on the next rendered frame without requiring separate icon input

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
- **THEN** each enemy applies its own profile and may enter different perception states and display the corresponding overhead expressions

### Requirement: Perception markers show remembered locations
In Collider/debug mode, the perception view SHALL render a small X at the active enemy's alerted cell or, when no alerted cell exists, its last-known or suspicious cell. Runtime perception visuals are outside this capability.

#### Scenario: Confirmed marker
- **WHEN** an enemy is `ALERT`
- **THEN** the X is rendered at its alerted grid cell

#### Scenario: Suspicion marker
- **WHEN** an enemy is `SUSPICIOUS` or `INVESTIGATING` without a confirmed cell
- **THEN** the X is rendered at its suspicious grid cell

### Requirement: Perception reactions de-escalate and use configurable durations
Reaction durations SHALL be configurable per enemy profile. Without stronger evidence, an enemy SHALL de-escalate from `ALERT` to `INVESTIGATING`, then `SUSPICIOUS`, and finally `NONE`. Each de-escalation SHALL update the overhead expression to match the resulting state, including hiding it when the state becomes `NONE`.

#### Scenario: Alert loses direct sight
- **WHEN** an alerted enemy loses direct visual perception
- **THEN** it freezes the last-known cell and enters investigating search behavior with the investigating overhead expression visible

#### Scenario: Investigation completes
- **WHEN** the enemy searches each configured facing direction for its configured duration without new evidence
- **THEN** it becomes `SUSPICIOUS` while retaining the remembered cell and shows the suspicious overhead expression

#### Scenario: Suspicion expires
- **WHEN** the configurable suspicion duration expires without new evidence
- **THEN** the enemy becomes `NONE`, clears its perception marker, and hides its overhead expression

### Requirement: Player hiding is represented by a persistent overhead expression
While alive, the player SHALL be hidden when its combat collider overlaps at least one living bush combat collider. The player SHALL show a capital `H` using the existing overhead expression presentation while hidden, including its normal fade-in and fade-out lifecycle. The `H` SHALL remain visible while any living bush overlaps and SHALL clear when none do.

#### Scenario: Player enters a bush
- **WHEN** the player's combat collider begins overlapping a living bush combat collider
- **THEN** the player becomes hidden and the `H` expression fades in

#### Scenario: Player remains between bushes
- **WHEN** the player leaves one overlapping living bush while still overlapping another
- **THEN** the player remains hidden and the `H` expression remains active without flickering

#### Scenario: Player leaves all bushes
- **WHEN** the player's combat collider no longer overlaps any living bush combat collider
- **THEN** the player becomes unhidden and the `H` expression fades out

#### Scenario: Bush dies while overlapping
- **WHEN** an overlapping bush dies or is removed
- **THEN** it no longer contributes to hidden state, and the player becomes unhidden if no other living bush overlaps

### Requirement: Player hiding uses opacity without enemy reaction effects
On hidden entry, all player artwork layers SHALL animate from 100% to 80% opacity over the same duration used by enemy expression animation. While hidden, newly active player animation layers SHALL remain at 80% opacity. On hidden exit, all player artwork SHALL animate from 80% to 100% opacity over the same duration. Player hiding SHALL NOT trigger a white flash or jump.

#### Scenario: Hidden player changes animation
- **WHEN** the player changes to another animation while hidden
- **THEN** the newly visible player artwork remains at 80% opacity

#### Scenario: Hidden player is excluded from perception
- **WHEN** the player is hidden
- **THEN** the perception system produces neither audio nor visual detections for the player
