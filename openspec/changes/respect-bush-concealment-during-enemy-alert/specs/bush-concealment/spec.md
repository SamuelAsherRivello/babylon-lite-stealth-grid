## Purpose

Define how an occupied bush protects the player from enemy targeting and traversal while permitting bounded tracking by a visually alerted enemy.

## ADDED Requirements

### Requirement: Concealment is evaluated independently for each enemy
A living player overlapping a living hiding bush SHALL be unavailable for new enemy attacks unless that enemy has an unexpired visually confirmed ALERT. NONE, SUSPICIOUS, and INVESTIGATING enemies SHALL NOT detect or target the hidden player. An enemy without its own confirmation SHALL NOT inherit another enemy's tracking permission.

#### Scenario: Unnoticed player hides next to enemies
- **WHEN** a hidden player is adjacent to a non-alerted goblin, warrior, lancer, or archer
- **THEN** no player attack starts, including through specialized combat paths

#### Scenario: Different enemies have different knowledge
- **WHEN** only one of two enemies visually confirmed the player before they hid
- **THEN** only that enemy can track and attack the hidden player during its remaining ALERT period

### Requirement: Occupied bushes block unaware enemy movement
A non-alerted enemy SHALL NOT enter or traverse a living bush overlapping the living player, including when the bush and player have different logical cells during movement. This restriction SHALL apply to planned navigation and physical movement. Empty and dead bushes SHALL NOT gain movement blocking from this rule. Alerted tracking SHALL NOT bypass ordinary player, character, or terrain collision.

#### Scenario: Player occupies the edge of a bush
- **WHEN** the player overlaps a bush while their logical cell is adjacent to the bush cell
- **THEN** a non-alerted enemy cannot enter the occupied bush cell or cross its area

#### Scenario: Player leaves the bush
- **WHEN** the living bush no longer overlaps the player
- **THEN** its concealment movement restriction is removed

### Requirement: Attack eligibility is checked until commitment
Enemy attacks SHALL check concealment both when requested and while centering for attack preparation. Loss of tracking permission SHALL cancel an uncommitted attack. Already committed swings and released projectiles SHALL retain their existing animation and collision behavior.

#### Scenario: Alert expires during centering
- **WHEN** an enemy preparing to attack a hidden player loses its ALERT permission
- **THEN** preparation is cancelled and no attack is committed

#### Scenario: Bush destroyed or player emerges
- **WHEN** the player ceases to be hidden
- **THEN** ordinary detection and attack rules apply again
