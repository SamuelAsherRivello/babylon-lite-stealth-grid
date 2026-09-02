## Why

At browser zoom 100% in Chrome and Edge, the debug canvas and DOM frame can occupy the expected game window while Babylon-rendered tilemap content appears confined to only part of it. The current combination of browser CSS sizing, Babylon surface resizing, and logical pixel rendering does not reliably produce one shared visible game rectangle.

## What Changes

- Define one explicit game viewport rectangle with the current tilemap aspect ratio.
- Store the logical width, logical height, aspect ratio, fit mode, layer selectors, and QA flag as reusable viewport configuration.
- Make the Babylon tilemap render surface, debug canvas, and DOM game-frame geometry derive from that same rectangle.
- Preserve the complete 9:16 tilemap with uniform scaling and letterbox space when the frame has another aspect ratio.
- Keep world objects in fixed logical tilemap coordinates; never reposition them during browser resize or browser zoom changes.
- Handle device-pixel-ratio and browser zoom without changing logical game dimensions.
- Add runtime assertions, resize diagnostics, and screenshots at Chrome/Edge-like 100% viewport sizes.
- Keep QA corner markers and rectangle logs enabled behind a configuration flag until the user validates and approves the result.
- Leave existing DOM control behavior intact except for the shared geometry values required to align the layers.

## Capabilities

### New Capabilities

- `fullscreen-world-viewport`: Defines a stable, full-size shared viewport for Babylon world rendering, debug rendering, and the game frame across browser sizes and device pixel ratios.

### Modified Capabilities

None.

## Impact

Affected code includes canvas and engine sizing, game-frame layout geometry, Babylon render-target setup, debug-canvas alignment, pointer coordinate conversion, and resize QA. Gameplay coordinates, tilemap data, object placement, and UI interaction semantics remain unchanged.
