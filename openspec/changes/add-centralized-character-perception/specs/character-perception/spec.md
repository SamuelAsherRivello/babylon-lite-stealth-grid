## Purpose

Provides one centralized, grid-based sensory system that lets enemy characters detect the player through distinct Visual and Audio Perception channels and respond with strength-appropriate alert behavior.

## ADDED Requirements

### Requirement: Characters register with centralized perception
The Character Perception system SHALL allow living player and enemy characters to register with a stable identity, current grid location, facing direction, and perception profile. The player SHALL register on spawn and deregister on death.

#### Scenario: Player lifecycle registration
- **WHEN** the player spawns
- **THEN** the player is available as a detectable source

#### Scenario: Dead player deregistration
- **WHEN** the player dies
- **THEN** the player is removed as a detectable source

### Requirement: Visual Perception is a blocked cardinal line
Visual Perception SHALL begin at the detecting character's current grid location and extend four grid spaces in its cardinal facing direction by default. An unwalkable tile between detector and player SHALL prevent detection beyond that tile.

#### Scenario: Player enters a visible cell
- **WHEN** the living player occupies an unobstructed cell on the detector's Visual Perception line
- **THEN** the system reports a visual detection at that player grid spot

#### Scenario: Terrain blocks visual detection
- **WHEN** an unwalkable tile lies between the detector and player on the Visual Perception line
- **THEN** the player is not visually detected beyond the blocking tile

### Requirement: Visual strength decreases by grid distance
Visual detection strength SHALL be 100% at distance one, 75% at distance two, 50% at distance three, and 25% at distance four for the default range.

#### Scenario: Near visual detection
- **WHEN** the player occupies the first Visual Perception cell
- **THEN** the system reports visual strength 100%

#### Scenario: Distant visual detection
- **WHEN** the player occupies the fourth Visual Perception cell
- **THEN** the system reports visual strength 25%

### Requirement: Audio Perception is an unblocked 9-grid radius
Audio Perception SHALL include the eight cells surrounding the detector's current grid location by default, regardless of facing or intervening unwalkable tiles.

#### Scenario: Player enters audio radius
- **WHEN** the player occupies any of the eight surrounding cells
- **THEN** the system reports an audio detection at that grid spot

#### Scenario: Audio crosses terrain
- **WHEN** an unwalkable tile lies between the detector and a player inside the default audio radius
- **THEN** the player remains audio-detectable

### Requirement: Detection reports identify channel, strength, and location
The system SHALL report each applicable detection with `visual` or `audio` type, a detection strength, and the detected grid spot, without requiring the receiving character to know source identity or trigger metadata.

#### Scenario: Multiple channels detect the player
- **WHEN** the player occupies a cell included by both perceptions
- **THEN** the system reports both channel detections for that grid spot

### Requirement: Enemy alert handling consumes the first trigger
An alerted enemy SHALL react to the first accepted detection event, ignore subsequent reactions until its alert handling and cooldown complete, and then return to its prior behavior and accept new events.

#### Scenario: Full-strength alert
- **WHEN** the first accepted detection has strength 100%
- **THEN** the enemy immediately walks toward the reported grid spot

#### Scenario: Half-strength alert
- **WHEN** the first accepted detection has strength 50%
- **THEN** the enemy has a 75% chance to walk toward the reported grid spot and a 25% chance to do nothing

#### Scenario: Weak alert
- **WHEN** the first accepted detection has strength 25%
- **THEN** the enemy stops and faces the reported grid spot for a configured duration without walking there

#### Scenario: Alert recovery
- **WHEN** the configured alert and cooldown period completes
- **THEN** the enemy returns to `NOT ALERTED`, resumes its previous behavior, and becomes receptive to new detection events
