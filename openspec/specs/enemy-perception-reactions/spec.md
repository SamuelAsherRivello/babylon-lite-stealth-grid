# enemy-perception-reactions Specification

## Purpose

Defines bounded, readable, and recoverable enemy reactions to centralized perception events in the grid-based stealth game.

## Requirements

### Requirement: Enemies expose four escalating perception states
Each living enemy SHALL expose one of `NONE`, `SUSPICIOUS`, `INVESTIGATING`, or `ALERT` independently from its normal behavior and combat state.

#### Scenario: No perception
- **WHEN** an enemy has no accepted detection
- **THEN** its perception state is `NONE` and its existing behavior continues normally

#### Scenario: Weak detection
- **WHEN** an enemy accepts a weak detection
- **THEN** its perception state becomes `SUSPICIOUS`, normal activity pauses, and it faces the detected grid cell

#### Scenario: Medium detection
- **WHEN** an enemy accepts a medium detection
- **THEN** its perception state becomes `INVESTIGATING` and it begins moving toward a bounded investigation destination based on the detected cell

#### Scenario: Strong detection
- **WHEN** an enemy accepts a strong detection
- **THEN** its perception state becomes `ALERT` and it immediately pursues the player's currently detected grid cell

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
