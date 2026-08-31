## Purpose

Provide responsive pointer and touch controls for X/Y player movement, jumping, and shooting while preserving the game's existing keyboard movement behavior.

## ADDED Requirements

### Requirement: Virtual controller remains visible and usable

The game SHALL display one movement joystick in the lower-left and two action buttons labeled `Jump` and `Shoot` in that left-to-right order in the lower-right. The complete controller SHALL remain inside the visible game frame on desktop and mobile after viewport or orientation changes.

#### Scenario: Controller appears at startup

- **WHEN** gameplay starts in a supported browser
- **THEN** the movement joystick, Jump button, and Shoot button are visible
- **AND** they do not overlap one another or extend outside the game frame

#### Scenario: Viewport changes

- **WHEN** the viewport size or orientation changes
- **THEN** the controller remains fully visible inside the game frame
- **AND** existing coordinate and control guidance remains legible without overlapping the controller

### Requirement: Joystick controls X/Y ground movement

The joystick SHALL produce a two-dimensional movement vector where left and right change world X and up and down change world Y. Twelve o'clock SHALL request positive Y, three o'clock positive X, six o'clock negative Y, and nine o'clock negative X.

#### Scenario: Joystick moves along cardinal directions

- **WHEN** the player holds the joystick at a cardinal direction
- **THEN** the player moves along the corresponding world X or Y direction

#### Scenario: Joystick moves diagonally

- **WHEN** the player holds the joystick diagonally
- **THEN** the player moves along both world axes
- **AND** diagonal movement does not exceed the configured maximum walking speed

### Requirement: Joystick movement is proportional and captured

The joystick SHALL ignore displacement within a central dead zone and SHALL scale movement intensity from the dead-zone edge to full displacement. A gesture that begins inside the joystick SHALL continue tracking the same pointer outside the joystick until release or cancellation.

#### Scenario: Stick remains near center

- **WHEN** the active pointer remains inside the joystick dead zone
- **THEN** the joystick requests no movement

#### Scenario: Stick is partially displaced

- **WHEN** the active pointer is held between the dead-zone edge and joystick edge
- **THEN** the requested movement speed is below the configured maximum

#### Scenario: Active pointer leaves the joystick

- **WHEN** a movement gesture begins inside the joystick and moves beyond its boundary
- **THEN** the gesture continues with its displacement clamped to full input
- **AND** releasing or cancelling that pointer immediately returns movement input to zero

### Requirement: Keyboard and joystick movement coexist

Existing WASD and arrow-key movement SHALL remain available. A displaced joystick SHALL control movement while active; otherwise currently held keyboard movement SHALL apply without requiring a new key press.

#### Scenario: Player uses only the keyboard

- **WHEN** the joystick is centered and a movement key is held
- **THEN** the player moves with the existing keyboard behavior

#### Scenario: Joystick temporarily overrides a held key

- **WHEN** a movement key is held and the joystick becomes displaced
- **THEN** joystick direction and intensity control movement
- **AND** releasing the joystick resumes the still-held keyboard movement

### Requirement: Jump is a non-stacking visual arc

Activating Jump while grounded SHALL lift the rendered player through a frame-rate-independent arc and return it exactly to its ground screen position. Jump SHALL NOT change the player's world X/Y position, movement bounds, or reported grid coordinates, and another Jump activation during the arc SHALL NOT restart or stack the jump.

#### Scenario: Player jumps while stationary

- **WHEN** the grounded player activates Jump
- **THEN** the sprite rises visibly and returns to its original ground screen position
- **AND** its world and grid coordinates remain unchanged

#### Scenario: Player moves while jumping

- **WHEN** the player supplies movement during an active jump
- **THEN** X/Y walking continues normally while the visual jump offset is applied

#### Scenario: Jump is pressed while airborne

- **WHEN** Jump is activated during the current jump arc
- **THEN** the current arc continues without restarting or stacking

#### Scenario: Jump runs at different frame rates

- **WHEN** the same jump is updated with different frame intervals
- **THEN** its peak, duration, and final screen offset are equivalent

### Requirement: Action buttons support simultaneous pointers

Jump and Shoot SHALL activate independently on pointer press and SHALL remain usable while another pointer controls movement. Releasing, cancelling, or moving one action pointer SHALL NOT reset the joystick or the other action button.

#### Scenario: Player jumps while moving

- **WHEN** one pointer is controlling the joystick and a second pointer presses Jump
- **THEN** the player begins jumping without interrupting joystick movement

#### Scenario: Separate action pointers are used

- **WHEN** different pointers press Jump and Shoot
- **THEN** each action receives its own activation
- **AND** each button's pressed appearance follows only its own active pointer state

### Requirement: Shoot integrates without owning projectile behavior

Activating Shoot SHALL request the game-owned shoot action exactly once per pointer press when that action is available. If the arrow-shooting implementation is not available, Shoot SHALL cause no runtime error or unrelated state change.

#### Scenario: Arrow shooting is available

- **WHEN** the player presses Shoot and the game has registered its shooting action
- **THEN** that action is invoked exactly once for the press

#### Scenario: Arrow shooting is unavailable

- **WHEN** the player presses Shoot before the shooting action has been integrated
- **THEN** gameplay continues without an error
- **AND** movement and jump state are unchanged

