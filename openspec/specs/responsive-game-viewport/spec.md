# responsive-game-viewport Specification

## Purpose
Ensure the world fills the drawable browser height while every UI element
preserves a consistent visible safe margin across desktop, mobile, and
fullscreen layouts.

## Requirements

### Requirement: World background covers the drawable viewport

The system SHALL extend the world background from the top edge to the bottom
edge of the drawable viewport without exposing page-background letterboxing.

#### Scenario: Narrow mobile fullscreen viewport

- **WHEN** the game enters fullscreen on a narrow portrait mobile display
- **THEN** the world background reaches the drawable top and bottom edges with
  no black strip above or below it

#### Scenario: Display cutout viewport

- **WHEN** the browser exposes drawable space around a display cutout
- **THEN** the world background extends into that space rather than reserving
  an opaque page-background band

### Requirement: World presentation preserves its proportions

The system SHALL present the logical world as a centered, full-height 9:16
layer without stretching sprites, tiles, colliders, or coordinate
relationships. The system MAY crop peripheral world content outside the left
and right edges of a narrower visible viewport.

#### Scenario: Viewport is narrower than 9:16

- **WHEN** the drawable viewport is narrower than the full-height 9:16 world
- **THEN** the world remains centered and proportional while equal peripheral
  regions may be cropped from its left and right edges

#### Scenario: Viewport is at least as wide as the world

- **WHEN** the drawable viewport is at least as wide as the full-height 9:16
  world
- **THEN** the complete proportional world remains visible and UI remains
  inside the game window rather than entering the surrounding page area

### Requirement: UI uses a visible safe-area rectangle

The system SHALL define the UI safe area from the intersection of the game
window and currently visible viewport, browser-reported device safe-area
insets, and the configured UI screen margin. The screen margin SHALL be
preserved inside every applicable edge of that visible game-window rectangle.

#### Scenario: Game window is narrower than the viewport

- **WHEN** surrounding page area is visible to the left and right of the game
- **THEN** all UI remains inside the game window and preserves its configured
  margin from the game-window edges

#### Scenario: Cropped world on a narrow viewport

- **WHEN** the world extends beyond the visible left and right viewport edges
- **THEN** the UI safe area's left and right edges remain inset from the visible
  intersection edges by the configured margin

#### Scenario: Device reports safe-area insets

- **WHEN** a device reports one or more non-zero safe-area insets
- **THEN** the UI safe area begins after each inset and preserves the configured
  screen margin inside it

### Requirement: Complete UI remains inside the safe area

The system SHALL keep the release version, settings gear, coordinate readout,
diagnostics, settings backdrop and dialog, virtual joystick, action controls,
and their labels completely inside the UI safe-area rectangle.

#### Scenario: UI initializes before viewport coordination

- **WHEN** the document paints before the first safe-area calculation completes
- **THEN** the UI remains hidden until its game-window intersection bounds have
  been applied, preventing an offscreen-to-onscreen startup snap

#### Scenario: Normal gameplay UI on mobile

- **WHEN** the game is displayed in a narrow mobile viewport
- **THEN** the version, gear, coordinates, joystick, and action controls each
  preserve their configured margin from the applicable safe-area edges

#### Scenario: Compact settings gear

- **WHEN** the settings gear is rendered at any supported viewport size
- **THEN** its complete control is 50 percent of the previous responsive size
  while its upper-right anchor remains unchanged

#### Scenario: Settings menu is open

- **WHEN** the settings menu opens in a viewport smaller than the world layer
- **THEN** the complete dialog border, close control, and settings content fit
  inside the UI safe area without horizontal or vertical clipping

### Requirement: Viewport changes update world crop and UI safe area

The system SHALL independently update the world presentation and UI safe-area
layout after window resize, orientation change, fullscreen change, or visual
viewport resize or scroll without requiring a page reload.

#### Scenario: Mobile browser chrome changes the visible viewport

- **WHEN** mobile browser chrome changes the visible viewport bounds
- **THEN** the world remains full-height and centered while the UI elements
  preserve their margin from the recalculated visible safe-area edges

#### Scenario: Device orientation changes

- **WHEN** the device changes between portrait and landscape
- **THEN** the world crop and UI safe area recalculate independently without
  stretching the world or clipping the UI
