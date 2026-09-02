## Why

The DOM UI currently does not maintain a consistent inset from the visible game rectangle, so controls can appear unevenly spaced or drift relative to the game when browser zoom changes. A shared 25 px margin and explicit corner anchoring will make the overlay predictable at 50%, 100%, and 150% browser scale.

## What Changes

- Define one shared 25 px DOM UI inset applied to the top, right, bottom, and left edges of the visible game rectangle.
- Anchor the version label to the upper-left corner and the settings gear to the upper-right corner.
- Keep the Item and Attack controls together as a lower-right control unit.
- Anchor the Move control to the lower-left corner.
- Preserve DOM control sizing and interaction behavior while allowing elements to resize with browser zoom.
- Remove positioning relationships that cause controls to drift or lose their edge margin during resize and zoom.

## Capabilities

### New Capabilities

- `dom-ui-corner-anchoring`: Defines the stable inset and corner/unit placement contract for the DOM game overlay.

### Modified Capabilities

- None.

## Impact

Affected code includes the existing DOM overlay structure and CSS positioning for the version, settings, movement, item, and attack controls. Babylon world rendering, gameplay coordinates, control semantics, and external dependencies remain unchanged.
