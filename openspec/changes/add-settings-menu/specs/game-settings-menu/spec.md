## Purpose

Provides an in-frame settings surface that matches the inspiration game's responsive placement, appearance, controls, and dismissal behavior.

## ADDED Requirements

### Requirement: Settings gear appearance and placement
The game SHALL show a circular gear control in the upper-right of the 9:16 game frame. The gear SHALL use the inspiration project's icon and visual treatment and SHALL preserve the proportions of a 64 by 64 control positioned 70 design units from the top and right edges of an 800-unit-wide composition.

#### Scenario: Gear appears in the game frame
- **WHEN** the game interface is available
- **THEN** the gear is visible above the game canvas and existing HUD controls
- **AND** it is operable by mouse, touch, and keyboard

#### Scenario: Gear scales with the frame
- **WHEN** the game is viewed in a large desktop viewport or a narrow portrait viewport
- **THEN** the gear keeps the same relative size and upper-right offsets within the game frame
- **AND** it does not drift according to browser-viewport dimensions

### Requirement: Coordinates UI naming and placement
The existing coordinate readout SHALL be named `Coordinates UI` throughout its implementation-facing HTML, CSS, JavaScript, and test identifiers. It SHALL remain in the upper-right area and SHALL be positioned directly below the settings gear with clear visual separation while preserving the gear's specified size and offsets.

#### Scenario: Coordinates UI appears below the gear
- **WHEN** the game interface is available
- **THEN** the Coordinates UI is displayed directly below the settings gear
- **AND** neither element overlaps the other

#### Scenario: Coordinates UI naming is consistent
- **WHEN** the coordinate readout implementation and tests are inspected
- **THEN** their component-level names identify the readout as `Coordinates UI`
- **AND** generic legacy names such as a standalone `coordinates` class or identifier are not used for the component

#### Scenario: Coordinates UI scales with the frame
- **WHEN** the game is viewed in a large desktop viewport or a narrow portrait viewport
- **THEN** the Coordinates UI remains below the gear with consistent frame-relative separation
- **AND** the gear retains its authored position

### Requirement: Settings window presentation
Activating the gear SHALL open one centered modal titled `Settings Menu` over a 50 percent black full-frame backdrop. The window SHALL match the inspiration project's dark blue gradient, light border, rounded corners, frame-relative proportions, and circular X close control.

#### Scenario: Open settings
- **WHEN** the player activates the closed settings gear
- **THEN** one Settings Menu window opens centered within the game frame
- **AND** the current rendered game remains visible beneath the dimmed backdrop
- **AND** focus moves into the modal

#### Scenario: Responsive modal composition
- **WHEN** the game frame changes size while the Settings Menu is open
- **THEN** the modal, title, controls, spacing, borders, X, and effects preserve their relative composition
- **AND** every control remains visible and operable without a viewport-specific reflow

### Requirement: Audio volume controls
The Settings Menu SHALL contain a `Music` slider and an `SFX` slider. Each slider SHALL accept integer values from 0 through 100, SHALL show a static `0` label at its left endpoint and `100` at its right endpoint, and SHALL reflect the current saved value without requiring a live numeric readout.

#### Scenario: Open with saved volume values
- **WHEN** the player opens the Settings Menu
- **THEN** both sliders display their current settings
- **AND** either slider displays 100 when it has no valid saved value

#### Scenario: Change a volume value
- **WHEN** the player drags a volume slider
- **THEN** the corresponding in-memory setting changes during the drag
- **AND** the new value is persisted immediately

#### Scenario: Mute an audio category
- **WHEN** the player moves Music or SFX to 0
- **THEN** audio playback created in that category uses zero output volume

### Requirement: Collider visibility control
The Settings Menu SHALL contain a checkbox labeled `Collider?` that controls the visibility of the existing terrain and player collision diagnostics without changing collision behavior.

#### Scenario: Enable collider visibility
- **WHEN** the player enables Collider
- **THEN** terrain and player collision diagnostics are visible
- **AND** the enabled value is persisted immediately

#### Scenario: Disable collider visibility
- **WHEN** the player disables Collider
- **THEN** collision diagnostics are hidden
- **AND** terrain and player collision behavior is unchanged

### Requirement: Reset settings
The Settings Menu SHALL show a `Reset` button below the volume and collider controls. Activating Reset SHALL restore Music and SFX to 100, restore Collider to off, remove the persisted game-settings document, update the visible controls immediately, and keep the menu open.

#### Scenario: Reset changed settings
- **WHEN** one or more settings differ from their defaults and the player activates Reset
- **THEN** both sliders immediately display 100
- **AND** Collider immediately displays off and its diagnostics are hidden
- **AND** the Settings Menu remains open and usable

#### Scenario: Reset default settings
- **WHEN** all settings already have default values and the player activates Reset
- **THEN** the controls remain at their defaults
- **AND** the Settings Menu remains open and usable

### Requirement: Settings dismissal
The player SHALL be able to close the Settings Menu by activating its X, activating the gear again, or activating the backdrop outside the panel. Interaction with modal content SHALL NOT dismiss the menu, and each close path SHALL restore focus to the gear.

#### Scenario: Close with X
- **WHEN** the player activates the modal's X control
- **THEN** the modal and backdrop close
- **AND** focus returns to the settings gear

#### Scenario: Toggle with gear
- **WHEN** the Settings Menu is open and the player activates the gear
- **THEN** the modal and backdrop close

#### Scenario: Close from backdrop only
- **WHEN** the player activates the backdrop outside the window
- **THEN** the modal closes
- **AND** interaction with a slider, checkbox, or Reset inside the window does not close it

### Requirement: Modal accessibility and input isolation
The Settings Menu SHALL expose modal-dialog semantics and an accessible title and labels. While it is open, pointer, touch, and keyboard input SHALL operate only the gear and modal controls and SHALL NOT activate the canvas, virtual controller, or underlying HUD controls.

#### Scenario: Operate settings by keyboard
- **WHEN** a keyboard user opens the Settings Menu
- **THEN** the dialog is announced with its `Settings Menu` title
- **AND** all settings controls and the X are reachable with visible focus

#### Scenario: Block underlying controls
- **WHEN** the Settings Menu is open and input occurs over the joystick, action buttons, or canvas
- **THEN** the underlying game controls do not receive that input
