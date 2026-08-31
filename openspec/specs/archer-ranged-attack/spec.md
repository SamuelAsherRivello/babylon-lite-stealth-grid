# Archer Ranged Attack Specification

## Purpose

Defines responsive archer animation states and a Space-triggered ranged attack
whose arrow follows a visible airborne arc before colliding with the ground.

## Requirements

### Requirement: Archer animation reflects its activity
The game SHALL show a looping idle animation while the archer is stationary,
a looping run animation while the archer is moving, and the complete shoot
animation while an attack is in progress. The shoot animation SHALL take
priority over idle and run animations.

#### Scenario: Stationary archer idles
- **WHEN** the archer is not moving and is not shooting
- **THEN** the game displays the looping idle animation

#### Scenario: Moving archer runs
- **WHEN** the archer is moving and is not shooting
- **THEN** the game displays the looping run animation

#### Scenario: Shooting overrides locomotion animation
- **WHEN** a shot begins while idle or running
- **THEN** the game displays the shoot animation from its first frame through
  its final frame without switching to another archer animation

### Requirement: Space triggers one complete shot
The game SHALL start one shooting sequence when the player presses Space and
SHALL ignore additional Space keydown events until that sequence finishes.
The archer SHALL remain in place for the duration of the sequence and SHALL
resume the idle or run state appropriate to current movement input afterward.

#### Scenario: Player initiates a shot
- **WHEN** the player presses Space while no shot is active
- **THEN** the archer begins one complete shooting sequence

#### Scenario: Repeated input does not restart the shot
- **WHEN** Space generates another keydown event while a shot is active
- **THEN** the active sequence continues without restarting and no additional
  arrow is released

#### Scenario: Movement is locked during shooting
- **WHEN** movement input is held during an active shot
- **THEN** the archer's world position remains unchanged until the shot ends

#### Scenario: Locomotion resumes after shooting
- **WHEN** the shoot animation ends while movement input is held
- **THEN** the archer enters its running state and movement resumes

### Requirement: Shot direction follows the player's cardinal intent
The archer SHALL remember the most recently tapped direction among up, down,
left, and right and SHALL release each arrow along exactly one of those four
cardinal directions. When current directional input contains more than one
axis, the game SHALL select the axis with the greatest absolute magnitude. If
the axis magnitudes are equal, the most recently tapped applicable direction
SHALL resolve the tie. Before the player has established a direction, the
archer and its first shot SHALL face right.

#### Scenario: Shoot to the right
- **WHEN** right is the resolved cardinal shot direction
- **THEN** the arrow travels toward increasing world X with no world Y movement

#### Scenario: Shoot to the left
- **WHEN** left is the resolved cardinal shot direction
- **THEN** the arrow travels toward decreasing world X with no world Y movement

#### Scenario: Shoot up
- **WHEN** up is the resolved cardinal shot direction
- **THEN** the arrow travels toward increasing world Y with no world X movement

#### Scenario: Shoot down
- **WHEN** down is the resolved cardinal shot direction
- **THEN** the arrow travels toward decreasing world Y with no world X movement

#### Scenario: Dominant magnitude resolves multi-axis input
- **WHEN** the player shoots while one directional input axis has a greater absolute magnitude than the other
- **THEN** the arrow travels in the cardinal direction of the greater-magnitude axis

#### Scenario: Recency resolves equal-magnitude input
- **WHEN** the player shoots while the directional input axes have equal non-zero magnitudes
- **THEN** the arrow travels in the applicable direction that was tapped most recently

#### Scenario: Released input remains remembered
- **WHEN** the player releases all directional input and then shoots
- **THEN** the arrow travels in the most recently tapped cardinal direction

#### Scenario: Default shot direction
- **WHEN** the player shoots before tapping any direction
- **THEN** the arrow travels right

#### Scenario: Shot has no diagonal component
- **WHEN** an arrow is released for any combination of directional input
- **THEN** exactly one component of its travel direction is non-zero

### Requirement: Arrow release is synchronized with the shoot animation
The game SHALL capture one resolved cardinal shot direction when a shooting
sequence begins and SHALL create exactly one arrow at the direction-appropriate
bow position when the shoot animation reaches its visual release moment. The
arrow SHALL not appear at the start or after the end of the animation, and
directional input received during the animation SHALL not redirect that shot.

#### Scenario: Animation reaches its release moment
- **WHEN** an active shoot animation reaches the configured release frame
- **THEN** exactly one arrow appears at the bow and begins flight in the direction captured when the sequence began

#### Scenario: Direction changes during shooting
- **WHEN** the player changes directional input after a shooting sequence begins but before its arrow is released
- **THEN** the active shot retains its captured cardinal direction

#### Scenario: Arrow is released facing right
- **WHEN** the archer releases an arrow while facing right
- **THEN** the arrow appears close to the bow on the archer's right side

#### Scenario: Arrow is released facing left
- **WHEN** the archer releases an arrow while facing left
- **THEN** the arrow appears close to the bow on the archer's left side with the same horizontal separation as a right-facing release

### Requirement: Arrow travels along a cardinal path
An active arrow SHALL advance at the configured projectile speed along its
resolved cardinal direction. Its sprite orientation and gameplay collider
SHALL match horizontal or vertical travel, and its position on the perpendicular
axis SHALL remain unchanged.

#### Scenario: Horizontal arrow is in flight
- **WHEN** time advances for an arrow traveling left or right
- **THEN** only its world X position changes and its sprite and collider remain horizontally oriented

#### Scenario: Vertical arrow is in flight
- **WHEN** time advances for an arrow traveling up or down
- **THEN** only its world Y position changes and its sprite and collider remain vertically oriented

### Requirement: Arrow has an active collider until removal
Each arrow SHALL have a gameplay collider that follows its projectile position
and orientation during flight. The game SHALL remove the arrow from view and
active projectile state when its swept path intersects a blocking collider or
when its complete collider leaves the game bounds. When an arrow hits a Warrior
during the Warrior's active defense pose, the arrow SHALL stop participating in
collisions, visibly bounce away from the Warrior, rotate slightly, fade from
fully visible to transparent, and be removed exactly 0.25 seconds after the
deflection begins.

#### Scenario: Collider follows a horizontal projectile
- **WHEN** a left- or right-moving arrow is active
- **THEN** its collider is centered on the arrow and uses the horizontal arrow dimensions

#### Scenario: Collider follows a vertical projectile
- **WHEN** an up- or down-moving arrow is active
- **THEN** its collider is centered on the arrow and swaps the horizontal arrow dimensions for vertical orientation

#### Scenario: Arrow intersects a blocker
- **WHEN** an arrow's swept cardinal path intersects a blocking collider
- **THEN** the arrow is removed without tunneling through the blocker

#### Scenario: Arrow leaves the game bounds
- **WHEN** an arrow's complete collider passes beyond any applicable edge of the game bounds
- **THEN** the arrow is removed from view and active projectile state

#### Scenario: Defended arrow begins its bounce
- **WHEN** an arrow hits a Warrior while that Warrior's defense pose is active
- **THEN** the arrow immediately stops causing collisions and begins moving away, spinning slightly, and fading out

#### Scenario: Defended arrow effect completes
- **WHEN** the deflected arrow has been visible for 0.25 seconds
- **THEN** it is fully transparent and removed from active projectile state
