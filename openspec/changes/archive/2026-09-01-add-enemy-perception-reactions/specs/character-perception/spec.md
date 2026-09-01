## MODIFIED Requirements

### Requirement: Enemy alert handling consumes the first trigger
An enemy SHALL react to accepted detection events according to its reaction profile, ignore weaker subsequent reactions while a stronger reaction is active, update its alerted and last-known cells when directly detected again while `ALERT`, and de-escalate through `INVESTIGATING` and `SUSPICIOUS` after direct perception is lost.

#### Scenario: Full-strength alert
- **WHEN** the first accepted detection has strength 100%
- **THEN** the enemy immediately enters its alerted reaction and pursues the reported grid spot

#### Scenario: Half-strength alert
- **WHEN** the first accepted detection has strength 50%
- **THEN** the enemy applies its profile's investigation probability and may move toward the reported grid spot or investigate without walking there

#### Scenario: Weak alert
- **WHEN** the first accepted detection has strength 25%
- **THEN** the enemy enters suspicion, stops normal activity, and faces the reported grid spot for a configured duration without walking there

#### Scenario: Alert recovery
- **WHEN** the configured reaction and cooldown period completes
- **THEN** the enemy leaves its active perception reaction after de-escalating through investigation and suspicion, resumes its prior behavior, and becomes receptive to new detection events
