# virtual-player-controller Specification

## Purpose
Provide responsive pointer and touch controls for X/Y player movement, item use, and weapon attacks while preserving the game's existing keyboard movement behavior.

## Requirements

### Requirement: Virtual controller remains visible and usable

The game SHALL display one movement joystick in the lower-left and two action buttons labeled `Item` and `Attack` in that left-to-right order in the lower-right. The complete controller SHALL remain inside the visible game frame on desktop and mobile after viewport or orientation changes.

#### Scenario: Controller appears at startup

- **WHEN** gameplay starts in a supported browser
- **THEN** the movement joystick, Item button, and Attack button are visible
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

### Requirement: Jump functionality is absent

The player controller SHALL NOT expose, bind, or execute jump behavior. No input, button, or animation state may lift the player or apply a jump arc.

#### Scenario: Jump input is unavailable

- **WHEN** the player uses the former jump control or any formerly bound jump input
- **THEN** no jump state, vertical offset, or jump animation is created

### Requirement: Item activation uses the held item

Activating Item by pointer press or keyboard key `C` SHALL attempt to use the currently held item exactly once per activation. With no held item, activation SHALL cause no runtime error, movement, state change, or animation. With a held item, the item slot SHALL be cleared. Gold SHALL spawn a pickup from the player's center toward the player's movement direction; wood and meat SHALL be consumed without spawning a map pickup until their pickup implementations exist.

#### Scenario: Item activation with a held item

- **WHEN** the player presses Item or `C` while holding an item
- **THEN** the held item is used once and the item slot becomes empty
- **AND** gold spawns as a pickup from the player's center toward movement

#### Scenario: Item activation without a held item

- **WHEN** the player presses Item or `C` without holding an item
- **THEN** no gameplay action or animation occurs

### Requirement: Action buttons support simultaneous pointers

Item and Attack SHALL activate independently on pointer press and SHALL remain usable while another pointer controls movement. Releasing, cancelling, or moving one action pointer SHALL NOT reset the joystick or the other action.

#### Scenario: Former jump action is pressed while moving

- **WHEN** one pointer controls the joystick and a second pointer presses Item
- **THEN** the held item's use action begins without interrupting movement

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

### Requirement: Attack integrates without owning weapon behavior

Activating Attack SHALL request the game-owned weapon attack exactly once per
pointer press when available. Without an equipped weapon, Attack SHALL cause
no runtime error or unrelated state change.

#### Scenario: Weapon attack is available

- **WHEN** the player presses Attack with a weapon equipped
- **THEN** the game-owned weapon attack is invoked once

#### Scenario: Weapon attack is unavailable

- **WHEN** the player presses Attack without an equipped weapon
- **THEN** gameplay continues without an error
