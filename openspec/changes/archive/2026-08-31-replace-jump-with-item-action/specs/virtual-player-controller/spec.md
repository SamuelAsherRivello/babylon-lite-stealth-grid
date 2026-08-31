## MODIFIED Requirements

### Requirement: Virtual controller remains visible and usable

The game SHALL display one movement joystick in the lower-left and two action
buttons labeled `Item` and `Attack` in that left-to-right order in the
lower-right. The complete controller SHALL remain inside the visible game
frame on desktop and mobile after viewport or orientation changes.

#### Scenario: Controller appears at startup

- **WHEN** gameplay starts in a supported browser
- **THEN** the movement joystick, Item button, and Attack button are visible
- **AND** they do not overlap one another or extend outside the game frame

#### Scenario: Viewport changes

- **WHEN** the viewport size or orientation changes
- **THEN** the controller remains fully visible inside the game frame
- **AND** existing coordinate and control guidance remains legible without overlapping the controller

### Requirement: Jump functionality is absent

The player controller SHALL NOT expose, bind, or execute jump behavior. No
input, button, or animation state may lift the player or apply a jump arc.

#### Scenario: Jump input is unavailable

- **WHEN** the player uses the former jump control or any formerly bound jump input
- **THEN** no jump state, vertical offset, or jump animation is created

### Requirement: Item activation uses the held item

Activating Item by pointer press or keyboard key `C` SHALL attempt to use the
currently held item exactly once per activation. With no held item, activation
SHALL cause no runtime error, movement, state change, or animation. With a held
item, the item slot SHALL be cleared. Gold SHALL spawn a pickup from the
player's center toward the player's movement direction; wood and meat SHALL be
consumed without spawning a map pickup until their pickup implementations exist.

#### Scenario: Item activation with a held item

- **WHEN** the player presses Item or `C` while holding an item
- **THEN** the held item is used once and the item slot becomes empty
- **AND** gold spawns as a pickup from the player's center toward movement

#### Scenario: Item activation without a held item

- **WHEN** the player presses Item or `C` without holding an item
- **THEN** no gameplay action or animation occurs

### Requirement: Action buttons support simultaneous pointers

Item and Attack SHALL activate independently on pointer press and SHALL remain
usable while another pointer controls movement. Releasing, cancelling, or
moving one action pointer SHALL NOT reset the joystick or the other action.

#### Scenario: Former jump action is pressed while moving

- **WHEN** one pointer controls the joystick and a second pointer presses Item
- **THEN** the held item's use action begins without interrupting movement

#### Scenario: Player jumps while moving

- **WHEN** one pointer controls the joystick and a second pointer presses Item
- **THEN** the held item's use action begins without interrupting movement

#### Scenario: Separate action pointers are used

- **WHEN** different pointers press Item and Attack
- **THEN** each action receives its own activation
- **AND** each button's pressed appearance follows only its own active pointer state

### Requirement: Attack integrates without owning weapon behavior

Activating Attack SHALL request the game-owned weapon attack exactly once per
pointer press or `V` when a weapon is equipped. Without an equipped weapon, Attack
SHALL cause no runtime error, animation, or unrelated state change.

#### Scenario: Weapon attack is available

- **WHEN** the player presses Attack with a weapon equipped
- **THEN** the game-owned weapon attack is invoked once

#### Scenario: Weapon attack is unavailable

- **WHEN** the player presses Attack without a weapon equipped
- **THEN** gameplay continues without an error or attack animation
