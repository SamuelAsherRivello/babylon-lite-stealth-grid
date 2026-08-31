## MODIFIED Requirements

### Requirement: Virtual controller remains visible and usable
The game SHALL display one movement joystick in the lower-left and two action
buttons labeled `Jump` and `Attack` in that left-to-right order in the lower-right.
The complete controller SHALL remain inside the visible game frame on desktop
and mobile after viewport or orientation changes.

#### Scenario: Controller appears at startup
- **WHEN** gameplay starts in a supported browser
- **THEN** the movement joystick, Jump button, and Attack button are visible
- **AND** they do not overlap or extend outside the game frame

#### Scenario: Viewport changes
- **WHEN** the viewport size or orientation changes
- **THEN** the controller remains fully visible inside the game frame

### Requirement: Action buttons support simultaneous pointers
Jump and Attack SHALL activate independently on pointer press and SHALL remain
usable while another pointer controls movement.

#### Scenario: Player jumps while moving
- **WHEN** one pointer controls the joystick and a second pointer presses Jump
- **THEN** the player begins jumping without interrupting joystick movement

#### Scenario: Attack is pressed while moving
- **WHEN** one pointer controls the joystick and a second pointer presses Attack
- **THEN** the equipped weapon attack begins without interrupting movement

#### Scenario: Separate action pointers are used
- **WHEN** different pointers press Jump and Attack
- **THEN** each action receives its own activation
- **AND** each button's pressed appearance follows only its own active pointer state

### Requirement: Attack integrates without owning weapon behavior
Activating Attack SHALL request the game-owned weapon attack exactly once per
pointer press when available. Without an equipped weapon, Attack SHALL cause no
runtime error or unrelated state change.

#### Scenario: Weapon attack is available
- **WHEN** the player presses Attack with a weapon equipped
- **THEN** the game-owned weapon attack is invoked once

#### Scenario: Weapon attack is unavailable
- **WHEN** the player presses Attack without a weapon equipped
- **THEN** gameplay continues without an error
