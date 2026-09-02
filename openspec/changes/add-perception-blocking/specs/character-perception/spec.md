## MODIFIED Requirements

### Requirement: Visual Perception is a blocked cardinal line
Visual Perception SHALL begin at the detecting character's current grid location and extend four grid spaces in its cardinal facing direction by default. An unwalkable tile, bush, or living enemy in the player's exact visual cell SHALL negate detection of that one spot. An unwalkable tile, bush, or living enemy in an earlier cell between detector and player SHALL block detection in that cell and every cell beyond it. A player SHALL NOT be visually detected when sharing a blocking cell with the blocker.

#### Scenario: Player enters a visible cell
- **WHEN** the living player occupies an unobstructed cell on the detector's Visual Perception line
- **THEN** the system reports a visual detection at that player grid spot

#### Scenario: Terrain blocks visual detection
- **WHEN** an unwalkable tile lies between the detector and player on the Visual Perception line
- **THEN** the player is not visually detected beyond the blocking tile

#### Scenario: Terrain negates the target visual spot
- **WHEN** the player's exact Visual Perception cell is unwalkable
- **THEN** the player is not visually detected in that one spot

#### Scenario: Bush blocks the visual line
- **WHEN** a bush occupies a cell on the detector's Visual Perception line before the player
- **THEN** the player is not visually detected in that cell or any later cell on the same line

#### Scenario: Enemy blocks the visual line
- **WHEN** an enemy occupies a cell on the detector's Visual Perception line before the player
- **THEN** the player is not visually detected in that cell or any later cell on the same line

#### Scenario: Blocker negates its own visual spot
- **WHEN** a bush or living enemy occupies the player's exact Visual Perception cell
- **THEN** the player is not visually detected in that one spot

#### Scenario: Detector inside a bush retains visual perception
- **WHEN** the detector and a bush occupy the same cell and the player occupies a clear cell in the detector's facing direction
- **THEN** the bush does not block the detector's own visual ray and the player is visually detected normally

### Requirement: Bushes do not block enemy movement
Bushes SHALL remain non-blocking to enemy movement, and an enemy SHALL be allowed to enter and leave a bush cell without movement collision from the bush.

#### Scenario: Enemy walks through a bush
- **WHEN** an enemy moves into, through, or out of a bush cell
- **THEN** the bush does not prevent the enemy's movement

### Requirement: Audio Perception is an enemy-negated 9-grid radius
Audio Perception SHALL include the eight cells surrounding the detector's current grid location by default, regardless of facing and intervening terrain. A living enemy occupying an audio cell SHALL block audio detection for that cell, including a player occupying the same cell. A bush occupying an audio cell SHALL NOT block audio detection.

#### Scenario: Player enters an unoccupied audio radius cell
- **WHEN** the player occupies any unoccupied one-cell neighboring position
- **THEN** the system reports an audio detection at that grid spot

#### Scenario: Audio crosses terrain
- **WHEN** an unwalkable tile lies between the detector and a player inside the default audio radius
- **THEN** the player remains audio-detectable unless the player's audio cell is occupied by a living enemy

#### Scenario: Bush does not block an audio spot
- **WHEN** a bush occupies a neighboring audio cell without a living enemy
- **THEN** the system reports an audio detection when the player occupies that cell

#### Scenario: Living enemy blocks an audio spot
- **WHEN** a living enemy occupies a neighboring audio cell
- **THEN** the system reports no audio detection for that cell, including when the player shares it
