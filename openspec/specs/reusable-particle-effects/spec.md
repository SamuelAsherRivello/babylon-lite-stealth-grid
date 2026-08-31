# reusable-particle-effects Specification

## Purpose
Provide reusable, controllable particle-effect animations translated from Aseprite-authored sprite sheets into the project's Babylon Lite rendering conventions.

## Requirements

### Requirement: Particle pack metadata is explicit
The system SHALL represent every supported particle effect with explicit runtime metadata containing its exported image, native frame dimensions, frame count, playback direction, frame duration, and default looping behavior, without requiring an Aseprite parser in the browser.

#### Scenario: Supplied pack is represented
- **WHEN** the Tiny Swords Particle FX catalog is inspected
- **THEN** it describes Dust 1, Dust 2, Explosion 1, Explosion 2, Fire 1, Fire 2, Fire 3, and Water Splash using their source-authored frame counts and 100 millisecond timing

#### Scenario: Authoring file is not loaded at runtime
- **WHEN** the browser loads particle effects
- **THEN** it requests exported image assets and does not request or parse the `.aseprite` source file

### Requirement: Every effect has an independently usable class
The system SHALL provide one concrete particle-effect class for each supported animation, organized under an effect-specific `src/particle-fx/` folder and usable independently of the preview screen.

#### Scenario: Consumer constructs one effect
- **WHEN** a consumer supplies the rendering and animation dependencies required by one concrete effect class
- **THEN** the class creates a sprite using the correct atlas, frame range, timing, display size, position, and render order

### Requirement: Particle playback is controllable
Every particle-effect instance SHALL expose `play()` and `stop()` operations. Calling `play()` SHALL start or restart its animation, and calling `stop()` SHALL halt frame advancement while leaving the sprite available to play again.

#### Scenario: Enabled particle preview playback loops
- **WHEN** the Particle FX Preview setting is enabled
- **THEN** every effect repeatedly plays its complete animation range

#### Scenario: Animation can stop and resume
- **WHEN** a consumer calls `stop()` on a playing effect and later calls `play()`
- **THEN** frame advancement stops after the first call and looping playback starts again after the second call

#### Scenario: Repeated controls remain safe
- **WHEN** `play()` or `stop()` is called more than once without the opposite operation between calls
- **THEN** the effect remains in the requested state without accumulating concurrent animations or throwing an error

### Requirement: All effects can be visibly previewed
When Particle FX Preview is enabled, the game SHALL display exactly one instance of each of the eight supplied particle animations in a single centered horizontal row at the center of the 576 by 1024 logical viewport, rendered above the existing terrain, player, and animated-terrain sprites. When disabled, the row SHALL be hidden and its animations SHALL be stopped.

#### Scenario: Preview row fits the logical viewport
- **WHEN** the preview is rendered
- **THEN** eight 64 by 64 display cells occupy a 512-pixel-wide row from X 32 through X 544 and are vertically centered from Y 480 through Y 544

#### Scenario: Native atlas geometry is preserved
- **WHEN** a 192 by 192 Explosion or Water Splash frame is displayed in the preview
- **THEN** the atlas uses its native 192 by 192 frame boundaries while the preview sprite is displayed within its assigned 64 by 64 cell

#### Scenario: Disabled particle preview is inactive
- **WHEN** Particle FX Preview is disabled
- **THEN** no particle preview sprite is visible and none of its eight animations advances

### Requirement: Preview debug settings are persisted and default off
The Settings menu SHALL provide independent `Particle FX Preview?` and `Animated Tile (Preview)` boolean controls. Both controls SHALL default to off, SHALL persist valid selections using the existing settings persistence mechanism, and SHALL return to off when settings are reset.

#### Scenario: New session uses hidden previews
- **WHEN** no saved preview settings exist
- **THEN** both preview checkboxes are unchecked, the particle row is hidden, and the animated Water Foam tile is hidden

#### Scenario: Preview choices persist
- **WHEN** a user enables either preview and reloads the application
- **THEN** the corresponding checkbox and preview restore to enabled while the other preview retains its independently persisted value

#### Scenario: Reset disables previews
- **WHEN** the user resets Settings after enabling either preview
- **THEN** both preview checkboxes become unchecked and both previews become hidden and stopped

### Requirement: Animated tile preview is independently controllable
When Animated Tile (Preview) is enabled, the game SHALL show and loop the existing Water Foam animation at its current bottom-left location. When disabled, the Water Foam tile SHALL be hidden and its animation SHALL be stopped without changing Particle FX Preview.

#### Scenario: Animated tile can be enabled alone
- **WHEN** Animated Tile (Preview) is enabled while Particle FX Preview remains disabled
- **THEN** the Water Foam animation is visible and looping at the bottom-left while the centered particle row remains hidden

#### Scenario: Particle row can be enabled alone
- **WHEN** Particle FX Preview is enabled while Animated Tile (Preview) remains disabled
- **THEN** the centered particle row is visible and looping while the Water Foam tile remains hidden

### Requirement: Authoring and runtime assets are preserved separately
The project SHALL preserve the original `.aseprite` source in a non-public authoring-assets location and SHALL copy all eight exported PNG sprite sheets into a browser-served particle-assets location without modifying the supplied originals.

#### Scenario: Production build contains only runtime requests
- **WHEN** the production application is built and loaded
- **THEN** all eight PNG sprite sheets resolve successfully and the authoring source is not part of the browser's asset-loading path
