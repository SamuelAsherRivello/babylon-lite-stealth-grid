# gameplay-pause Specification

## Purpose
Defines a reliable modal pause state that freezes mutable gameplay and input while keeping the current Babylon Lite scene visibly rendered.

## Requirements

### Requirement: Pause gameplay while settings is open
Opening the Settings Menu SHALL freeze player movement, virtual-controller actions, keyboard gameplay input, player animation progression, animated terrain progression, coordinate changes, and every other mutable game-time behavior until the menu closes.

#### Scenario: Open settings during movement
- **WHEN** the archer is moving and the player opens settings
- **THEN** movement stops at the current position
- **AND** coordinates, gameplay animations, and animated terrain do not advance while the menu remains open

#### Scenario: Attempt actions while paused
- **WHEN** Jump, Shoot, movement keys, or joystick input occurs while settings is open
- **THEN** no gameplay action or movement is produced

### Requirement: Continue rendering the paused scene
The render loop SHALL continue presenting the frozen game scene and Settings Menu while mutable game-time behavior is paused.

#### Scenario: View paused scene
- **WHEN** the Settings Menu remains open
- **THEN** the current terrain and archer remain visible beneath the backdrop
- **AND** the rendered surface does not become blank or stale because rendering stopped

### Requirement: Resume without hidden progress
Closing the Settings Menu SHALL resume from the same logical state without applying elapsed wall-clock time from the pause or replaying input that occurred while paused.

#### Scenario: Resume after a long pause
- **WHEN** the player closes settings after leaving it open for an arbitrary duration
- **THEN** the next gameplay update uses only active time after closing
- **AND** the archer does not jump, teleport, or fast-forward

#### Scenario: Release input during pause
- **WHEN** an input was active before settings opened and is released while settings is open
- **THEN** closing settings does not restore that input as active
