## Purpose

Ensure the game fills every drawable browser viewport while preserving all
gameplay content and controls across desktop, mobile, and fullscreen layouts.

## ADDED Requirements

### Requirement: Game background covers the drawable viewport

The system SHALL extend the game frame and its background from the top edge to
the bottom edge and from the left edge to the right edge of the drawable
viewport without exposing page-background letterboxing.

#### Scenario: Narrow mobile fullscreen viewport

- **WHEN** the game enters fullscreen on a narrow portrait mobile display
- **THEN** the game background reaches all four drawable viewport edges with no
  black strip above or below it

#### Scenario: Display cutout viewport

- **WHEN** the browser exposes drawable space around a display cutout
- **THEN** the game background extends into that space rather than reserving an
  opaque page-background band

### Requirement: Visible content remains inside the viewport

The system SHALL keep the complete logical game view, diagnostics, settings
control, coordinate readout, and virtual controls within the horizontally and
vertically visible viewport.

#### Scenario: Viewport is narrower than 9:16

- **WHEN** the drawable viewport is narrower than the logical game's 9:16
  aspect ratio
- **THEN** no gameplay content or control extends beyond either horizontal edge

#### Scenario: Viewport is wider than 9:16

- **WHEN** the drawable viewport is wider than the logical game's 9:16 aspect
  ratio
- **THEN** no gameplay content or control extends beyond either vertical edge

### Requirement: Gameplay artwork preserves its proportions

The system SHALL scale the logical game view uniformly so sprites, tiles,
colliders, and coordinate relationships are not stretched when the viewport
aspect ratio differs from 9:16. Any unused portion of the viewport SHALL use
the game background rather than the page's black background.

#### Scenario: Tall narrow display

- **WHEN** uniform scaling leaves space above or below the logical game view
- **THEN** sprites and tiles retain their proportions and the remaining space
  is filled with the game background

#### Scenario: Wide display

- **WHEN** uniform scaling leaves space beside the logical game view
- **THEN** sprites and tiles retain their proportions and the remaining space
  is filled with the game background

### Requirement: Interactive overlays respect visible safe areas

The system SHALL keep interactive controls inside browser-reported safe-area
insets while allowing the non-interactive game background to extend behind
those insets.

#### Scenario: Device reports safe-area insets

- **WHEN** a device reports one or more non-zero safe-area insets
- **THEN** the settings and virtual-controller hit targets remain inside the
  safe visible region

### Requirement: Viewport changes update the presentation

The system SHALL update canvas sizing, logical scaling, and overlay placement
after window resize, orientation change, fullscreen change, or visual-viewport
resize without requiring a page reload.

#### Scenario: Mobile browser chrome changes the visible height

- **WHEN** the visual viewport changes as mobile browser chrome appears or
  disappears
- **THEN** the game frame realigns to the current drawable bounds and continues
  to satisfy coverage and containment requirements

#### Scenario: Device orientation changes

- **WHEN** the device changes between portrait and landscape
- **THEN** the game reflows to the new viewport without clipping controls or
  stretching gameplay artwork
