## MODIFIED Requirements

### Requirement: Non-blocking character sensor
Each reactive bush SHALL expose a sensor around the lower central foliage footprint. The sensor SHALL detect supported player, NPC, and enemy movement colliders without acting as a movement obstacle or projectile obstacle. A character's combat collider SHALL NOT participate in bush sensing.

#### Scenario: Character crosses the sensor
- **WHEN** any living supported character movement collider changes from outside to overlapping an armed bush sensor
- **THEN** the bush receives one character-entry activation and the character's movement is not blocked

#### Scenario: Combat collider crosses without the movement collider
- **WHEN** a supported character's combat collider overlaps the bush sensor while its movement collider remains outside
- **THEN** the overlap does not activate the bush

#### Scenario: Non-character crosses the sensor
- **WHEN** a projectile or an unclassified collider overlaps the bush sensor
- **THEN** the overlap does not activate the bush and does not block the overlapping object

### Requirement: Occupancy-based rearming
A triggered bush SHALL remain disarmed until its sensor contains no supported character movement colliders. Leaving the sensor SHALL not interrupt current playback. Once empty, the bush SHALL rearm, but it SHALL not start another animation until a later outside-to-inside movement-collider transition.

#### Scenario: Character remains inside after playback
- **WHEN** the one-shot animation completes while one or more supported character movement colliders still overlap the sensor
- **THEN** the bush returns to frame zero and remains disarmed

#### Scenario: Sensor becomes empty and is entered again
- **WHEN** all supported character movement colliders leave a triggered bush sensor and a supported character later enters it
- **THEN** the rearmed bush plays one new one-shot sequence

