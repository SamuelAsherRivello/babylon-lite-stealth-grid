## Purpose

Provide deterministic level-selectable camera behavior for fixed overviews, smooth player tracking, and screen-sized region navigation across origin-relative authored worlds.

## ADDED Requirements

### Requirement: Level-selectable camera mode
Each level SHALL select exactly one supported camera mode from `world-center-no-scroll`, `player-follow`, or `screen-by-screen`. Unsupported or missing mode data SHALL produce an actionable validation error rather than silently selecting different behavior.

#### Scenario: AI prepares camera metadata
- **WHEN** the AI creates or structurally updates a level
- **THEN** the level stores one supported camera mode and every required mode-specific parameter

### Requirement: World-center no-scroll mode
In `world-center-no-scroll` mode, the camera SHALL remain centered on the authored world bounds and SHALL not move in response to player movement.

#### Scenario: Player moves in fixed-view level
- **WHEN** the player changes world position while `world-center-no-scroll` is active
- **THEN** the camera center remains at the center of the authored world bounds

### Requirement: Player-follow mode
In `player-follow` mode, the camera SHALL keep the player within a configurable rectangular deadzone. The camera SHALL move only when the player crosses a deadzone boundary and SHALL clamp its visible rectangle to authored map bounds whenever the map is at least as large as the viewport on that axis.

#### Scenario: Player moves inside deadzone
- **WHEN** the player remains within the configured deadzone
- **THEN** the camera does not move on that axis

#### Scenario: Player crosses deadzone boundary
- **WHEN** the player moves beyond a deadzone boundary
- **THEN** the camera follows far enough to restore the player to that boundary without exceeding authored map bounds

#### Scenario: Map axis is smaller than viewport
- **WHEN** authored map bounds are smaller than the viewport on one axis
- **THEN** the camera centers that map axis rather than oscillating between incompatible clamps

### Requirement: Screen-by-screen mode
In `screen-by-screen` mode, the world SHALL be partitioned into viewport-sized regions anchored to game tile `(0,0)`. The camera SHALL remain fixed on the current region until the player crosses a region boundary, then target the adjacent region containing the player.

#### Scenario: Player remains within current region
- **WHEN** the player moves without crossing the current screen region boundary
- **THEN** the camera remains fixed on that region

#### Scenario: Player enters adjacent region
- **WHEN** the player crosses a horizontal or vertical region boundary
- **THEN** the camera targets the adjacent region containing the player and keeps the view within authored map bounds

#### Scenario: Regions extend into negative coordinates
- **WHEN** the player enters a screen region left of or below tile `(0,0)`
- **THEN** region selection and camera placement operate correctly with negative world coordinates

### Requirement: Consistent camera transform
The active camera transform SHALL be applied consistently to every world-space visual layer, actor layer, animated layer, coordinate conversion, and collision diagnostic while screen-space UI remains stationary.

#### Scenario: Camera moves
- **WHEN** either following or region transition changes the camera position
- **THEN** terrain, actors, animation, and diagnostics remain mutually aligned and HUD controls do not move with the world

### Requirement: Resize-stable logical viewport
Camera calculations SHALL use the level's logical viewport dimensions independently from physical render-surface resizing. Resizing SHALL update display scale without changing the selected world position or screen-region identity.

#### Scenario: Physical canvas resizes
- **WHEN** the browser render surface changes dimensions
- **THEN** the same logical world rectangle remains selected and is uniformly scaled to fit
