## MODIFIED Requirements

### Requirement: Visual Perception is a blocked cardinal line
Visual Perception SHALL begin at the detecting enemy's current grid location and extend four grid spaces in its current cardinal movement heading by default. When any enemy is walking left, up, right, or down, the first Visual Perception cell SHALL be respectively left, up, right, or down from the enemy. An unwalkable tile, bush, or living enemy in the player's exact visual cell SHALL negate detection of that one spot. An unwalkable tile, bush, or living enemy in an earlier cell between detector and player SHALL block detection in that cell and every cell beyond it. A player SHALL NOT be visually detected when sharing a blocking cell with the blocker.

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

#### Scenario: Walking left controls visual perception
- **WHEN** the detector is walking left
- **THEN** its Visual Perception line extends left from its current grid cell

#### Scenario: Walking up controls visual perception
- **WHEN** the detector is walking up
- **THEN** its Visual Perception line extends up from its current grid cell

#### Scenario: Walking right controls visual perception
- **WHEN** the detector is walking right
- **THEN** its Visual Perception line extends right from its current grid cell

#### Scenario: Walking down controls visual perception
- **WHEN** the detector is walking down
- **THEN** its Visual Perception line extends down from its current grid cell



### Requirement: Audio Perception is a filtered 9-grid radius
Audio Perception SHALL include the eight cells surrounding the detector's current grid location by default, regardless of facing and intervening terrain. A living enemy occupying an audio cell SHALL block audio detection for that cell, including a player occupying the same cell. Bushes SHALL NOT obstruct audio propagation, but a player hidden by overlap with a living bush SHALL produce no audio or visual detection. Hidden-player filtering SHALL take precedence over all channel geometry and occupancy checks.

#### Scenario: Player enters audio radius
- **WHEN** the player is not hidden and occupies any unoccupied one-cell neighboring position
- **THEN** the system reports an audio detection at that grid spot

#### Scenario: Audio crosses terrain
- **WHEN** an unwalkable tile lies between the detector and a player inside the default audio radius
- **THEN** the player remains audio-detectable only if the player is not hidden and the player's audio cell is not occupied by a living enemy

#### Scenario: Player hiding in a bush is inaudible
- **WHEN** the player is hidden by overlap with a living bush while inside an enemy's audio radius
- **THEN** the system reports no audio or visual detection for the player

#### Scenario: Living enemy blocks an audio spot
- **WHEN** a living enemy occupies a neighboring audio cell
- **THEN** the system reports no audio detection for that cell, including when the player shares it


## ADDED Requirements

### Requirement: Bushes do not block enemy movement
Bushes SHALL remain non-blocking to enemy movement, and an enemy SHALL be allowed to enter and leave a bush cell without movement collision from the bush.

#### Scenario: Enemy walks through a bush
- **WHEN** an enemy moves into, through, or out of a bush cell
- **THEN** the bush does not prevent the enemy's movement

### Requirement: Hidden players are excluded from both perception channels
A living player whose combat collider overlaps at least one living bush combat collider SHALL be hidden and SHALL be excluded from both audio and visual detection. Hidden status SHALL clear when no living bush overlaps, after which ordinary channel range and blocker rules SHALL apply.

#### Scenario: Hidden player is inside both sensing regions
- **WHEN** a player hidden in a living bush lies within an enemy's audio radius and visual range
- **THEN** neither channel reports a new detection for that player

#### Scenario: Player leaves hiding
- **WHEN** the player no longer overlaps any living bush
- **THEN** audio and visual detection resume according to their range and blocker rules

## RENAMED Requirements

- FROM: `### Requirement: Audio Perception is an unblocked 9-grid radius`
- TO: `### Requirement: Audio Perception is a filtered 9-grid radius`
