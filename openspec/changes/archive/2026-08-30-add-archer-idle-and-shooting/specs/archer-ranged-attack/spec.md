## Purpose

Defines responsive archer animation states and a Space-triggered ranged attack
whose arrow follows a visible airborne arc before colliding with the ground.

## ADDED Requirements

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

### Requirement: Shot direction follows archer facing
The archer SHALL retain its most recent horizontal facing direction and SHALL
release each arrow in that direction. Before the player has established a
direction, the archer and its first shot SHALL face right.

#### Scenario: Shoot to the right
- **WHEN** the archer most recently faced right and releases an arrow
- **THEN** the arrow travels toward increasing world X

#### Scenario: Shoot to the left
- **WHEN** the archer most recently faced left and releases an arrow
- **THEN** the arrow sprite is horizontally mirrored and travels toward
  decreasing world X

### Requirement: Arrow release is synchronized with the shoot animation
The game SHALL create exactly one arrow at the archer's bow position when the
shoot animation reaches its visual release moment. The arrow SHALL not appear
at the start or after the end of the animation.

#### Scenario: Animation reaches its release moment
- **WHEN** an active shoot animation reaches the configured release frame
- **THEN** exactly one arrow appears at the bow and begins flight

### Requirement: Arrow follows an airborne arc
An active arrow SHALL advance horizontally in its firing direction while a
gravity-driven vertical component raises it above and returns it to its ground
plane. Its rendered position SHALL make the rise and fall visible in the
top-down game view.

#### Scenario: Arrow is in flight
- **WHEN** time advances after an arrow is released and before it lands
- **THEN** its horizontal world position advances and its non-negative height
  follows the configured ballistic trajectory

### Requirement: Arrow has an active collider until landing
Each arrow SHALL have a gameplay collider that follows its projectile position
during flight. The game SHALL treat the arrow as landed when its downward path
reaches the ground plane, SHALL stop further collision participation, and
SHALL remove the arrow from view and active projectile state.

#### Scenario: Collider follows the projectile
- **WHEN** an arrow is airborne
- **THEN** its collider position matches the arrow's current gameplay position

#### Scenario: Arrow reaches the ground
- **WHEN** a descending arrow's height reaches the ground plane
- **THEN** the game registers a ground landing and removes the arrow and its
  collider
