## MODIFIED Requirements

### Requirement: Settings window presentation
Activating the gear SHALL open one centered modal titled `Settings Menu` over a 50 percent black full-frame backdrop. The window SHALL show the Music and SFX controls and a `Developer Settings` button, while the five developer options and Reset control SHALL be available only in a second centered Developer Settings modal opened by that button. Both windows SHALL preserve the dark blue gradient, light border, rounded corners, frame-relative proportions, and circular X close control.

#### Scenario: Open settings
- **WHEN** the player activates the closed settings gear
- **THEN** one Settings Menu window opens centered within the game frame
- **AND** the Developer title and its five options are not shown directly in that window
- **AND** a `Developer Settings` button is shown

#### Scenario: Open developer settings
- **WHEN** the player activates `Developer Settings` in the Settings Menu
- **THEN** a Developer Settings window opens on top of the Settings Menu
- **AND** it contains the five existing developer options and Reset
- **AND** the Settings Menu remains available beneath it

#### Scenario: Keep both windows responsive
- **WHEN** the game frame changes size while either settings window is open
- **THEN** each visible window preserves its relative composition and remains operable

#### Scenario: Responsive modal composition
- **WHEN** the game frame changes size while the Settings Menu is open
- **THEN** the modal, title, controls, spacing, borders, X, and effects preserve their relative composition
- **AND** every control remains visible and operable without a viewport-specific reflow

### Requirement: Developer controls and reset placement
The five existing developer options SHALL retain their labels, values, persistence, and behavior, but SHALL be rendered only in the Developer Settings window. Reset SHALL be rendered in that window below those options and SHALL keep its existing reset behavior.

#### Scenario: Use developer controls
- **WHEN** the player changes any developer option in Developer Settings
- **THEN** the corresponding setting changes and persists exactly as it did in the Settings Menu

#### Scenario: Reset developer settings
- **WHEN** the player activates Reset in Developer Settings
- **THEN** all settings are restored to their defaults, visible controls update immediately, and the Developer Settings window remains open and usable

### Requirement: Settings dismissal
The player SHALL be able to close the active settings window with its X or backdrop outside its panel. The gear SHALL continue to close the top-level Settings Menu when it is active. Closing Developer Settings SHALL reveal the Settings Menu beneath it; closing Settings Menu SHALL close the complete settings flow. Interaction with modal content SHALL NOT dismiss the active window, and close operations SHALL restore focus to the control that opened that window when practical.

#### Scenario: Close developer settings with X
- **WHEN** the player activates the Developer Settings X
- **THEN** the Developer Settings window closes
- **AND** the Settings Menu remains open and visible

#### Scenario: Close settings with X or backdrop
- **WHEN** the player activates the Settings Menu X or its outside backdrop
- **THEN** the Settings Menu and any active developer window close
- **AND** focus returns to the settings gear

#### Scenario: Close with X
- **WHEN** the player activates the modal's X control
- **THEN** the active modal closes
- **AND** focus returns to its opener or the settings gear when the top-level menu closes

#### Scenario: Toggle with gear
- **WHEN** the Settings Menu is open and the player activates the gear
- **THEN** the modal and backdrop close

#### Scenario: Close from backdrop only
- **WHEN** the player activates the backdrop outside the active window
- **THEN** the active modal closes
- **AND** interaction with a slider, checkbox, button, or other modal content does not close it

### Requirement: Modal accessibility and input isolation
The Settings Menu and Developer Settings window SHALL expose modal-dialog semantics with accessible titles and labels. While Developer Settings is open, input SHALL operate only the active developer window and its close control, and SHALL NOT activate the Settings Menu content or underlying game controls.

#### Scenario: Operate nested settings by keyboard
- **WHEN** a keyboard user opens Developer Settings
- **THEN** focus moves into the Developer Settings window
- **AND** its controls and X are reachable with visible focus

#### Scenario: Operate settings by keyboard
- **WHEN** a keyboard user opens the Settings Menu
- **THEN** the dialog is announced with its `Settings Menu` title
- **AND** all settings controls and the X are reachable with visible focus

#### Scenario: Block inactive and underlying controls
- **WHEN** Developer Settings is open and input occurs outside its active panel
- **THEN** the underlying Settings Menu and game controls do not receive that input

#### Scenario: Block underlying controls
- **WHEN** the Settings Menu is open and input occurs over the joystick, action buttons, or canvas
- **THEN** the underlying game controls do not receive that input
