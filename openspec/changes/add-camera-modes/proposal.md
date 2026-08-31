## Why

The current renderer behaves as a fixed world view, while authored levels may extend beyond the initial screen around a declared game origin. A reusable camera controller is needed so each level can deliberately choose a fixed overview, smooth player tracking, or room-like screen transitions.

## What Changes

- Add three explicit camera modes: `world-center-no-scroll`, `player-follow`, and `screen-by-screen`.
- Preserve the current fixed-view behavior through `world-center-no-scroll`.
- Add player tracking with a configurable deadzone and clamping to authored map bounds.
- Add screen-sized region transitions when the player crosses a region boundary.
- Allow AI-prepared level metadata to select the camera mode and its parameters without requiring the human content editor to configure camera internals.
- Define camera behavior against origin-relative maps whose bounds may include negative world coordinates.

## Capabilities

### New Capabilities

- `camera-modes`: Defines selectable fixed, player-follow, and screen-by-screen camera behavior for authored levels.

### Modified Capabilities

None.

## Impact

- Adds a testable camera-state module and integrates its view transform with all Babylon Lite sprite layers and debug overlays.
- Extends authored level metadata and validation with camera mode selection and mode-specific parameters.
- Replaces direct per-layer zoom-only updates in `src/main.js` with a shared camera view applied consistently to terrain, actors, animated layers, and diagnostics.
- Requires no new production dependency.
