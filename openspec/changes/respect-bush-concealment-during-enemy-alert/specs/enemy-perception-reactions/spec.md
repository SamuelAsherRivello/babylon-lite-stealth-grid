## MODIFIED Requirements

### Requirement: Enemies preserve suspicion and last-known locations
An enemy SHALL maintain a suspicious cell, an alerted cell, and a last-known cell independently. While ALERT, renewed direct visual detection SHALL update the alerted and last-known cells. A visually confirmed ALERT enemy SHALL temporarily track the player's changing location inside bushes until the existing alert timer expires, without refreshing that timer or emitting new visual evidence from concealment. Other loss of direct detection SHALL freeze the last-known cell. After ALERT expires, the enemy SHALL retain the last tracked cell for investigation and SHALL NOT track hidden movement without new direct confirmation.

#### Scenario: Player hides after confirmation
- **WHEN** the player enters and moves inside bushes during an enemy's visually confirmed ALERT
- **THEN** the enemy follows the changing player cell and can attack within existing attack limits while its remaining alert timer decreases

#### Scenario: Hidden tracking expires
- **WHEN** the existing alert duration expires while the player remains hidden
- **THEN** the enemy enters INVESTIGATING, freezes its last tracked cell, and loses permission to target the hidden player

#### Scenario: Suspicious location is remembered
- **WHEN** an enemy becomes SUSPICIOUS
- **THEN** it stores and faces the suspicion location until suspicion expires or stronger evidence replaces it

#### Scenario: Exposed player is confirmed again
- **WHEN** the player leaves concealment and an enemy receives fresh alert-level visual evidence
- **THEN** normal confirmation updates the location and refreshes the configured alert duration

### Requirement: Perception reactions de-escalate and use configurable durations
Reaction durations SHALL be configurable per enemy profile. Without stronger evidence, an enemy SHALL de-escalate from ALERT to INVESTIGATING, then SUSPICIOUS, and finally NONE. Hidden tracking SHALL consume the remaining configured alert duration without extending it.

#### Scenario: Alert loses direct sight
- **WHEN** an alerted enemy loses direct visual perception
- **THEN** it retains its remaining alert duration, tracks hidden movement only under the visually confirmed bush exception, and otherwise freezes the last-known cell before entering investigation on expiry

#### Scenario: Investigation completes
- **WHEN** the enemy searches each configured facing direction for its configured duration without new evidence
- **THEN** it becomes SUSPICIOUS while retaining the remembered cell

#### Scenario: Suspicion expires
- **WHEN** the configurable suspicion duration expires without new evidence
- **THEN** the enemy becomes NONE and clears its perception marker
