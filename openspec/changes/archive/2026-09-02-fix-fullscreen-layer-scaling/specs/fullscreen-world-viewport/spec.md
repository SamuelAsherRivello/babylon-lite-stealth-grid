## Purpose

Provides one reliable viewport contract so the Babylon tilemap, debug canvas, and game frame occupy the same full visible game area at browser zoom 100% and other supported viewport sizes.

## ADDED Requirements

### Requirement: Configurable viewport defaults
The viewport system SHALL store logical width, logical height, aspect ratio, fit mode, game-frame selector, render-canvas selector, debug-canvas selector, and QA diagnostics state as configuration values.

#### Scenario: Future game configuration
- **WHEN** a future game supplies different initial viewport values
- **THEN** the viewport system can initialize from those values without changing its alignment algorithm

### Requirement: Shared visible game rectangle
The game frame SHALL be the authoritative measured rectangle. The Babylon world render surface and debug canvas SHALL share its fitted child rectangle and SHALL preserve the configured tilemap aspect ratio at browser zoom 100%.

#### Scenario: Chrome or Edge at 100 percent
- **WHEN** the game is opened at browser zoom 100%
- **THEN** the complete current tilemap is rendered across the full game frame without being confined to a partial-width region

#### Scenario: Frame aspect ratio differs
- **WHEN** the measured game frame is not the configured aspect ratio
- **THEN** the complete tilemap is uniformly scaled into the frame with letterbox space, and the debug layer uses exactly the same fitted rectangle

### Requirement: Stable logical coordinates
World positions SHALL remain in the fixed logical tilemap coordinate system regardless of browser viewport size, device pixel ratio, or browser zoom.

#### Scenario: Browser viewport changes
- **WHEN** the browser window or effective viewport size changes
- **THEN** terrain, actors, pickups, projectiles, and effects retain their logical positions relative to the tilemap

### Requirement: Debug alignment
The debug canvas SHALL use the same visible rectangle and logical-to-screen transform as the Babylon world surface.

#### Scenario: Debug grid is enabled
- **WHEN** grid lines or collider diagnostics are visible
- **THEN** every debug grid boundary and collider remains aligned with the corresponding rendered tilemap location

### Requirement: Resize-safe interaction coordinates
Pointer coordinates SHALL be converted using the shared visible rectangle and logical viewport dimensions.

#### Scenario: User clicks a pickup after resizing
- **WHEN** the user clicks a gold pickup after changing browser size or zoom
- **THEN** the click targets the pickup at its rendered location without shifting the pickup or collider

### Requirement: Configurable QA diagnostics
The viewport system SHALL expose a QA flag that enables four-corner markers for the game frame, fitted tilemap viewport, and debug viewport, plus runtime rectangle logs for all three layers.

#### Scenario: QA validation is enabled
- **WHEN** the QA flag is enabled
- **THEN** the markers and logs remain available during Chrome and Edge validation at 80%, 100%, and 125% browser zoom
