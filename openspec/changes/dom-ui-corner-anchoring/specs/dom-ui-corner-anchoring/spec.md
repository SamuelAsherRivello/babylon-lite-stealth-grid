## Purpose

Provides a predictable DOM overlay layout that remains evenly inset and corner-anchored as the visible game rectangle and browser zoom change.

## ADDED Requirements

### Requirement: Consistent DOM overlay inset
The DOM UI layer SHALL use one shared 25 pixel inset from the top, right, bottom, and left edges of the visible game rectangle.

#### Scenario: Overlay at baseline scale
- **WHEN** the game is displayed at 100% browser scale
- **THEN** every DOM UI anchor is positioned 25 pixels from its corresponding game-rectangle edge

#### Scenario: Overlay resized by browser zoom
- **WHEN** browser scale changes to 50% or 150%
- **THEN** the DOM elements may resize, but their anchors continue to use the same logical four-edge inset

### Requirement: Corner and control-unit anchoring
The version label SHALL be anchored to the upper-left, the settings control SHALL be anchored to the upper-right, the Move control SHALL be anchored to the lower-left, and the Item and Attack controls SHALL remain a combined lower-right unit.

#### Scenario: All overlay controls are visible
- **WHEN** the visible game rectangle is rendered
- **THEN** the version and settings controls occupy opposite upper corners, Move occupies the lower-left, and Item plus Attack occupy the lower-right

#### Scenario: Lower-right unit resizes
- **WHEN** Item and Attack controls change rendered size due to browser scale
- **THEN** they remain grouped together and the unit remains anchored to the lower-right inset
