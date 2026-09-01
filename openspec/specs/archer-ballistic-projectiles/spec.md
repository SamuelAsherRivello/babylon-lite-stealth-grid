# archer-ballistic-projectiles Specification

## Purpose

Defines the archer arrow's directional release and visible ballistic flight so the player can move out of the way after a shot is committed.

## Requirements

### Requirement: Arrow targets the release snapshot
When the archer releases an arrow, the arrow SHALL use the player's position captured for that shot as its landing target. The arrow SHALL travel in the corresponding direction and SHALL NOT retarget a player who moves after release.

#### Scenario: Player moves after release
- **WHEN** the player leaves the captured target position while an arrow is airborne
- **THEN** the arrow continues toward the captured position and the player can evade it

#### Scenario: Left-facing release
- **WHEN** the archer is facing left at release
- **THEN** the arrow travels leftward and is angled in its travel direction

### Requirement: Arrow follows a visible arc
An airborne arrow SHALL rise slightly above the ground plane, continue through a near-horizontal midpoint, and descend toward its captured landing position. Its rendered angle SHALL follow its instantaneous direction of travel.

#### Scenario: Arrow rises
- **WHEN** an arrow has just been released
- **THEN** its height increases from the ground plane while it advances horizontally

#### Scenario: Arrow descends to target
- **WHEN** an arrow passes its arc midpoint and approaches its captured target
- **THEN** its height decreases until it reaches the ground at that target

### Requirement: Arrow lifecycle ends at landing
The arrow SHALL remain an active collider while airborne, SHALL be removed when its descending trajectory reaches the ground, and SHALL not remain visible or collidable after landing.

#### Scenario: Airborne collider
- **WHEN** an arrow is above the ground
- **THEN** its collider follows its current gameplay position

#### Scenario: Ground landing
- **WHEN** the arrow reaches ground height while descending
- **THEN** the arrow and its active collider are removed
