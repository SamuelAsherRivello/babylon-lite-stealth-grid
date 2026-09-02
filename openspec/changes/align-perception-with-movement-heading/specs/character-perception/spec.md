## MODIFIED Requirements

### Requirement: Visual Perception is a blocked cardinal line
Visual Perception SHALL begin at the detecting enemy's current grid location and extend four grid spaces in its current cardinal movement heading by default. When any enemy is walking left, up, right, or down, the first Visual Perception cell SHALL be respectively left, up, right, or down from the enemy. An unwalkable tile between detector and player SHALL prevent detection beyond that tile.

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

#### Scenario: Player enters a visible cell
- **WHEN** the living player occupies an unobstructed cell on the detector's Visual Perception line
- **THEN** the system reports a visual detection at that player grid spot

#### Scenario: Terrain blocks visual detection
- **WHEN** an unwalkable tile lies between the detector and player on the Visual Perception line
- **THEN** the player is not visually detected beyond the blocking tile
