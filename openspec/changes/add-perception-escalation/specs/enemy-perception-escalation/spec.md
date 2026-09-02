## Purpose

Defines how stronger player detections raise an enemy's active awareness level, including direct jumps to alert, while keeping reaction state bounded and readable.

## ADDED Requirements

### Requirement: Stronger evidence escalates active perception
An enemy SHALL compare each accepted detection's reaction severity with its current perception state and SHALL transition upward when the detection is more severe. A detection at the current or lower severity SHALL NOT downgrade the enemy or restart a stronger reaction as a weaker reaction.

#### Scenario: Suspicion escalates to investigation
- **WHEN** an enemy is `SUSPICIOUS` and receives an accepted investigation-level detection
- **THEN** it becomes `INVESTIGATING`, adopts the detected location as the active investigation target, and starts the full configured investigation timer

#### Scenario: Suspicion jumps directly to alert
- **WHEN** an enemy is `SUSPICIOUS` and receives an accepted alert-level direct detection
- **THEN** it immediately becomes `ALERT`, adopts the detected player cell, and begins alert behavior without passing through `INVESTIGATING`

#### Scenario: Investigation escalates to alert
- **WHEN** an enemy is `INVESTIGATING` and receives an accepted alert-level direct detection
- **THEN** it immediately becomes `ALERT`, adopts the detected player cell, and starts the full configured alert timer

#### Scenario: Weaker evidence does not de-escalate
- **WHEN** an enemy is `ALERT` or `INVESTIGATING` and receives a detection no stronger than its current state
- **THEN** it remains at its current state and does not transition downward because of that detection

### Requirement: Escalation refreshes only relevant reaction memory
When a detection escalates an enemy, the enemy SHALL retain the newly detected cell as the location appropriate to the new state, SHALL invalidate stale lower-state expiry timing, and SHALL start the destination state with its full configured timer while remaining eligible for normal de-escalation after direct evidence is lost.

#### Scenario: Alert refreshes confirmed location
- **WHEN** an alerted enemy receives a renewed direct visual detection at a different player cell
- **THEN** its alerted and last-known cells update to the new cell while its state remains `ALERT`

#### Scenario: Escalated state survives stale timer expiry
- **WHEN** an enemy escalates before its prior suspicion or investigation timer expires
- **THEN** expiry of the prior timer does not immediately return it to a lower state
